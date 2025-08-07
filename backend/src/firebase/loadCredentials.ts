import { cert, type Credential } from "firebase-admin/app";
import { readFileSync } from "fs";

export function loadCredential(): Credential | undefined {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!serviceAccountPath) {
    console.error("Environment variable not set: GOOGLE_APPLICATION_CREDENTIALS");
    return;
  }

  try {
    return cert(JSON.parse(readFileSync(serviceAccountPath, "utf8")));
  } catch (ex) {
    throw new Error(
      `Failed to load service account credentials from "${serviceAccountPath}":\n` +
      (ex instanceof Error ? ex.message : `${ex}`)
    );
  }
}
