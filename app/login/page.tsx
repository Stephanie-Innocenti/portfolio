"use client";

import Link from "next/link";
import { Suspense } from "react";
import LanguageSelect from "@/app/components/language-select";
import LoginForm from "@/app/components/login-form";
import { useLanguage } from "@/app/components/language-provider";

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-5">
      <header className="flex items-center justify-between"><Link href="/" className="text-lg font-semibold">Aihara Ph</Link><LanguageSelect /></header>
      <section className="mx-auto flex w-full max-w-md flex-1 items-center py-16">
        <div className="w-full border border-haze/20 bg-white/5 p-7 shadow-2xl shadow-black/20 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neon">Private archive</p>
          <h1 className="mt-3 text-4xl font-bold">{t.loginTitle}</h1>
          <p className="mt-3 text-haze">{t.loginDescription}</p>
          <div className="mt-8">
            <Suspense fallback={<p className="text-sm text-haze">Caricamento...</p>}>
              <LoginForm />
            </Suspense>
          </div>
          <Link href="/" className="mt-7 inline-block text-sm text-haze underline decoration-neon underline-offset-4">{t.backHome}</Link>
        </div>
      </section>
    </main>
  );
}