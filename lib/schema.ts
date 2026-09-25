import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"), // "user" | "admin"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Una riga per metodo di accesso: "credential" per email/password, "google" per l'OAuth.
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Archivio fotografico ---

// Una "cartella" mostrata al centro della dashboard: una fiera/evento.
export const event = pgTable("event", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(), // usato nell'URL /archivio/eventi/[slug]
  title: text("title").notNull(),
  year: integer("year").notNull(),
  coverImageUrl: text("cover_image_url").notNull(), // sfondo animato della cartella
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Foto di anteprima dentro una cartella: sempre pubbliche per chi ha fatto login,
// MAI scaricabili da qui. Le foto con persone non passano da questa tabella.
export const photo = pgTable("photo", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  position: integer("position").notNull().default(0),
});

// Codice temporaneo dato a UNA persona per sbloccare UN link SwissTransfer.
// Si salva solo l'hash: il codice in chiaro esiste solo fuori dal sito (es. DM su IG).
export const downloadCode = pgTable("download_code", {
  id: text("id").primaryKey(),
  igHandle: text("ig_handle").notNull(), // nickname Instagram di chi ha diritto al download
  codeHash: text("code_hash").notNull(),
  swissTransferUrl: text("swiss_transfer_url").notNull(),
  eventId: text("event_id").references(() => event.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at").notNull(),
  maxUses: integer("max_uses").notNull().default(3),
  usedCount: integer("used_count").notNull().default(0),
  revoked: boolean("revoked").notNull().default(false), // spento a mano dall'admin, distinto da "scaduto"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relazioni: servono alle query "with: { photos: ... }" in db.query.event.findMany.
export const eventRelations = relations(event, ({ many }) => ({
  photos: many(photo),
}));

export const photoRelations = relations(photo, ({ one }) => ({
  event: one(event, { fields: [photo.eventId], references: [event.id] }),
}));

export const downloadCodeRelations = relations(downloadCode, ({ one }) => ({
  event: one(event, { fields: [downloadCode.eventId], references: [event.id] }),
}));
