"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { EditIcon, TrashIcon } from "@/components/ui/icons-extended";
import { CheckCircleIcon } from "@/components/ui/icon";
import {
  validateAvatarFile,
  loadImage,
  renderAvatarBlob,
  uploadAvatar,
  deleteAvatarByUrl,
  ALLOWED_AVATAR_EXTENSIONS,
  type CropRegion,
} from "../avatar";
import { updateProfile } from "../actions";
import { DISPLAY_NAME_MIN, DISPLAY_NAME_MAX } from "../constants";

type Status = "idle" | "uploading" | "saving" | "success" | "error";

function firstNameOf(name: string, fallback: string): string {
  const trimmed = name.trim();
  if (!trimmed) return fallback;
  return trimmed.split(/\s+/)[0]!;
}

function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < DISPLAY_NAME_MIN) return "Name must be at least 2 characters.";
  if (trimmed.length > DISPLAY_NAME_MAX) return `Name must be ${DISPLAY_NAME_MAX} characters or fewer.`;
  return null;
}

export function EditProfileCard({
  uid,
  displayName,
  email,
  photoURL,
}: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(displayName ?? "");
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(photoURL);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  const [cropImage, setCropImage] = useState<HTMLImageElement | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Revoke object URLs on unmount / replacement to avoid leaks.
  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  const effectivePhoto = pendingPreview ?? (removed ? null : currentPhoto);
  const nameError = validateName(name);
  const busy = status === "uploading" || status === "saving";

  const savedName = (displayName ?? "").trim();
  const dirty =
    name.trim() !== savedName || pendingBlob !== null || (removed && Boolean(currentPhoto));
  const canSave = dirty && !nameError && !busy;

  const resetPending = useCallback(() => {
    setPendingBlob(null);
    setPendingPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file later.
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (status === "success") setStatus("idle");

    const check = validateAvatarFile(file);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    loadImage(file)
      .then((img) => setCropImage(img))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not read that image."));
  }

  async function handleApplyCrop(crop: CropRegion) {
    if (!cropImage) return;
    try {
      const blob = await renderAvatarBlob(cropImage, crop);
      resetPending();
      setPendingBlob(blob);
      setPendingPreview(URL.createObjectURL(blob));
      setRemoved(false);
      if (status === "success") setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process that image.");
    } finally {
      URL.revokeObjectURL(cropImage.src);
      setCropImage(null);
    }
  }

  function handleCancelCrop() {
    if (cropImage) URL.revokeObjectURL(cropImage.src);
    setCropImage(null);
  }

  function handleRemovePhoto() {
    resetPending();
    setRemoved(Boolean(currentPhoto));
    if (status === "success") setStatus("idle");
    setError(null);
  }

  async function handleSave() {
    if (!canSave) return;
    setError(null);
    let nextPhoto: string | null | undefined = undefined;

    try {
      if (pendingBlob) {
        setStatus("uploading");
        setProgress(0);
        nextPhoto = await uploadAvatar(uid, pendingBlob, setProgress);
      } else if (removed && currentPhoto) {
        nextPhoto = null;
      }

      setStatus("saving");
      const payload: { displayName?: string; photoURL?: string | null } = {};
      if (name.trim() !== savedName) payload.displayName = name.trim();
      if (nextPhoto !== undefined) payload.photoURL = nextPhoto;

      const result = await updateProfile(payload);
      if (!result.ok) throw new Error(result.error);

      // Clean up the replaced/removed object (best-effort, never blocks).
      if (nextPhoto !== undefined && currentPhoto && currentPhoto !== nextPhoto) {
        await deleteAvatarByUrl(currentPhoto);
      }

      if (nextPhoto !== undefined) setCurrentPhoto(nextPhoto);
      resetPending();
      setRemoved(false);
      setStatus("success");
      router.refresh(); // re-render every server component with the new identity
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Couldn't save your changes. Please try again.");
    }
  }

  const acceptAttr = ALLOWED_AVATAR_EXTENSIONS.map((e) => `.${e}`).join(",") + ",image/*";
  const fallbackName = email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-5">
      {/* Avatar + photo controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name={name} email={email} src={effectivePhoto} size={72} className="ring-2 ring-border" />
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptAttr}
            className="hidden"
            onChange={handlePickFile}
            aria-hidden="true"
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
          >
            <EditIcon size={15} />
            {effectivePhoto ? "Change photo" : "Upload photo"}
          </Button>
          {effectivePhoto && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemovePhoto}
              disabled={busy}
              className="text-red-600 hover:bg-red-500/10"
            >
              <TrashIcon size={15} />
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="-mt-2 text-xs text-subtle">JPG, PNG, or WebP · up to 5 MB.</p>

      {/* Display name */}
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (status === "success") setStatus("idle");
          }}
          placeholder="Your name"
          maxLength={DISPLAY_NAME_MAX + 10}
          aria-invalid={Boolean(nameError)}
          disabled={busy}
        />
        {nameError ? (
          <p className="text-xs text-red-600">{nameError}</p>
        ) : (
          <p className="text-xs text-subtle">This is how your name appears across CareerVerse.</p>
        )}
      </div>

      {/* Live preview */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-foreground/[0.02] p-3">
        <Avatar name={name} email={email} src={effectivePhoto} size={40} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">Preview</p>
          <p className="truncate text-sm font-medium">
            Welcome back, {firstNameOf(name, fallbackName)} 👋
          </p>
        </div>
      </div>

      {/* Upload progress */}
      {status === "uploading" && (
        <div className="space-y-1.5">
          <Progress value={progress} label="Upload progress" />
          <p className="text-xs text-subtle">Uploading photo… {Math.round(progress)}%</p>
        </div>
      )}

      {/* States */}
      {error && <Alert variant="error">{error}</Alert>}
      {status === "success" && !error && (
        <Alert variant="success">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircleIcon size={15} /> Profile updated.
          </span>
        </Alert>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={!canSave} isLoading={busy}>
          {status === "saving" ? "Saving…" : status === "uploading" ? "Uploading…" : "Save changes"}
        </Button>
        {dirty && !busy && <span className="text-xs text-subtle">You have unsaved changes.</span>}
      </div>

      {cropImage && (
        <AvatarCropper image={cropImage} onApply={handleApplyCrop} onCancel={handleCancelCrop} />
      )}
    </div>
  );
}

// ── Interactive square/circle cropper ────────────────────────────────────────

const VIEWPORT = 256;

function AvatarCropper({
  image,
  onApply,
  onCancel,
}: {
  image: HTMLImageElement;
  onApply: (crop: CropRegion) => void;
  onCancel: () => void;
}) {
  const nW = image.naturalWidth;
  const nH = image.naturalHeight;
  const coverScale = useMemo(() => Math.max(VIEWPORT / nW, VIEWPORT / nH), [nW, nH]);

  const [zoom, setZoom] = useState(1);
  const scale = coverScale * zoom;
  const imgW = nW * scale;
  const imgH = nH * scale;

  const clamp = useCallback(
    (tx: number, ty: number, w: number, h: number) => ({
      tx: Math.min(0, Math.max(VIEWPORT - w, tx)),
      ty: Math.min(0, Math.max(VIEWPORT - h, ty)),
    }),
    [],
  );

  const [offset, setOffset] = useState(() =>
    clamp((VIEWPORT - nW * coverScale) / 2, (VIEWPORT - nH * coverScale) / 2, nW * coverScale, nH * coverScale),
  );

  const dragRef = useRef<{ x: number; y: number } | null>(null);

  function handleZoom(nextZoom: number) {
    const sOld = scale;
    const sNew = coverScale * nextZoom;
    // Keep the viewport centre stable while zooming.
    const centerX = (VIEWPORT / 2 - offset.tx) / sOld;
    const centerY = (VIEWPORT / 2 - offset.ty) / sOld;
    const tx = VIEWPORT / 2 - centerX * sNew;
    const ty = VIEWPORT / 2 - centerY * sNew;
    setZoom(nextZoom);
    setOffset(clamp(tx, ty, nW * sNew, nH * sNew));
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => clamp(prev.tx + dx, prev.ty + dy, imgW, imgH));
  }
  function handlePointerUp(e: React.PointerEvent) {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function apply() {
    const size = VIEWPORT / scale;
    onApply({ sx: -offset.tx / scale, sy: -offset.ty / scale, size });
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Adjust your photo"
    >
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-background p-5 shadow-xl">
        <div>
          <h3 className="font-semibold tracking-tight">Adjust your photo</h3>
          <p className="text-sm text-muted">Drag to reposition, and zoom to frame your avatar.</p>
        </div>

        <div className="flex justify-center">
          <div
            className="relative overflow-hidden rounded-full ring-2 ring-border touch-none"
            style={{ width: VIEWPORT, height: VIEWPORT, cursor: "grab" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none select-none"
              style={{ width: imgW, height: imgH, left: offset.tx, top: offset.ty }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="avatar-zoom">Zoom</Label>
          <input
            id="avatar-zoom"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoom(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
            aria-label="Zoom"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={apply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
