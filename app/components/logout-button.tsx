"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled={pending}
      onClick={handleLogout}
      className="min-h-10 border-white/25 bg-black/15 px-4 py-2 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10 hover:text-white"
    >
      {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <LogOut aria-hidden="true" />}
      {pending ? "Uscita…" : "Esci"}
    </Button>
  );
}
