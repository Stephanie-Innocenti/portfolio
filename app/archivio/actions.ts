"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { downloadCode } from "@/lib/schema";
import { hashCode } from "@/lib/download-codes";
import { normalizeHandle } from "@/lib/handle";
import { grantPhotoAccess } from "@/lib/photo-access";

type Result = { ok: true; igHandle: string } | { ok: false; message: string };

export async function requestDownloadLink(igHandle: string, code: string): Promise<Result> {
  const handle = normalizeHandle(igHandle);
  if (!handle || !code.trim()) {
    return { ok: false, message: "Inserisci nickname e password." };
  }

  const row = await db.query.downloadCode.findFirst({
    where: and(eq(downloadCode.igHandle, handle), eq(downloadCode.codeHash, hashCode(code))),
  });

  // Stesso messaggio per "non trovato" e per gli altri casi non validi:
  // non deve essere possibile capire, tentando a caso, se un nickname esiste.
  const generic = { ok: false as const, message: "Nickname o password non corretti." };

  if (!row) return generic;
  if (row.revoked) return generic;
  if (row.usedCount >= row.maxUses) return generic;
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, message: "Questa password è scaduta. Scrivimi per riceverne una nuova." };
  }

  await db
    .update(downloadCode)
    .set({ usedCount: row.usedCount + 1 })
    .where(eq(downloadCode.id, row.id));

  await grantPhotoAccess(handle);
  return { ok: true, igHandle: handle };
}
