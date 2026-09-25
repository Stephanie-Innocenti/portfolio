import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  // URL fisso del server: è quello che Better Auth manda a Google come
  // redirect_uri, quindi deve corrispondere esattamente a quanto registrato
  // nella Google Cloud Console (vedi .env.local).
  baseURL: process.env.BETTER_AUTH_URL,
  // Origini extra da cui accettare richieste (es. il tuo IP in rete locale
  // per testare da telefono). Aggiungi qui, separati da virgola in .env.local,
  // eventuali altri indirizzi da cui apri il sito durante lo sviluppo.
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? [],
  database: drizzleAdapter(db, { provider: "pg" }),
  user: {
    additionalFields: {
      // input:false → nessuno può auto-assegnarsi "admin" in fase di registrazione,
      // il campo si imposta solo lato server (vedi scripts/make-admin.ts).
      role: { type: "string", defaultValue: "user", input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    // La sessione si rinnova se l'utente torna attivo entro 7 giorni, altrimenti scade a 30.
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 7,
  },
});
