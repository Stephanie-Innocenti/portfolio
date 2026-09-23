import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import LogoutButton from "./logout-button";

export default async function ArchivioPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-sm text-haze">Archivio foto</p>
          <h1 className="text-3xl font-semibold">Ciao, {session?.user.name}</h1>
        </div>
        <LogoutButton />
      </div>

      <p className="text-haze">
        La galleria arriva nella fase 3. Per ora questa pagina conferma solo che la sessione funziona.
      </p>
    </main>
  );
}
