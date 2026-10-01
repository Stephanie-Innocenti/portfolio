"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { requestDownloadLink } from "@/app/archivio/actions";

export default function DownloadRequestForm() {
  const router = useRouter();
  const [igHandle, setIgHandle] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await requestDownloadLink(igHandle, code);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.push(`/archivio/lemiefoto/${res.igHandle}`);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scarica le tue foto</CardTitle>
        <CardDescription>
          Inserisci il nickname Instagram e la password temporanea che ti ho mandato.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ig">Nickname Instagram</Label>
            <Input
              id="ig"
              placeholder="@tuonickname"
              value={igHandle}
              onChange={(e) => setIgHandle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">Password temporanea</Label>
            <Input
              id="code"
              placeholder="Es. K7P2MXQ9"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Verifica…" : "Vai alle mie foto"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
