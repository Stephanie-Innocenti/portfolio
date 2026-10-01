import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "photo_access";
const TTL_MS = 1000 * 60 * 60 * 2; // 2 ore: tempo per sfogliare e scaricare, non un accesso permanente

// Riuso BETTER_AUTH_SECRET come chiave di firma: è già un segreto forte che hai
// generato, non serve inventarne un secondo solo per questo.
function sign(payload: string) {
  return createHmac("sha256", process.env.BETTER_AUTH_SECRET!).update(payload).digest("hex");
}

// Chiamata dentro requestDownloadLink, SOLO dopo che nickname+codice sono risultati validi.
export async function grantPhotoAccess(igHandle: string) {
  const payloadB64 = Buffer.from(JSON.stringify({ h: igHandle, e: Date.now() + TTL_MS })).toString("base64url");
  const token = `${payloadB64}.${sign(payloadB64)}`;

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true, // mai leggibile da JS nel browser
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

// Chiamata sia nella pagina "le mie foto" sia nella route dello zip:
// due controlli indipendenti sullo stesso cookie, non uno solo.
export async function hasPhotoAccess(igHandle: string): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const expected = sign(payloadB64);
  const validSignature =
    signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!validSignature) return false;

  const { h, e } = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
  return h === igHandle && e > Date.now();
}
