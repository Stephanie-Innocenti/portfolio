import Link from "next/link";
import Image from "next/image";

export default function EventFolderCard({
  slug,
  title,
  year,
  coverImageUrl,
}: {
  slug: string;
  title: string;
  year: number;
  coverImageUrl: string;
}) {
  return (
    <Link
      href={`/archivio/eventi/${slug}`}
      className="group relative block aspect-[4/3] w-full min-w-0 overflow-hidden rounded-xl border border-white/20 shadow-lg shadow-black/25 transition-[border-color,box-shadow] hover:border-white/50 hover:shadow-xl focus-visible:outline-none"
    >
      <Image
        src={coverImageUrl}
        alt=""
        fill
        sizes="(min-width: 1536px) 320px, (min-width: 1280px) 280px, (min-width: 640px) 33vw, 50vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />
      {/* Overlay che scurisce di base e si schiarisce leggermente in hover, per leggibilità del testo */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/60" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 text-white sm:p-4">
        <span className="line-clamp-2 min-w-0 text-base font-bold drop-shadow-sm sm:text-lg">{title}</span>
        <span className="shrink-0 rounded-md border border-white/20 bg-black/30 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm sm:text-sm">
          {year}
        </span>
      </div>
    </Link>
  );
}
