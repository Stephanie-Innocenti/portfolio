import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="admin-page relative isolate min-h-dvh overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <nav className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link href="/admin" className="font-semibold text-white hover:text-neon">
            Dashboard
          </Link>
          <Link href="/admin/eventi/nuovo" className="text-haze hover:text-white">
            Nuovo evento
          </Link>
          <Link href="/admin/codici/nuovo" className="text-haze hover:text-white">
            Nuovo codice
          </Link>
          <Link href="/archivio" className="text-haze hover:text-white sm:ml-auto">
            Vai all&apos;archivio →
          </Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
