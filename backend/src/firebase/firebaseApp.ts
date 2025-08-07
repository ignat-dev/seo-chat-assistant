import { initializeApp } from "firebase-admin/app";
import { loadCredential } from "./loadCredentials";

// Load service account credentials from file only for local development.
export const firebaseApp = initializeApp(
  process.env.NODE_ENV !== 'production'
    ? { credential: loadCredential?.() }
    : undefined,
);
