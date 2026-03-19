//frontend/src/app/signup/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";

export default function SignupPage() {
    const router = useRouter();
    const { refreshUser } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const response = await apiFetch("/api/auth/signup", {
                method: "POST",
                json: {
                    firstName,
                    lastName,
                    email,
                    password,
                },
            });

            if (!response.ok) {
                let message = "No se pudo crear la cuenta.";

                try {
                    const errorData = await response.json();
                    if (typeof errorData?.message === "string" && errorData.message.trim()) {
                        message = errorData.message;
                    }
                } catch {
                    // Ignorado: dejamos el mensaje genérico
                }

                setErrorMessage(message);
                return;
            }

            await refreshUser();
            router.push("/");
            router.refresh();
        } catch {
            setErrorMessage("Ocurrió un error inesperado al registrarte.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl items-center justify-center px-6 py-12">
            <AuthCard
                title="Crear cuenta"
                subtitle="Registrate para empezar a usar la plataforma y acceder a tu sesión."
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="firstName"
                                className="text-sm font-medium text-slate-200"
                            >
                                Nombre
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                autoComplete="given-name"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                placeholder="Gabriel"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="lastName"
                                className="text-sm font-medium text-slate-200"
                            >
                                Apellido
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                autoComplete="family-name"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                placeholder="Survila"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-slate-200"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                            placeholder="tuemail@ejemplo.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-slate-200"
                        >
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                            placeholder="Mínimo 8 caracteres"
                            required
                        />
                    </div>

                    {errorMessage && (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                    </button>

                    <p className="text-center text-sm text-slate-400">
                        ¿Ya tenés cuenta?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-sky-400 transition hover:text-sky-300"
                        >
                            Iniciá sesión
                        </Link>
                    </p>
                </form>
            </AuthCard>
        </main>
    );
}