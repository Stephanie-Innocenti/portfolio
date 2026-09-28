import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function YearFilter({
  years,
  activeYear,
}: {
  years: number[];
  activeYear?: number;
}) {
  return (
    <aside className="rounded-xl border border-white/15 bg-black/20 p-4 shadow-lg shadow-black/10 backdrop-blur-md sm:p-5">
      <nav aria-label="Filtra gli eventi per anno" className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Sfoglia per anno</h2>
          <p className="mt-1 text-sm text-white/65">Scegli un anno o visualizza tutto l&apos;archivio.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/archivio"
            aria-current={!activeYear ? "page" : undefined}
            style={!activeYear ? { backgroundColor: "#a31352" } : undefined}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: `min-h-10 h-auto min-w-20 rounded-lg px-4 py-2 font-bold transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-rose-300 ${
                !activeYear
                  ? "border-rose-300 bg-rose-800 text-white shadow-md shadow-rose-950/30 hover:border-rose-200 hover:bg-rose-700"
                  : "border-rose-300/40 bg-rose-950/35 text-rose-100 hover:border-rose-300 hover:bg-rose-600 hover:text-white"
              }`,
            })}
          >
            Tutti
          </Link>
          {years.map((year) => (
            <Link
              key={year}
              href={activeYear === year ? "/archivio" : `/archivio?anno=${year}`}
              aria-current={activeYear === year ? "page" : undefined}
              style={activeYear === year ? { backgroundColor: "#a31352" } : undefined}
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: `min-h-10 h-auto min-w-20 rounded-lg px-4 py-2 font-bold transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-rose-300 ${
                  activeYear === year
                    ? "border-rose-300 bg-rose-800 text-white shadow-md shadow-rose-950/30 hover:border-rose-200 hover:bg-rose-700"
                    : "border-rose-300/40 bg-rose-950/35 text-rose-100 hover:border-rose-300 hover:bg-rose-600 hover:text-white"
                }`,
              })}
            >
              {year}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
