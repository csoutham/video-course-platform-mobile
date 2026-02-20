import Constants from 'expo-constants';

const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
const sslPinningEnabledFromEnv = process.env.EXPO_PUBLIC_SSL_PINNING_ENABLED;
const sslPinningHostFromEnv = process.env.EXPO_PUBLIC_SSL_PINNING_HOST;
const sslPinningKeysFromEnv = process.env.EXPO_PUBLIC_SSL_PINNING_PUBLIC_KEYS;

export const API_BASE_URL = String(fromEnv || fromExtra || '').replace(/\/$/, '');

export function getMobileEnvError(): string | null {
    if (!API_BASE_URL) {
        return 'Missing EXPO_PUBLIC_API_BASE_URL. This build must target one Video Courses installation.';
    }

    let parsed: URL;
    try {
        parsed = new URL(API_BASE_URL);
    } catch {
        return 'Invalid EXPO_PUBLIC_API_BASE_URL. Provide a full URL such as https://example.com.';
    }

    if (parsed.protocol !== 'https:') {
        return 'Invalid EXPO_PUBLIC_API_BASE_URL. HTTPS is required for mobile API traffic.';
    }

    return null;
}

export function assertMobileEnv(): void {
    const configError = getMobileEnvError();
    if (configError) {
        throw new Error(configError);
    }
}

export type SslPinningConfig = {
    enabled: boolean;
    host: string;
    publicKeys: string[];
};

export function getSslPinningConfig(): SslPinningConfig | null {
    const enabled = String(sslPinningEnabledFromEnv || '').toLowerCase() === 'true';
    if (!enabled) {
        return null;
    }

    const host = String(sslPinningHostFromEnv || '').trim();
    const publicKeys = String(sslPinningKeysFromEnv || '')
        .split(',')
        .map((key) => key.trim())
        .filter(Boolean);

    if (!host || publicKeys.length === 0) {
        return null;
    }

    return {
        enabled: true,
        host,
        publicKeys,
    };
}
