import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use the origin that served the page so LAN development does not call localhost.
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { signIn, signOut, useSession } = authClient;
