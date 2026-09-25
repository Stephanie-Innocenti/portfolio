import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "./auth";
import { db } from "./db";
import { user } from "./schema";
import { eq } from "drizzle-orm";

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  // 404 invece di "non autorizzato": un utente normale loggato non deve nemmeno
  // sapere che /admin esiste.
  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { role: true },
  });
  if (currentUser?.role !== "admin") notFound();

  return session;
}
