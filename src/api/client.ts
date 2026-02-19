import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL, assertMobileEnv } from '../config/env';
import type { ApiError } from '../types/api';

type CachedPayload<T> = {
  saved_at: number;
  data: T;
};

type CacheOptions = {
  ttlMs?: number;
  forceRefresh?: boolean;
  fallbackToStaleOnError?: boolean;
};

const CACHE_PREFIX = 'videocourses_mobile_api_cache:';
const DEFAULT_TTL_MS = 5 * 60 * 1000;

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

  async requestWithCache<T>(path: string, options?: CacheOptions): Promise<T> {
    const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
    const forceRefresh = options?.forceRefresh ?? false;
    const fallbackToStaleOnError = options?.fallbackToStaleOnError ?? true;
    const cacheKey = this.cacheKey(path);
    const cached = await this.readCache<T>(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.saved_at <= ttlMs) {
      return cached.data;
    }

    try {
      const data = await this.request<T>(path);
      await this.writeCache(cacheKey, data);

      return data;
    } catch (error) {
      if (cached && fallbackToStaleOnError) {
        return cached.data;
      }

      throw error;
    }
  }

  async setCachedResponse<T>(path: string, data: T): Promise<void> {
    const key = this.cacheKey(path);
    await this.writeCache(key, data);
  }

  async invalidateCachedResponse(path: string): Promise<void> {
    const key = this.cacheKey(path);
    await AsyncStorage.removeItem(key);
  }

  private cacheKey(path: string): string {
    return `${CACHE_PREFIX}${path}`;
  }

  private async readCache<T>(key: string): Promise<CachedPayload<T> | null> {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as CachedPayload<T>;
    } catch {
      return null;
    }
  }

  private async writeCache<T>(key: string, data: T): Promise<void> {
    const payload: CachedPayload<T> = {
      saved_at: Date.now(),
      data,
    };

    await AsyncStorage.setItem(key, JSON.stringify(payload));
  }
}

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
