import { randomInt, createHash } from "crypto";

// Alfabeto senza caratteri ambigui (niente 0/O, 1/I/L) per codici leggibili da dettare o scrivere in un DM.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateCode(length = 8): string {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

// Hash deterministico e veloce: va bene qui perché il codice è casuale e ad
// alta entropia (non una password scelta dall'utente, dove servirebbe bcrypt/argon2).
export function hashCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}
