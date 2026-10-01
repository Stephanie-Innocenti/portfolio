import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { ZipArchive } from "archiver";
import { PassThrough } from "stream";
import { db } from "@/lib/db";
import { personalPhoto } from "@/lib/schema";
import { hasPhotoAccess } from "@/lib/photo-access";

export const runtime = "nodejs"; // archiver e gli stream Node non funzionano sul runtime edge

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ighandle: string }> }) {
  const { ighandle } = await params;
  const igHandle = ighandle;

  // Controllo indipendente da quello della pagina: questa URL è raggiungibile
  // direttamente, quindi deve difendersi da sola.
  if (!(await hasPhotoAccess(igHandle))) {
    return new Response("Accesso non valido o scaduto.", { status: 403 });
  }

  const photos = await db.query.personalPhoto.findMany({ where: eq(personalPhoto.igHandle, igHandle) });
  if (photos.length === 0) {
    return new Response("Nessuna foto trovata.", { status: 404 });
  }

  const archive = new ZipArchive({ zlib: { level: 6 } });
  const stream = new PassThrough();
  archive.pipe(stream);

  // Scarica ogni foto da R2 e la aggiunge allo zip. In piena qualità: nessuna
  // ricompressione, il file va nello zip esattamente come è salvato.
  (async () => {
    for (const [i, p] of photos.entries()) {
      try {
        const res = await fetch(p.url);
        if (!res.ok) continue;
        const buffer = Buffer.from(await res.arrayBuffer());
        const ext = p.url.split(".").pop()?.split("?")[0] || "jpg";
        archive.append(buffer, { name: `foto-${i + 1}.${ext}` });
      } catch {
        // Una foto irraggiungibile non deve far fallire tutto lo zip.
      }
    }
    archive.finalize();
  })();

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${igHandle}-foto.zip"`,
    },
  });
}
