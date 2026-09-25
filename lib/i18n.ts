export type Locale = "it" | "en";

export const localeOptions: { value: Locale; label: string }[] = [
  { value: "it", label: "Italiano" },
  { value: "en", label: "English" },
];

export const copy = {
  it: {
    login: "Accedi",
    archive: "Accedi all'archivio",
    contact: "Scrivimi per info",
    heroTitle: "Le fiere viste da vicino.",
    heroDescription:
      "I momenti insieme. Accedi per sfogliare gli scatti. In caso di richieste, scrivimi per avere informazioni.",
    newsTitle: "Dal cinema e dalla pop culture",
    previous: "Notizia precedente",
    next: "Notizia successiva",
    newsLabel: "Ultime notizie da cinema e pop culture",
    copyright: "Foto non riutilizzabili senza permesso.",
    loginTitle: "Il tuo archivio",
    loginDescription: "Accedi per ritrovare le foto delle convention a cui hai partecipato.",
    email: "Email",
    password: "Password",
    submit: "Continua",
    loginNotice: "L'autenticazione non è ancora collegata a un database. Configura Auth.js prima di abilitare l'accesso reale.",
    loginError: "Email o password non corrette.",
    loading: "Accesso...",
    or: "oppure",
    google: "Continua con Google",
    backHome: "Torna alla home",
  },
  en: {
    login: "Sign in",
    archive: "Open the archive",
    contact: "Ask for information",
    heroTitle: "Conventions, up close.",
    heroDescription:
      "The moments we share. Sign in to browse the shots. For requests, get in touch for more information.",
    newsTitle: "Cinema and pop culture",
    previous: "Previous story",
    next: "Next story",
    newsLabel: "Latest cinema and pop culture news",
    copyright: "Photos may not be reused without permission.",
    loginTitle: "Your archive",
    loginDescription: "Sign in to find the photos from the conventions you attended.",
    email: "Email",
    password: "Password",
    submit: "Continue",
    loginNotice: "Authentication is not connected to a database yet. Configure Auth.js before enabling real access.",
    loginError: "The email or password is incorrect.",
    loading: "Signing in...",
    or: "or",
    google: "Continue with Google",
    backHome: "Back home",
  },
} as const;

export type Copy = (typeof copy)[Locale];