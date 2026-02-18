import { API_BASE_URL, assertMobileEnv } from '../config/env';
import type { ApiError } from '../types/api';

export class ApiClient {
  constructor(private readonly getToken: () => Promise<string | null>) {}

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    assertMobileEnv();

    const token = await this.getToken();

    const headers = new Headers(init?.headers || {});
    headers.set('Accept', 'application/json');

    if (init?.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const apiError = json as ApiError | null;
      throw new Error(apiError?.error?.message || 'Request failed');
    }

    return json as T;
  }
}

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
