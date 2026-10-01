// Un solo punto di verità per "come si scrive un nickname" nel database.
// Usata sempre: quando crei un codice, quando tagghi una foto, quando l'utente
// lo digita per sbloccare — così "Mario.Rossi ", "@mario.rossi" e "mario.rossi"
// finiscono per essere la stessa identica stringa in tutte e tre le tabelle.
export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}
