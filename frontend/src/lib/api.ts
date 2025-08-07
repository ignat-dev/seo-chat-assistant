import { getAuthToken } from './firebase';

const API_BASE_URL = getApiBaseUrl();

// TODO: Some ideas for future enhancements:
// - Redirect to login on HTTP code 401 (Unauthorized).
// - Retry with exponential backoff on HTTP code 500 (Server Error).
async function makeRequest<T = object>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const apiUrl = [API_BASE_URL, endpoint].join(endpoint.startsWith('/') ? '' : '/');
  const headers: HeadersInit = {
      'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers,
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

function getApiBaseUrl(): string {
  // During SSR or build fallback to the default option below.
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const isLocalEnvironment = Boolean(port);

    if (isLocalEnvironment) {
      return `${protocol}//${hostname}:${process.env.NEXT_PUBLIC_API_SERVER_PORT}`;
    }
  }

  return process.env.NEXT_PUBLIC_API_URL_PREFIX ?? '';
}
