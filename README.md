# Photo Portfolio

A private admin area for organizing event galleries and delivering personal photo collections. The app uses Next.js, Neon Postgres with Drizzle ORM, Better Auth, and Cloudflare R2 object storage.

## Setup

Install dependencies and create `.env.local` in the project root. Configure these variables there; do not commit real credentials:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `BETTER_AUTH_URL` | Canonical URL of this app |
| `BETTER_AUTH_SECRET` | Better Auth secret and personal-photo cookie signing key |
| `GOOGLE_CLIENT_ID` | Google sign-in client ID |
| `GOOGLE_CLIENT_SECRET` | Google sign-in client secret |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Optional comma-separated additional trusted origins |
| `R2_ACCOUNT_ID` | Cloudflare account ID used for the S3-compatible API |
| `R2_ACCESS_KEY_ID` | R2 API access key ID |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key |
| `R2_BUCKET_NAME` | Bucket used for uploaded images |
| `R2_PUBLIC_URL` | Public base URL for objects, without a trailing slash |

Push the Drizzle schema to the configured database and start the app:

```bash
npx drizzle-kit push
npm run dev
```

Register an account, then promote it to admin:

```bash
npx tsx scripts/make-admin.ts you@example.com
```

Other project commands are `npm run lint`, `npm run build`, and `npm start` (after building).

## Photo Storage And Delivery

Image binaries are stored in Cloudflare R2. Postgres stores event/photo metadata and the public object URLs; it does not store the image bytes. Uploads use a short-lived presigned S3-compatible `PUT` URL: an admin-only server action authorizes the request and creates the URL, then the browser uploads each file directly to R2. Successful uploads are recorded in the database.

Object keys are grouped by purpose:

- Event covers: `eventi/<year>/<event-slug>/copertina/...`
- Event previews: `eventi/<year>/<event-slug>/anteprime/...`
- Personal photos: `personali/<normalized-handle>/...`

Event covers and preview photos are displayed in the signed-in archive from their R2 URLs. The Next.js image configuration allows the configured R2 public hostname.

Personal photos are linked to a normalized Instagram handle and can optionally be grouped under an event. A valid download code grants a signed, HTTP-only cookie for two hours. The personal gallery checks that cookie, and the ZIP endpoint independently checks it again before fetching the original files from R2 and returning them as an attachment.

### Important Access Note

The cookie protects the app's personal-gallery page and ZIP endpoint, but it does not make a publicly addressable R2 object private. If `R2_PUBLIC_URL` points to a public R2 domain, anyone who obtains an individual object URL may be able to open that object directly, bypassing the app's cookie check. For strict per-person confidentiality, use a private bucket and serve images through authenticated, short-lived signed `GET` URLs or an authenticated application endpoint. Do not treat the current public object URLs as secret access controls.

Deleting photos attempts to remove the R2 object and its database record. R2 deletion is best-effort: a storage failure does not block the database cleanup and can leave an unreferenced object in the bucket.

## Copyright

The photographs and portfolio content are the author's original work and are protected by copyright. All rights are reserved. No permission to copy, redistribute, publish, or use the work commercially is granted by this repository.
