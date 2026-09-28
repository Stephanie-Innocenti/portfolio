"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "../../../actions";

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm("Eliminare questo evento? L'azione non può essere annullata.")) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteEvent(eventId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.replace("/admin");
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button type="button" variant="destructive" disabled={pending} onClick={handleDelete}>
        {pending ? "Eliminazione..." : "Elimina evento"}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}