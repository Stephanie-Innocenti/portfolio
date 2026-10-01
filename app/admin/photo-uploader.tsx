"use client";

import { useState } from "react";
import { createUploadUrl } from "@/app/admin/actions";

type FileStatus = { name: string; state: "in-coda" | "carico" | "fatto" | "errore" };

export default function PhotoUploader({
  prefix,
  onUploaded,
  label = "Scegli foto",
  multiple = true,
  centered = false,
  onBusyChange,
}: {
  prefix: string; // organizza i file su R2, es. "eventi/fiera-milano-2026" o "personali/mario-rossi"
  onUploaded: (urls: string[]) => void;
  label?: string;
  multiple?: boolean;
  centered?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [statuses, setStatuses] = useState<FileStatus[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setBusy(true);
    onBusyChange?.(true);
    setStatuses(files.map((f) => ({ name: f.name, state: "in-coda" })));

    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatuses((prev) => prev.map((s, idx) => (idx === i ? { ...s, state: "carico" } : s)));

      try {
        const { uploadUrl, publicUrl } = await createUploadUrl(file.name, file.type, prefix);
        const res = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!res.ok) throw new Error("upload fallito");

        urls.push(publicUrl);
        setStatuses((prev) => prev.map((s, idx) => (idx === i ? { ...s, state: "fatto" } : s)));
      } catch {
        setStatuses((prev) => prev.map((s, idx) => (idx === i ? { ...s, state: "errore" } : s)));
      }
    }

    setBusy(false);
    onBusyChange?.(false);
    if (urls.length) onUploaded(urls);
  }

  return (
    <div className={`flex flex-col gap-3 ${centered ? "items-center text-center" : ""}`}>
      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-haze/40 px-4 py-3 text-sm hover:bg-white/5">
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={busy}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {busy ? "Caricamento in corso…" : label}
      </label>

      {statuses.length > 0 && (
        <ul className={`flex flex-col gap-1 text-sm text-haze ${centered ? "items-center" : ""}`}>
          {statuses.map((s, i) => (
            <li key={i}>
              {s.state === "fatto" && "✓ "}
              {s.state === "errore" && "✕ "}
              {s.state === "carico" && "… "}
              {s.name} {s.state === "errore" && "(errore, riprova)"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
