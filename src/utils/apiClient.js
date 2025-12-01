import { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const API_BASE_URL = '/.netlify/functions';
const JSON_TYPE = 'application/json';
const API_AUDIENCE = import.meta.env.VITE_AUTH0_API_AUDIENCE;


export class APIClient {
  constructor(getAccessToken) {
    this.getAccessToken = getAccessToken;
  }

  async request(endpoint, { method = 'GET', headers = {}, body, auth = true } = {}) {
    const token = auth && this.getAccessToken ? await this.getAccessToken() : null;

    const url = `${API_BASE_URL}${endpoint}`;
    console.log("Token:", token);
    const init = {
      method,
      headers: {
        'Content-Type': JSON_TYPE,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    };

    console.log("INIT: ", init)

    if (body !== undefined) {
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, init);
    console.log("RESPONSE: ", response);
    return this.parseResponse(response);
  }

  async parseResponse(response) {
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const isJson = contentType.includes(JSON_TYPE);
    const data = isJson ? await response.json().catch(() => ({})) : await response.text();

    if (!response.ok) {
      const message = isJson && typeof data === 'object' ? data?.message || data?.error : data;
      const error = new Error(message || `HTTP ${response.status}`);
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return data;
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  patch(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  put(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'DELETE', body });
  }
}

export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  const tokenFetcher = useMemo(() => {
    if (!getAccessTokenSilently) return null;
    return () => getAccessTokenSilently({
      authorizationParams: API_AUDIENCE ? { audience: API_AUDIENCE } : undefined,
    });
  }, [getAccessTokenSilently]);

  return useMemo(() => new APIClient(tokenFetcher), [tokenFetcher]);
};