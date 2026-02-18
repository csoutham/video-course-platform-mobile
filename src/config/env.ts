import Constants from 'expo-constants';

const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL = String(fromEnv || fromExtra || '').replace(/\/$/, '');

export function assertMobileEnv(): void {
    if (!API_BASE_URL) {
        throw new Error('Missing EXPO_PUBLIC_API_BASE_URL. This build must target one Video Courses installation.');
    }
}
