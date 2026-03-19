//frontend/src/components/auth/AuthCard.tsx
import type { ReactNode } from "react";

type AuthCardProps = {
    title: string;
    subtitle: string;
    children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
    return (
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
            <div className="mb-6 space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
                <p className="text-sm leading-6 text-slate-400">{subtitle}</p>
            </div>

            {children}
        </div>
    );
}