"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteAllPersonalPhotosForHandle } from "../actions";

export default function DeleteAllButton({ igHandle }: { igHandle: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (confirm(`Eliminare TUTTE le foto di @${igHandle}? Se le rivuole, andranno ricaricate da capo.`)) {
          startTransition(() => deleteAllPersonalPhotosForHandle(igHandle));
        }
      }}
    >
      {pending ? "Elimino…" : "Elimina tutte"}
    </Button>
  );
}