//frontend/src/components/auth/RequireRole.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import type { UserRole } from "@/types/auth";

type RequireRoleProps = {
    role: UserRole;
    children: ReactNode;
};

export function RequireRole({ role, children }: RequireRoleProps) {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        if (user?.role !== role) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, user, role, router]);

    if (isLoading) {
        return (
            <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl items-center justify-center px-6 py-12">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-4 text-sm text-slate-300">
                    Verificando acceso...
                </div>
            </main>
        );
    }

    if (!isAuthenticated || user?.role !== role) {
        return null;
    }

    return <>{children}</>;
}