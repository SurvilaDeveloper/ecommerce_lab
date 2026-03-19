//frontend/src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";

export function Navbar() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const { cartCount, clearCartState, toggleCartPreview } = useCart();

    async function handleLogout() {
        await logout();
        clearCartState();
        router.push("/");
        router.refresh();
    }

    return (
        <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-lg font-bold tracking-tight text-slate-100"
                    >
                        Commerce Lab
                    </Link>

                    <nav className="hidden items-center gap-4 md:flex">
                        <Link
                            href="/"
                            className="text-sm font-medium text-slate-300 transition hover:text-white"
                        >
                            Inicio
                        </Link>

                        <Link
                            href="/products"
                            className="text-sm font-medium text-slate-300 transition hover:text-white"
                        >
                            Catálogo
                        </Link>

                        {isAuthenticated && (
                            <Link
                                href="/cart"
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                <span>Carrito</span>
                                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-sky-500 px-2 py-0.5 text-xs font-bold text-slate-950">
                                    {cartCount}
                                </span>
                            </Link>
                        )}
                        {isAuthenticated && (
                            <Link
                                href="/orders"
                                className="text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                Mis órdenes
                            </Link>
                        )}

                        {user?.role === "ADMIN" && (
                            <>
                                <Link
                                    href="/admin"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin/products"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Productos
                                </Link>

                                <Link
                                    href="/admin/products/new"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Nuevo producto
                                </Link>
                                <Link
                                    href="/admin/orders"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Órdenes
                                </Link>

                            </>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {isAuthenticated && (
                        <>
                            <button
                                type="button"
                                onClick={toggleCartPreview}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                            >
                                <span className="hidden sm:inline">Mi carrito</span>
                                <span className="sm:hidden">Carrito</span>
                                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-sky-500 px-2 py-0.5 text-xs font-bold text-slate-950">
                                    {cartCount}
                                </span>
                            </button>

                            <Link
                                href="/cart"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 md:hidden"
                            >
                                <span>Ver carrito</span>
                            </Link>
                        </>
                    )}

                    {isLoading ? (
                        <div className="text-sm text-slate-400">Cargando sesión...</div>
                    ) : isAuthenticated && user ? (
                        <>
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-slate-100">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                    {user.role}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                            >
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                            >
                                Iniciar sesión
                            </Link>

                            <Link
                                href="/signup"
                                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>

                <nav className="flex w-full flex-wrap items-center gap-3 md:hidden">
                    <Link
                        href="/"
                        className="text-sm font-medium text-slate-300 transition hover:text-white"
                    >
                        Inicio
                    </Link>

                    <Link
                        href="/products"
                        className="text-sm font-medium text-slate-300 transition hover:text-white"
                    >
                        Catálogo
                    </Link>
                    {isAuthenticated && (
                        <Link
                            href="/orders"
                            className="text-sm font-medium text-slate-300 transition hover:text-white"
                        >
                            Mis órdenes
                        </Link>
                    )}

                    {user?.role === "ADMIN" && (
                        <>
                            <Link
                                href="/admin"
                                className="text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/admin/products"
                                className="text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                Productos
                            </Link>

                            <Link
                                href="/admin/products/new"
                                className="text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                Nuevo producto
                            </Link>
                            <Link
                                href="/admin/orders"
                                className="text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                Órdenes
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}