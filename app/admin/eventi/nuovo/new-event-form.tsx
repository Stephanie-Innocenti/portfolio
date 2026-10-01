"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhotoUploader from "@/app/admin/photo-uploader";
import { createEvent } from "../../actions";

export default function NewEventForm() {
  const router = useRouter();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const eventSlug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const uploadPrefix = `eventi/${year}/${eventSlug || "nuovo-evento"}`;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createEvent({
          title,
          year: Number(year),
          coverImageUrl: coverUrl,
          photoUrls,
        });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        router.push(`/admin/eventi/nuovo/${result.eventId}`);
      } catch {
        setError("Non è stato possibile creare l'evento. Riprova tra poco.");
      }
    });
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Nuovo evento</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Nome della fiera</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Es. Fiera Milano"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="year">Anno</Label>
            <Input
              id="year"
              name="year"
              type="number"
              min="1900"
              max="2200"
              required
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>

          <input type="hidden" name="coverImageUrl" value={coverUrl} />
          <input type="hidden" name="photoUrls" value={photoUrls.join("\n")} />

          <div className="flex flex-col items-center gap-2.5">
            <Label className="text-center">Immagine di copertina</Label>
            {coverUrl && (
              <img src={coverUrl} alt="Anteprima della copertina selezionata" className="aspect-[16/7] w-full rounded-md object-cover" />
            )}
            <PhotoUploader
              prefix={`${uploadPrefix}/copertina`}
              label={coverUrl ? "Sostituisci copertina" : "Scegli copertina"}
              multiple={false}
              centered
              onBusyChange={setUploadingCover}
              onUploaded={(urls) => setCoverUrl(urls[0] ?? "")}
            />
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <Label className="text-center">Foto di anteprima (opzionale)</Label>
            <PhotoUploader
              prefix={`${uploadPrefix}/anteprime`}
              label="Aggiungi foto"
              centered
              onBusyChange={setUploadingPhotos}
              onUploaded={(urls) => setPhotoUrls((current) => [...current, ...urls])}
            />
            {photoUrls.length > 0 && (
              <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {photoUrls.map((url, index) => (
                  <li key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-md">
                    <img src={url} alt={`Anteprima ${index + 1}`} className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="absolute right-2 top-2"
                      title="Rimuovi anteprima"
                      aria-label={`Rimuovi anteprima ${index + 1}`}
                      onClick={() => setPhotoUrls((current) => current.filter((_, photoIndex) => photoIndex !== index))}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {photoUrls.length === 0 && (
              <p className="text-center text-sm text-haze">Nessuna anteprima aggiunta</p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={pending || uploadingCover || uploadingPhotos || !coverUrl}
          >
            {pending ? "Creazione…" : "Crea evento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}