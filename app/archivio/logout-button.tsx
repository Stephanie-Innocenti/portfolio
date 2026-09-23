"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/app/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/"); // Logout → dashboard iniziale pubblica, come richiesto.
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-haze/50 px-4 py-2 text-sm hover:bg-white/10"
    >
      Esci
    </button>
  );
}
