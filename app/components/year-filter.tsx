import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LogoutButton from "./logout-button";

export default function YearFilter({
  years,
  activeYear,
}: {
  years: number[];
  activeYear?: number;
}) {
  return (
    <aside className="flex flex-col justify-between xl:h-full">
      <nav aria-label="Filtra per anno" className="flex flex-col gap-2 ">
        <div className="flex flex-wrap gap-2 xl:flex-col items-center">
          <span className="text-violet-100 text-lg font-semibold">Years</span>
        </div>
        <div className="flex flex-wrap gap-2 xl:flex-col">
          {years.map((year) => (
            <Link
              key={year}
              href={
                activeYear === year ? "/archivio" : `/archivio?anno=${year}`
              }
              className="min-w-20 flex-1 xl:flex-none"
            >
              <Badge
                variant={activeYear === year ? "default" : "outline"}
                className="w-full justify-center py-2 text-base"
              >
                {year}
              </Badge>
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex flex-col gap-4">
        <Separator />
        <LogoutButton />
      </div>
    </aside>
  );
}
