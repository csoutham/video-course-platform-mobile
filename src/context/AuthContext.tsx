import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ApiClient } from '../api/client';
import { clearToken, readToken, writeToken } from '../auth/tokenStore';
import type { LoginResponse, MobileUser } from '../types/api';

type AuthContextValue = {
    token: string | null;
    user: MobileUser | null;
    isBootstrapping: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    apiClient: ApiClient;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<MobileUser | null>(null);
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    const apiClient = useMemo(() => new ApiClient(async () => token), [token]);

    useEffect(() => {
        (async () => {
            const storedToken = await readToken();

            if (!storedToken) {
                setIsBootstrapping(false);
                return;
            }

            setToken(storedToken);

            try {
                const response = await new ApiClient(async () => storedToken).request<{ user: MobileUser }>(
                    '/api/v1/mobile/me',
                );
                setUser(response.user);
            } catch {
                await clearToken();
                setToken(null);
                setUser(null);
            } finally {
                setIsBootstrapping(false);
            }
        })();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        const payload = await apiClient.request<LoginResponse>('/api/v1/mobile/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                device_name: 'Video Courses Mobile',
            }),
        });

        await writeToken(payload.token);
        setToken(payload.token);
        setUser(payload.user);
    };

    const logout = async (): Promise<void> => {
        try {
            await apiClient.request('/api/v1/mobile/auth/logout', {
                method: 'POST',
            });
        } catch {
            // no-op on logout failure
        }

        await clearToken();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isBootstrapping,
                login,
                logout,
                apiClient,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
