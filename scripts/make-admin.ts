// Uso: npx tsx scripts/make-admin.ts tuamail@example.com
import { eq } from "drizzle-orm";
import { user } from "../lib/schema";
import dotenv from "dotenv";

const email = process.argv[2];
if (!email) {
  console.error("Uso: npx tsx scripts/make-admin.ts email@esempio.com");
  process.exit(1);
}

async function main() {
  dotenv.config({ path: ".env.local" });
  const { db } = await import("../lib/db");

  const [updated] = await db.update(user).set({ role: "admin" }).where(eq(user.email, email)).returning();

  if (!updated) {
    console.error("Nessun utente con questa email. Registrati prima dal sito, poi rilancia lo script.");
    process.exit(1);
  }
  console.log(`${updated.email} è ora admin.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
