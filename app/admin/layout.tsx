import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <nav className="mb-8 flex gap-6 text-sm">
        <Link href="/admin" className="font-medium hover:underline">
          Dashboard
        </Link>
        <Link href="/admin/eventi/nuovo" className="text-haze hover:underline">
          + Nuovo evento
        </Link>
        <Link href="/admin/codici/nuovo" className="text-haze hover:underline">
          + Nuovo codice
        </Link>
        <Link href="/archivio" className="ml-auto text-haze hover:underline">
          Vai all&apos;archivio →
        </Link>
      </nav>
      {children}
    </div>
  );
}
