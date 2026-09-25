/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { event } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddPhotosForm from "./add-photos-form";
import DeletePhotoButton from "./delete-photo-button";

export default async function EventAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ev = await db.query.event.findFirst({
    where: eq(event.id, id),
    with: { photos: { orderBy: (p, { asc }) => asc(p.position) } },
  });

  if (!ev) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{ev.title}</h1>
        <p className="text-sm text-haze">/archivio/eventi/{ev.slug}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foto di anteprima ({ev.photos.length})</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {ev.photos.map((p) => (
            <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg">
              {/* img semplice qui: sono anteprime admin, non serve l'ottimizzazione di next/image */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              <DeletePhotoButton photoId={p.id} eventId={ev.id} />
            </div>
          ))}
          {ev.photos.length === 0 && <p className="col-span-full text-haze">Nessuna foto ancora.</p>}
        </CardContent>
      </Card>

      <AddPhotosForm eventId={ev.id} />
    </div>
  );
}
