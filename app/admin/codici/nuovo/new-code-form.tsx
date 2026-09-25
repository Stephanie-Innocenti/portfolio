"use client";

import { useState, useTransition } from "react";
import { createDownloadCode } from "../../actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EventOption = { id: string; title: string; year: number };

export default function NewCodeForm({ events }: { events: EventOption[] }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const response = await createDownloadCode(formData);
      setResult(
        response.ok
          ? { ok: true, message: `Codice: ${response.code} (mostralo ora, non sarà recuperabile).` }
          : { ok: false, message: response.message },
      );
    });
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Nuovo codice di download</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="igHandle">Nickname Instagram</Label>
            <Input id="igHandle" name="igHandle" required placeholder="mario.rossi" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="swissTransferUrl">Link SwissTransfer</Label>
            <Input id="swissTransferUrl" name="swissTransferUrl" type="url" required placeholder="https://..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="eventId">Evento</Label>
            <select id="eventId" name="eventId" className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm">
              <option value="">Tutti gli eventi</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.year} - {event.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hours">Validità (ore)</Label>
              <Input id="hours" name="hours" type="number" min={1} max={8760} defaultValue={48} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maxUses">Numero download</Label>
              <Input id="maxUses" name="maxUses" type="number" min={1} defaultValue={3} required />
            </div>
          </div>
          {result && (
            <Alert variant={result.ok ? "default" : "destructive"}>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Creazione..." : "Genera codice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
