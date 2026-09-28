import Image from "next/image";

export default function AccountAvatar({ name, image }: { name: string; image?: string | null }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="account-avatar-shell" role="img" aria-label={`Profilo di ${name}`}>
      <span className="account-avatar">
        {image ? (
          <Image src={image} alt="" width={48} height={48} unoptimized className="size-full rounded-full object-cover" />
        ) : (
          <span className="font-display text-sm font-bold text-white">{initials || "?"}</span>
        )}
      </span>
    </span>
  );
}