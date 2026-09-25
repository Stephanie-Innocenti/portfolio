import { event, photo, downloadCode } from "../lib/schema";
import { generateCode, hashCode } from "../lib/download-codes";
import dotenv from "dotenv";

async function main() {
  dotenv.config({ path: ".env.local" });
  const { db } = await import("../lib/db");

  await db
    .insert(event)
    .values([
      {
        id: crypto.randomUUID(),
        slug: "Novegro-Milano-Invernale",
        title: "Fiera del fumetto di Novegro",
        year: 2026,
        coverImageUrl: "https://picsum.photos/seed/fiera1/800/600",
      },
      {
        id: crypto.randomUUID(),
        slug: "Bologna-Nerd",
        title: "Fiera di Bologna",
        year: 2026,
        coverImageUrl: "https://picsum.photos/seed/fiera2/800/600",
      },
      {
        id: crypto.randomUUID(),
        slug: "Novegro-Milano-Primaverile",
        title: "Fiera del fumetto di Novegro",
        year: 2026,
        coverImageUrl: "https://picsum.photos/seed/fiera3/800/600",
      },
      {
        id: crypto.randomUUID(),
        slug: "Rimini-Comix",
        title: "Fiera del fumetto di Rimini e culture pop",
        year: 2026,
        coverImageUrl: "https://picsum.photos/seed/fiera4/800/600",
      },
      {
        id: crypto.randomUUID(),
        slug: "Sigurtà-Garden-Festival",
        title: "Magico mondo del cosplay al Sigurtà Garden Festival",
        year: 2026,
        coverImageUrl: "https://picsum.photos/seed/fiera4/800/600",
      },
      {
        id: crypto.randomUUID(),
        slug: "Romics",
        title: "Fiera di Roma",
        year: 2026,
        coverImageUrl: "https://picsum.photos/seed/fiera4/800/600",
      },
    ])
    .onConflictDoNothing({ target: event.slug })
    .returning();
  const ev = await db.query.event.findFirst({
    where: (events, { eq }) => eq(events.slug, "Novegro-Milano-Invernale"),
  });

  if (!ev) {
    throw new Error("Impossibile trovare l'evento di prova dopo il seed.");
  }

  await db.insert(photo).values([
    {
      id: crypto.randomUUID(),
      eventId: ev.id,
      url: "https://picsum.photos/seed/a/600/600",
      position: 0,
    },
    {
      id: crypto.randomUUID(),
      eventId: ev.id,
      url: "https://picsum.photos/seed/b/600/600",
      position: 1,
    },
  ]);

  const code = generateCode();

  await db.insert(downloadCode).values({
    id: crypto.randomUUID(),
    igHandle: "stephanie_cosplay",
    codeHash: hashCode(code),
    swissTransferUrl: "https://www.swisstransfer.com/d/esempio",
    eventId: ev.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48), // 48 ore
    maxUses: 3,
  });

  console.log(
    "Password temporanea di prova:",
    code,
    "← usala nel form, non è salvata in chiaro altrove",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
