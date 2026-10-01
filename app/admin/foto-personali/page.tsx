import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import DeletePersonalPhotoButton from "./delete-photo-button";
import DeleteAllButton from "./delete-all-button";

function statusFor(igHandle: string, codes: Awaited<ReturnType<typeof db.query.downloadCode.findMany>>) {
  const code = codes.find((c) => c.igHandle === igHandle);
  if (!code) return { label: "Nessun codice generato", variant: "outline" as const };
  if (code.usedCount > 0) return { label: `Scaricato ${code.usedCount}×`, variant: "default" as const };
  if (code.revoked) return { label: "Revocato, mai scaricato", variant: "secondary" as const };
  if (code.expiresAt.getTime() < Date.now()) return { label: "Scaduto, mai scaricato", variant: "secondary" as const };
  return { label: "Codice attivo, in attesa", variant: "outline" as const };
}

export default async function FotoPersonaliPage() {
  const photos = await db.query.personalPhoto.findMany({
    orderBy: (p, { desc }) => desc(p.createdAt),
  });
  const codes = await db.query.downloadCode.findMany({
    orderBy: (c, { desc }) => desc(c.createdAt),
  });

  const groups = new Map<string, typeof photos>();
  for (const photo of photos) {
    if (!groups.has(photo.igHandle)) groups.set(photo.igHandle, []);
    groups.get(photo.igHandle)!.push(photo);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Foto personali</h1>
        <Link href="/admin/foto-personali/nuovo" className={buttonVariants({ variant: "outline", size: "sm" })}>
          + Carica altre foto
        </Link>
      </div>

      {[...groups.entries()].map(([igHandle, groupPhotos]) => {
        const status = statusFor(igHandle, codes);
        return (
          <Card key={igHandle}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <div className="flex items-center gap-3">
                <CardTitle>@{igHandle}</CardTitle>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <DeleteAllButton igHandle={igHandle} />
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {groupPhotos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 140px, 25vw"
                    className="object-cover"
                  />
                  <DeletePersonalPhotoButton photoId={photo.id} />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {groups.size === 0 && <p className="text-haze">Nessuna foto personale caricata ancora.</p>}
    </div>
  );
}