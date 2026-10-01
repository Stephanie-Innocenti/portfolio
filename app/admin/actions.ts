"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@/lib/db";
import { event, photo, downloadCode, personalPhoto } from "@/lib/schema";
import { generateCode, hashCode } from "@/lib/download-codes";
import { normalizeHandle } from "@/lib/handle";
import { requireAdmin } from "@/lib/require-admin";
import { r2, R2_BUCKET, publicUrlForKey, deleteFromR2, keyFromPublicUrl } from "@/lib/r2";

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

export async function createEvent(input: { title: string; year: number; coverImageUrl: string; photoUrls: string[] }) {
  await requireAdmin();

  const title = input.title.trim();
  const coverImageUrl = input.coverImageUrl.trim();
  const slug = slugify(title);
  if (!title || !Number.isInteger(input.year) || input.year < 1900 || input.year > 2200 || !isHttpUrl(coverImageUrl)) {
    return { ok: false as const, message: "Titolo, anno e immagine di copertina sono obbligatori." };
  }
  if (!slug) return { ok: false as const, message: "Il titolo non produce un nome evento valido." };
  if (!Array.isArray(input.photoUrls) || input.photoUrls.some((url) => !isHttpUrl(url))) {
    return { ok: false as const, message: "Ogni URL delle foto deve iniziare con http:// o https://." };
  }
  if (await db.query.event.findFirst({ where: eq(event.slug, slug) })) {
    return { ok: false as const, message: "Esiste già un evento con questo titolo." };
  }

  const [createdEvent] = await db
    .insert(event)
    .values({ id: crypto.randomUUID(), slug, title, year: input.year, coverImageUrl })
    .returning();

  if (input.photoUrls.length) {
    await db.insert(photo).values(
      input.photoUrls.map((url, index) => ({ id: crypto.randomUUID(), eventId: createdEvent.id, url, position: index })),
    );
  }

  revalidatePath("/admin");
  revalidatePath("/archivio");
  return { ok: true as const, eventId: createdEvent.id };
}

export async function addPhotos(eventId: string, urls: string[]) {
  await requireAdmin();

  if (!urls.length) return { ok: false as const, message: "Carica almeno una foto." };
  if (urls.some((url) => !isHttpUrl(url))) {
    return { ok: false as const, message: "Ogni URL deve iniziare con http:// o https://." };
  }
  if (!(await db.query.event.findFirst({ where: eq(event.id, eventId) }))) {
    return { ok: false as const, message: "Evento non trovato." };
  }

  const existing = await db.query.photo.findMany({ where: eq(photo.eventId, eventId) });
  const startPosition = existing.length;
  await db.insert(photo).values(
    urls.map((url, index) => ({ id: crypto.randomUUID(), eventId, url, position: startPosition + index })),
  );

  revalidatePath(`/admin/eventi/nuovo/${eventId}`);
  revalidatePath("/archivio");
  return { ok: true as const };
}

export async function deletePhoto(photoId: string, eventId: string) {
  await requireAdmin();
  const row = await db.query.photo.findFirst({ where: eq(photo.id, photoId) });
  if (row) {
    try {
      await deleteFromR2(keyFromPublicUrl(row.url));
    } catch {
      // Database cleanup should not depend on temporary R2 availability.
    }
  }
  await db.delete(photo).where(eq(photo.id, photoId));
  revalidatePath(`/admin/eventi/nuovo/${eventId}`);
}

export async function createUploadUrl(fileName: string, contentType: string, prefix: string) {
  await requireAdmin();

  if (!contentType.startsWith("image/")) throw new Error("Puoi caricare solo file immagine.");
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const safePrefix = prefix.replace(/^\/+|\/+$/g, "").replace(/\\/g, "/");
  const key = `${safePrefix}/${crypto.randomUUID()}-${safeName}`;
  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 60 * 10 },
  );

  return { uploadUrl, publicUrl: publicUrlForKey(key) };
}

export async function addPersonalPhotos(igHandleRaw: string, eventId: string | null, urls: string[]) {
  await requireAdmin();

  const igHandle = normalizeHandle(igHandleRaw);
  if (!igHandle || urls.length === 0) {
    return { ok: false as const, message: "Nickname e almeno una foto sono obbligatori." };
  }
  if (urls.some((url) => !isHttpUrl(url))) {
    return { ok: false as const, message: "Ogni URL deve iniziare con http:// o https://." };
  }
  if (eventId && !(await db.query.event.findFirst({ where: eq(event.id, eventId) }))) {
    return { ok: false as const, message: "Evento non trovato." };
  }

  await db.insert(personalPhoto).values(
    urls.map((url) => ({ id: crypto.randomUUID(), igHandle, eventId: eventId || null, url })),
  );
  revalidatePath("/admin/foto-personali");
  return { ok: true as const, count: urls.length };
}

export async function countPersonalPhotos(igHandleRaw: string) {
  await requireAdmin();
  const igHandle = normalizeHandle(igHandleRaw);
  if (!igHandle) return 0;
  const rows = await db.query.personalPhoto.findMany({ where: eq(personalPhoto.igHandle, igHandle) });
  return rows.length;
}

export async function deletePersonalPhoto(photoId: string) {
  await requireAdmin();
  const row = await db.query.personalPhoto.findFirst({ where: eq(personalPhoto.id, photoId) });
  if (row) {
    try {
      await deleteFromR2(keyFromPublicUrl(row.url));
    } catch {
      // Database cleanup should not depend on temporary R2 availability.
    }
  }
  await db.delete(personalPhoto).where(eq(personalPhoto.id, photoId));
  revalidatePath("/admin/foto-personali");
}

export async function deleteAllPersonalPhotosForHandle(igHandleRaw: string) {
  await requireAdmin();
  const igHandle = normalizeHandle(igHandleRaw);
  const rows = await db.query.personalPhoto.findMany({ where: eq(personalPhoto.igHandle, igHandle) });
  await Promise.all(
    rows.map((row) =>
      deleteFromR2(keyFromPublicUrl(row.url)).catch(() => {
        // Database cleanup should not depend on temporary R2 availability.
      }),
    ),
  );
  await db.delete(personalPhoto).where(eq(personalPhoto.igHandle, igHandle));
  revalidatePath("/admin/foto-personali");
}

export async function deleteEvent(eventId: string) {
  await requireAdmin();
  const existing = await db.query.event.findFirst({
    where: eq(event.id, eventId),
    with: { photos: true },
  });
  if (!existing) return { ok: false as const, message: "Evento non trovato." };
  if (existing.photos.length > 0) {
    return { ok: false as const, message: "Rimuovi tutte le foto prima di eliminare l'evento." };
  }

  try {
    await deleteFromR2(keyFromPublicUrl(existing.coverImageUrl));
  } catch {
    // Database cleanup should not depend on temporary R2 availability.
  }
  await db.delete(event).where(eq(event.id, eventId));
  revalidatePath("/admin");
  revalidatePath("/archivio");
  revalidatePath(`/archivio/eventi/${existing.slug}`);
  return { ok: true as const };
}

export async function createDownloadCode(formData: FormData) {
  await requireAdmin();

  const igHandle = normalizeHandle(String(formData.get("igHandle") ?? ""));
  const eventId = String(formData.get("eventId") ?? "") || null;
  const hours = Number(formData.get("hours") ?? 48);
  const maxUses = Number(formData.get("maxUses") ?? 3);
  if (!igHandle) return { ok: false as const, message: "Il nickname è obbligatorio." };
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
    swissTransferUrl: "",
    eventId,
    expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
    maxUses,
  });
  revalidatePath("/admin");
  return { ok: true as const, code, igHandle };
}

export async function revokeCode(id: string) {
  await requireAdmin();
  await db.update(downloadCode).set({ revoked: true }).where(eq(downloadCode.id, id));
  revalidatePath("/admin/codici");
}

export async function deleteDownloadCode(id: string) {
  await requireAdmin();
  await db.delete(downloadCode).where(eq(downloadCode.id, id));
  revalidatePath("/admin");
}
