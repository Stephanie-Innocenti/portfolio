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
      className="group relative block w-full min-w-0 aspect-4/3 overflow-hidden rounded-xl"
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

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
        <span className="line-clamp-2 min-w-0 text-lg font-semibold drop-shadow-sm">{title}</span>
        <span className="shrink-0 text-sm text-white/80">{year}</span>
      </div>
    </Link>
  );
}
