"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deletePhoto } from "../../../actions";

export default function DeletePhotoButton({ photoId, eventId }: { photoId: string; eventId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Eliminare questa foto?")) return;
        startTransition(() => deletePhoto(photoId, eventId));
      }}
    >
      {pending ? "..." : "Elimina"}
    </Button>
  );
}
