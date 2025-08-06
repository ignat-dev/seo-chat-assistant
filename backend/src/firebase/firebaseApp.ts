import { initializeApp, cert } from "firebase-admin/app";
import { readFileSync } from "fs";

// If running in Firebase Cloud Functions, use default credentials.
const isCloudEnvironment = (
  process.env.FUNCTIONS_EMULATOR === 'true' ||
  process.env.K_SERVICE ||
  process.env.FIREBASE_CONFIG
);

let firebaseAppOptions;

// For local development load service account credentials from file.
if (!isCloudEnvironment) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!serviceAccountPath) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
  }

  try {
    firebaseAppOptions = {
      credential: cert(JSON.parse(readFileSync(serviceAccountPath, "utf8"))),
    };
  } catch (ex) {
    throw new Error(
      `Failed to load service account credentials from "${serviceAccountPath}":\n` +
      (ex instanceof Error ? ex.message : `${ex}`)
    );
  }
}

export const firebaseApp = initializeApp(firebaseAppOptions);
