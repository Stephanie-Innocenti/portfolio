"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { event, photo, downloadCode } from "@/lib/schema";
import { generateCode, hashCode } from "@/lib/download-codes";
import { requireAdmin } from "@/lib/require-admin";

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // toglie accenti
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createEvent(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const year = Number(formData.get("year"));
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  const photoUrlsRaw = String(formData.get("photoUrls") ?? "");
  const slug = slugify(title);
  const urls = photoUrlsRaw
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  if (!title || !Number.isInteger(year) || year < 1900 || year > 2200 || !isHttpUrl(coverImageUrl)) {
    return { ok: false as const, message: "Titolo, anno e immagine di copertina sono obbligatori." };
  }

  if (!slug) return { ok: false as const, message: "Il titolo non produce un nome evento valido." };
  if (urls.some((url) => !isHttpUrl(url))) {
    return { ok: false as const, message: "Ogni URL delle foto deve iniziare con http:// o https://." };
  }
  if (await db.query.event.findFirst({ where: eq(event.slug, slug) })) {
    return { ok: false as const, message: "Esiste già un evento con questo titolo." };
  }

  const [ev] = await db
    .insert(event)
    .values({ id: crypto.randomUUID(), slug, title, year, coverImageUrl })
    .returning();

  if (urls.length) {
    await db.insert(photo).values(urls.map((url, i) => ({ id: crypto.randomUUID(), eventId: ev.id, url, position: i })));
  }

  revalidatePath("/admin");
  revalidatePath("/archivio");
  return { ok: true as const, eventId: ev.id };
}

export async function addPhotos(eventId: string, urlsRaw: string) {
  await requireAdmin();

  const urls = urlsRaw
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);
  if (!urls.length) return { ok: false as const, message: "Incolla almeno un URL." };
  if (urls.some((url) => !isHttpUrl(url))) {
    return { ok: false as const, message: "Ogni URL deve iniziare con http:// o https://." };
  }

  if (!(await db.query.event.findFirst({ where: eq(event.id, eventId) }))) {
    return { ok: false as const, message: "Evento non trovato." };
  }

  const existing = await db.query.photo.findMany({ where: eq(photo.eventId, eventId) });
  const startPosition = existing.length;

  await db
    .insert(photo)
    .values(urls.map((url, i) => ({ id: crypto.randomUUID(), eventId, url, position: startPosition + i })));

  revalidatePath(`/admin/eventi/${eventId}`);
  revalidatePath(`/archivio`);
  return { ok: true as const };
}

export async function deletePhoto(photoId: string, eventId: string) {
  await requireAdmin();
  await db.delete(photo).where(and(eq(photo.id, photoId), eq(photo.eventId, eventId)));
  revalidatePath(`/admin/eventi/${eventId}`);
}

export async function createDownloadCode(formData: FormData) {
  await requireAdmin();

  const igHandle = String(formData.get("igHandle") ?? "").trim().replace(/^@/, "").toLowerCase();
  const swissTransferUrl = String(formData.get("swissTransferUrl") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "") || null;
  const hours = Number(formData.get("hours") ?? 48);
  const maxUses = Number(formData.get("maxUses") ?? 3);

  if (!igHandle || !swissTransferUrl) {
    return { ok: false as const, message: "Nickname e link SwissTransfer sono obbligatori." };
  }
  if (!isHttpUrl(swissTransferUrl)) {
    return { ok: false as const, message: "Il link SwissTransfer deve iniziare con http:// o https://." };
  }
  if (!Number.isFinite(hours) || hours <= 0 || hours > 8760 || !Number.isInteger(maxUses) || maxUses < 1) {
    return { ok: false as const, message: "Durata e numero massimo di utilizzi non sono validi." };
  }
  if (eventId && !(await db.query.event.findFirst({ where: eq(event.id, eventId) }))) {
    return { ok: false as const, message: "Evento non trovato." };
  }

  const code = generateCode();

  await db.insert(downloadCode).values({
    id: crypto.randomUUID(),
    igHandle,
    codeHash: hashCode(code),
    swissTransferUrl,
    eventId,
    expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
    maxUses,
  });

  revalidatePath("/admin/codici");
  // Il codice in chiaro esiste solo in questo istante: va mostrato ora, non sarà più recuperabile.
  return { ok: true as const, code, igHandle };
}

export async function revokeCode(id: string) {
  await requireAdmin();
  await db.update(downloadCode).set({ revoked: true }).where(eq(downloadCode.id, id));
  revalidatePath("/admin/codici");
}
