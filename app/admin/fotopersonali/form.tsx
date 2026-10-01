"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhotoUploader from "@/app/admin/photo-uploader";
import { addPersonalPhotos } from "../actions";
import { normalizeHandle } from "@/lib/handle";

type EventOption = { id: string; title: string; year: number };

export default function PersonalPhotosForm({ events }: { events: EventOption[] }) {
  const [igHandle, setIgHandle] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [savedCount, setSavedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const cleanHandle = normalizeHandle(igHandle);
  const eventItems = events.map((eventOption) => ({
    value: eventOption.id,
    label: `${eventOption.title} (${eventOption.year})`,
  }));

  function handleUploaded(urls: string[]) {
    setError(null);
    startTransition(async () => {
      const res = await addPersonalPhotos(igHandle, eventId, urls);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setSavedCount((c) => c + res.count);
    });
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Foto personali</CardTitle>
        <CardDescription>
          Visibili solo a chi sblocca il codice con questo nickname. Puoi tornare qui più volte per aggiungerne altre.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="igHandle">Nickname Instagram</Label>
          <Input
            id="igHandle"
            value={igHandle}
            onChange={(e) => setIgHandle(e.target.value)}
            placeholder="@nickname"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="eventId">Evento (per raggruppare nella sua griglia)</Label>
          <Select items={eventItems} onValueChange={setEventId}>
            <SelectTrigger id="eventId" className="w-full min-w-0 bg-white/5 text-white">
              <SelectValue placeholder="Nessuno" />
            </SelectTrigger>
            <SelectContent className="border border-haze/20 bg-moquette text-white">
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.title} ({e.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {cleanHandle ? (
          <PhotoUploader
            key={cleanHandle} // reset dello stato interno se cambi nickname
            prefix={`personali/${cleanHandle}`}
            label="Scegli le foto di questa persona"
            onUploaded={handleUploaded}
          />
        ) : (
          <p className="text-sm text-haze">Scrivi prima il nickname per attivare il caricamento.</p>
        )}

        {pending && <p className="text-sm text-haze">Salvataggio…</p>}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {savedCount > 0 && (
          <Alert>
            <AlertDescription>
              {savedCount} foto salvate per @{cleanHandle}. Ora puoi generare il suo codice di download.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
