import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Non lanciamo errori qui se le variabili mancano: così il resto del sito
// (login, archivio pubblico...) continua a funzionare anche prima di aver
// configurato R2. L'errore arriva solo quando si prova davvero a caricare.
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "";

function publicBaseUrl() {
  return (process.env.R2_PUBLIC_URL ?? "").trim().replace(/\/+$/, "");
}

// Es. https://pub-xxxx.r2.dev — SENZA slash finale.
export function publicUrlForKey(key: string) {
  const base = publicBaseUrl();
  if (!base) throw new Error("R2_PUBLIC_URL non configurato.");
  return `${base}/${key}`;
}

// Inverso di publicUrlForKey: serve per sapere COSA cancellare su R2 partendo
// dall'URL salvato nel database.
export function keyFromPublicUrl(url: string): string {
  const base = publicBaseUrl();
  if (!base) throw new Error("R2_PUBLIC_URL non configurato.");

  const baseUrl = new URL(base);
  const objectUrl = new URL(url);
  const basePath = baseUrl.pathname.replace(/\/+$/, "");
  if (objectUrl.origin !== baseUrl.origin || !objectUrl.pathname.startsWith(`${basePath}/`)) {
    throw new Error("URL foto non appartiene al bucket R2 configurato.");
  }

  return decodeURIComponent(objectUrl.pathname.slice(basePath.length + 1));
}

export async function deleteFromR2(key: string) {
  // Cancellare una chiave che non esiste più non dà errore (comportamento
  // standard S3): va bene anche se il file fosse già sparito per altri motivi.
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
