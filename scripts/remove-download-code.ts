// Uso: npx tsx scripts/remove-download-code.ts mario.rossi
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import { downloadCode } from "../lib/schema";

const rawHandle = process.argv[2];
const igHandle = rawHandle?.trim().replace(/^@/, "").toLowerCase();

if (!igHandle) {
  console.error("Uso: npx tsx scripts/remove-download-code.ts nickname");
  process.exitCode = 1;
} else {
  async function main() {
    dotenv.config({ path: ".env.local" });
    const { db } = await import("../lib/db");

    const removed = await db
      .delete(downloadCode)
      .where(eq(downloadCode.igHandle, igHandle))
      .returning({ id: downloadCode.id });

    console.log(`Rimossi ${removed.length} codici per @${igHandle}.`);
  }

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
