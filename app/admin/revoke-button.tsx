"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { revokeCode } from "./actions";

export default function RevokeButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (confirm("Revocare questo codice? Non potrà più essere usato.")) {
          startTransition(async () => {
            await revokeCode(id);
            router.refresh();
          });
        }
      }}
    >
      Revoca
    </Button>
  );
}
