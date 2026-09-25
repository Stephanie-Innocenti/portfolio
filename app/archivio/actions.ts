"use server";

import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { downloadCode } from "@/lib/schema";
import { hashCode } from "@/lib/download-codes";

type Result = { ok: true; url: string } | { ok: false; message: string };

export async function requestDownloadLink(igHandle: string, code: string): Promise<Result> {
  const handle = igHandle.trim().replace(/^@/, "").toLowerCase();
  if (!handle || !code.trim()) {
    return { ok: false, message: "Inserisci nickname e password." };
  }

  const row = await db.query.downloadCode.findFirst({
    where: and(
      eq(downloadCode.igHandle, handle),
      eq(downloadCode.codeHash, hashCode(code)),
      eq(downloadCode.revoked, false),
    ),
  });

  // Stesso messaggio per "non trovato" e per gli altri casi non validi:
  // non deve essere possibile capire, tentando a caso, se un nickname esiste.
  const generic = { ok: false as const, message: "Nickname o password non corretti." };

  if (!row) return generic;
  if (row.usedCount >= row.maxUses) return generic;
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, message: "Questa password è scaduta. Scrivimi per riceverne una nuova." };
  }

  const updated = await db
    .update(downloadCode)
    .set({ usedCount: row.usedCount + 1 })
    .where(
      and(
        eq(downloadCode.id, row.id),
        eq(downloadCode.revoked, false),
        lt(downloadCode.usedCount, downloadCode.maxUses),
        gt(downloadCode.expiresAt, new Date()),
      ),
    )
    .returning({ id: downloadCode.id });

  if (!updated.length) return generic;

  return { ok: true, url: row.swissTransferUrl };
}
