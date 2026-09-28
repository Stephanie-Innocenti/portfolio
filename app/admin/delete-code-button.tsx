"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDownloadCode } from "./actions";

export default function DeleteCodeButton({ id, igHandle }: { id: string; igHandle: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Eliminare definitivamente il codice di @${igHandle}?`)) return;

    startTransition(async () => {
      await deleteDownloadCode(id);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={handleDelete}
      aria-label={`Elimina il codice di @${igHandle}`}
    >
      {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
      {pending ? "Eliminazione…" : "Elimina"}
    </Button>
  );
}