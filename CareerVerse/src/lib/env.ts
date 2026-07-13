import { z } from "zod";

/**
 * Public Firebase configuration. These values are exposed to the browser
 * (hence the NEXT_PUBLIC_ prefix) and are safe to ship in the client bundle.
 * Each variable is referenced explicitly so Next.js can inline it at build time.
 */
const schema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

if (!parsed.success) {
  throw new Error(
    "Invalid or missing Firebase client environment variables. Copy .env.example to .env.local and fill in the NEXT_PUBLIC_FIREBASE_* values.",
  );
}

export const firebaseClientConfig = {
  apiKey: parsed.data.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: parsed.data.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: parsed.data.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: parsed.data.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: parsed.data.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: parsed.data.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;
