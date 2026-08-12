import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage, auth } from "@/lib/firebase/client";

/*
 * Client-side avatar helpers: validation, canvas-based cropping + compression,
 * and resumable upload to Firebase Storage. Kept framework-free so the UI just
 * orchestrates state around these pure-ish functions.
 */

export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_AVATAR_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
/** 5 MB hard cap (matches the Storage security rule). */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
/** Output dimension — avatars never need to be larger than this. */
export const AVATAR_OUTPUT_SIZE = 512;

export type ValidationResult = { ok: true } | { ok: false; error: string };

/** Validate a picked file's type and size before doing any work with it. */
export function validateAvatarFile(file: File): ValidationResult {
  const type = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const typeOk =
    (ALLOWED_AVATAR_TYPES as readonly string[]).includes(type) ||
    (ALLOWED_AVATAR_EXTENSIONS as readonly string[]).includes(ext);
  if (!typeOk) {
    return { ok: false, error: "Please choose a JPG, PNG, or WebP image." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "Image is too large. Maximum size is 5 MB." };
  }
  return { ok: true };
}

/** Load a File/Blob into an HTMLImageElement (resolves once decoded). */
export function loadImage(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

export interface CropRegion {
  /** Source-pixel top-left + size of the square crop within the image. */
  sx: number;
  sy: number;
  size: number;
}

async function canvasToCompressedBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  // Prefer WebP (smaller); fall back to JPEG where WebP encoding is unsupported.
  const encode = (type: string): Promise<Blob | null> =>
    new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, 0.85));
  const webp = await encode("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await encode("image/jpeg");
  if (jpeg) return jpeg;
  throw new Error("Could not process that image.");
}

/**
 * Render a square crop of `img` to a fixed-size canvas and return an optimized
 * (compressed) blob. This both crops and shrinks/optimizes large images.
 */
export async function renderAvatarBlob(
  img: HTMLImageElement,
  crop: CropRegion,
  outSize: number = AVATAR_OUTPUT_SIZE,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, crop.sx, crop.sy, crop.size, crop.size, 0, 0, outSize, outSize);
  return canvasToCompressedBlob(canvas);
}

/**
 * Upload an avatar blob to Storage under the user's folder with progress
 * callbacks. Resolves to the public download URL. Requires the Firebase client
 * to be authenticated (it is, after sign-in — auth persists locally).
 */
export function uploadAvatar(
  uid: string,
  blob: Blob,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (!auth.currentUser) {
    return Promise.reject(new Error("Please sign in again to upload a photo."));
  }
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `avatars/${uid}/avatar_${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, blob, { contentType: blob.type });

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const percent = snapshot.totalBytes
          ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          : 0;
        onProgress?.(percent);
      },
      () => reject(new Error("Upload failed. Please check your connection and try again.")),
      () => {
        getDownloadURL(task.snapshot.ref)
          .then(resolve)
          .catch(() => reject(new Error("Upload finished but the image URL could not be read.")));
      },
    );
  });
}

/**
 * Best-effort delete of a previously-uploaded avatar object. Only attempts URLs
 * that point at our own avatars folder; never throws (cleanup must not block a
 * successful save).
 */
export async function deleteAvatarByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return;
  // Only touch our own avatar objects (path is URL-encoded in download URLs).
  if (!url.includes("avatars%2F") && !url.includes("/avatars/")) return;
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // Ignore — the file may already be gone, or rules may forbid it.
  }
}
