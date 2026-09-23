import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import { LanguageProvider } from "@/app/components/language-provider";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-display" });
const serif = Newsreader({ subsets: ["latin"], variable: "--f-serif" });

export const metadata: Metadata = {
  title: "Stefy_Aihara.ph · Photos from conventions, events and exhibitions",
  description: "Foto scattate alle fiere: archivio riservato e download personali.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${display.variable} ${serif.variable}`}>
      <body className="min-h-dvh antialiased"><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
