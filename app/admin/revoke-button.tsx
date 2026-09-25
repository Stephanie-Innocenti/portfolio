"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { revokeCode } from "./actions";

export default function RevokeButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (confirm("Revocare questo codice? Non potrà più essere usato.")) {
          startTransition(() => revokeCode(id));
        }
      }}
    >
      Revoca
    </Button>
  );
}
