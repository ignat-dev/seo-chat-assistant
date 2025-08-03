import { getAuth } from 'firebase/auth';
import firebaseApp from './firebase';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const auth = getAuth(firebaseApp);

// NOTE: Calling `getIdToken()` automatically handles refresh tokens.
async function getToken(): Promise<string> {
  return await auth.currentUser?.getIdToken() ?? '';
}

// TODO: Some ideas for future enhancements:
// - Redirect to login on HTTP code 401 (Unauthorized).
// - Retry with exponential backoff on HTTP code 500 (Server Error).
async function makeRequest<T = object>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const response = await fetch([apiUrl, endpoint].join(endpoint.startsWith('/') ? '' : '/'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json() as T;
}

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    return makeRequest<T>(endpoint);
  },

  post: async <T>(endpoint: string, data?: Record<string, unknown>): Promise<T> => {
    return makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
};
