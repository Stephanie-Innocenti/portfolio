"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDownloadCode } from "../../actions";

type EventOption = { id: string; title: string; year: number };

export default function NewCodeForm({
  events,
  defaultIgHandle,
  defaultEventId,
}: {
  events: EventOption[];
  defaultIgHandle?: string;
  defaultEventId?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ code: string; igHandle: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await createDownloadCode(formData);
        if (!res.ok) {
          setError(res.message);
          return;
        }
        setRevealed({ code: res.code, igHandle: res.igHandle });
      } catch {
        // Se il server action fallisce per un motivo imprevisto (es. DB non
        // raggiungibile), prima non compariva niente: ora almeno un errore.
        setError("Qualcosa è andato storto. Riprova, o controlla la console del server.");
      }
    });
  }

  // Dopo la creazione: solo il codice, ben visibile, da copiare e mandare in DM.
  // Nessun form sotto, per evitare che si perda di vista senza averlo copiato.
  if (revealed) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Codice creato per @{revealed.igHandle}</CardTitle>
          <CardDescription>
            Copialo ora: non sarà più visibile da nessuna parte dopo aver lasciato questa pagina.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border border-haze/30 bg-white/5 px-6 py-8 text-center font-mono text-3xl tracking-[0.3em]">
            {revealed.code}
          </div>
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(revealed.code)}
          >
            Copia negli appunti
          </Button>
          <Button variant="ghost" onClick={() => setRevealed(null)}>
            Crea un altro codice
          </Button>
        </CardContent>
      </Card>
    );
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
            <Input id="igHandle" name="igHandle" required placeholder="@nickname" defaultValue={defaultIgHandle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="swissTransferUrl">Link SwissTransfer</Label>
            <Input id="swissTransferUrl" name="swissTransferUrl" required placeholder="https://www.swisstransfer.com/d/…" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="eventId">Evento collegato (opzionale)</Label>
            <Select name="eventId" defaultValue={defaultEventId}>
              <SelectTrigger id="eventId" className="w-full bg-white/5 text-white">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hours">Valido per (ore)</Label>
              <Input id="hours" name="hours" type="number" defaultValue={48} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maxUses">Usi massimi</Label>
              <Input id="maxUses" name="maxUses" type="number" defaultValue={3} required />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Generazione…" : "Genera codice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
