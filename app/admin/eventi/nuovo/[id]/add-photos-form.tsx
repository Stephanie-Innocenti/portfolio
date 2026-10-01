"use client";

import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhotoUploader from "@/app/admin/photo-uploader";
import { addPhotos } from "../../../actions";

export default function AddPhotosForm({ eventId, eventSlug }: { eventId: string; eventSlug: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aggiungi foto</CardTitle>
      </CardHeader>
      <CardContent>
        <PhotoUploader
          prefix={`eventi/${eventSlug}`}
          label="Scegli foto da caricare"
          onUploaded={(urls) =>
            startTransition(async () => {
              await addPhotos(eventId, urls);
            })
          }
        />
        {pending && <p className="mt-2 text-sm text-haze">Salvataggio nella galleria…</p>}
      </CardContent>
    </Card>
  );
}
