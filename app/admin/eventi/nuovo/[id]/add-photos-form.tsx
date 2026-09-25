"use client";

import { useState, useTransition } from "react";
import { addPhotos } from "../../../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddPhotosForm({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await addPhotos(eventId, String(formData.get("urls") ?? ""));
      setMessage({ ok: result.ok, text: result.ok ? "Foto aggiunte." : result.message });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aggiungi foto</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <Textarea name="urls" rows={5} required placeholder="Un URL per riga" />
          {message && (
            <Alert variant={message.ok ? "default" : "destructive"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Salvataggio..." : "Aggiungi foto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
