"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/app/lib/auth-client";
import { useLanguage } from "@/app/components/language-provider";

export default function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const requestedNext = useSearchParams().get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/archivio";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn.email({ email, password });

    setLoading(false);
    if (error) {
      setError(t.loginError);
      return;
    }
    router.push(next);
  }

  async function handleGoogleLogin() {
    await signIn.social({ provider: "google", callbackURL: next });
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          {t.email}
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-haze/40 bg-transparent px-3 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          {t.password}
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-haze/40 bg-transparent px-3 py-2.5"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-neon">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-neon px-6 py-2.5 font-semibold text-moquette disabled:opacity-60"
        >
          {loading ? t.loading : t.submit}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-haze">
        <span className="h-px flex-1 bg-haze/30" />
        {t.or}
        <span className="h-px flex-1 bg-haze/30" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="rounded-full border border-haze/40 px-6 py-2.5 font-semibold hover:bg-white/10"
      >
        {t.google}
      </button>
    </div>
  );
}
