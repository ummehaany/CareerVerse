import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseClientConfig } from "@/lib/env";

// Reuse the app across HMR reloads / multiple imports.
const app = getApps().length ? getApp() : initializeApp(firebaseClientConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
