import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Controllo veloce a livello di edge: solo per reindirizzare subito chi non ha
// alcun cookie di sessione. La verifica vera (sessione valida e non scaduta)
// resta comunque nel layout di /archivio, perché un cookie presente non
// garantisce che sia ancora valido.
export function proxy(request: NextRequest) {
  const hasSession = getSessionCookie(request);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/archivio/:path*"],
};
