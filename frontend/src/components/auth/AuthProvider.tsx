//frontend/src/components/auth/AuthProvider.tsx
"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import type { AuthResponse, AuthUser } from "@/types/auth";

type AuthContextValue = {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const response = await apiFetch("/api/auth/me", {
                method: "GET",
            });

            if (response.ok) {
                const data: AuthResponse = await response.json();
                setUser(data.user);
                return;
            }

            setUser(null);
        } catch {
            setUser(null);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiFetch("/api/auth/logout", {
                method: "POST",
            });
        } finally {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadUser() {
            try {
                const response = await apiFetch("/api/auth/me", {
                    method: "GET",
                });

                if (!isMounted) return;

                if (response.ok) {
                    const data: AuthResponse = await response.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch {
                if (!isMounted) return;
                setUser(null);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadUser();

        return () => {
            isMounted = false;
        };
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isLoading,
            isAuthenticated: !!user,
            refreshUser,
            logout,
        }),
        [user, isLoading, refreshUser, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}