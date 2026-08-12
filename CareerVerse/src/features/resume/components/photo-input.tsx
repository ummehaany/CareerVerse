"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

/** Resize an image file to a small JPEG data URL to stay well under Firestore limits. */
function resizeImage(file: File, max: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoInput({
  value,
  name,
  onChange,
}: {
  value: string;
  name: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await resizeImage(file, 320, 0.82);
      onChange(dataUrl);
    } catch {
      setError("Couldn't process that image. Try a different one.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar src={value || null} name={name} size={56} />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" isLoading={busy} onClick={() => inputRef.current?.click()}>
            {value ? "Change photo" : "Upload photo"}
          </Button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-medium text-danger hover:underline"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-subtle">Optional. Shown on Modern &amp; Creative templates.</p>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        aria-label="Upload profile photo"
      />
    </div>
  );
}
