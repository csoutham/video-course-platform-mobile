import Constants from 'expo-constants';

const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;

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
