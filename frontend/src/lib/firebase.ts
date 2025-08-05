import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);

let firebaseToken = '';

export async function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (firebaseToken) {
      resolve(firebaseToken);
    } else {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        unsubscribe();
        resolve(await user?.getIdToken() ?? '');
      }, reject);
    }
  });
}

export async function isUserSignedIn(): Promise<boolean> {
  const token = await getAuthToken();

  return token !== '';
}

// Keeps the Firebase token up-to-date.
onIdTokenChanged(firebaseAuth, async (user) => {
  firebaseToken = await user?.getIdToken() ?? '';
});
