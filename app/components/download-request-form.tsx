"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { requestDownloadLink } from "@/app/archivio/actions";

export default function DownloadRequestForm() {
  const [igHandle, setIgHandle] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message?: string; url?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await requestDownloadLink(igHandle, code);
      setResult(res.ok ? { ok: true, url: res.url } : { ok: false, message: res.message });
    });
  }

  return (
    <Card className="border border-white/15 bg-black/30 shadow-xl shadow-black/20 backdrop-blur-md">
      <CardHeader className="gap-2">
        <CardTitle className="text-xl font-bold text-white">Scarica le tue foto</CardTitle>
        <CardDescription className="leading-relaxed text-white/70">
          Inserisci il tuo nome Instagram e il codice ricevuto in messaggio per aprire il link alle tue foto. Il link consente un numero limitato di download.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ig" className="font-semibold text-white/90">Nome Instagram</Label>
            <Input
              id="ig"
              placeholder="@tuonickname"
              value={igHandle}
              onChange={(e) => setIgHandle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code" className="font-semibold text-white/90">Codice di download</Label>
            <Input
              id="code"
              placeholder="Es. K7P2MXQ9"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full font-bold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
            {pending ? "Verifica…" : "Apri il link"}
          </Button>
        </form>

        {result && !result.ok && (
          <Alert variant="destructive">
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        {result?.ok && (
          <Alert>
            <AlertDescription className="flex flex-col gap-2">
              Link pronto, valido per un numero limitato di download.
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2"
              >
                Apri SwissTransfer →
              </a>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
