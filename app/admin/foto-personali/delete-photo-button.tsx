"use client";

import { useTransition } from "react";
import { deletePersonalPhoto } from "../actions";

export default function DeletePersonalPhotoButton({ photoId }: { photoId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => deletePersonalPhoto(photoId))}
      disabled={pending}
      aria-label="Elimina foto"
      className="absolute right-1.5 top-1.5 rounded-full bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
    >
      ✕
    </button>
  );
}