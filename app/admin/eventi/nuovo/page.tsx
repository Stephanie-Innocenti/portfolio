"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createEvent } from "../../actions";

export default function NewEventPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createEvent(formData);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.push(`/admin/eventi/${res.eventId}`);
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
            <Input id="title" name="title" required placeholder="Es. Fiera Milano" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="year">Anno</Label>
            <Input id="year" name="year" type="number" required defaultValue={new Date().getFullYear()} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverImageUrl">URL immagine di copertina</Label>
            <Input id="coverImageUrl" name="coverImageUrl" required placeholder="https://…" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photoUrls">Foto di anteprima (opzionale, un URL per riga)</Label>
            <Textarea id="photoUrls" name="photoUrls" rows={5} placeholder={"https://…\nhttps://…"} />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Creazione…" : "Crea evento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
