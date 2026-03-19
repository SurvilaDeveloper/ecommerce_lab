//frontend/src/app/admin/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/RequireRole";
import { getAdminDashboard, type AdminDashboardResponse } from "@/lib/admin-dashboard";
import { formatMoney } from "@/lib/format";

function formatDate(value: string | null) {
    if (!value) return "—";

    try {
        return new Intl.DateTimeFormat("es-AR", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value));
    } catch {
        return value;
    }
}

function AdminDashboardPageContent() {
    const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await getAdminDashboard();
            setDashboard(data);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo cargar el dashboard.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-7xl px-6 py-10">
                <header className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                        Admin · Dashboard
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Resumen general
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-slate-400">
                        Un vistazo rápido al estado del catálogo, usuarios, órdenes e inventario.
                    </p>
                </header>

                {errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                        Cargando dashboard...
                    </div>
                ) : dashboard ? (
                    <>
                        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {dashboard.metrics.map((metric) => {
                                const looksLikeMoney = metric.label === "Ingresos cobrados";
                                return (
                                    <article
                                        key={metric.label}
                                        className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20"
                                    >
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            {metric.label}
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-white">
                                            {looksLikeMoney ? formatMoney(Number(metric.value || 0), "ARS") : metric.value}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {metric.description}
                                        </p>
                                    </article>
                                );
                            })}
                        </section>

                        <section className="mt-10 grid gap-8 xl:grid-cols-2">
                            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                                <div className="mb-5 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-white">
                                        Órdenes recientes
                                    </h2>
                                    <Link
                                        href="/admin/orders"
                                        className="text-sm font-semibold text-sky-400 transition hover:text-sky-300"
                                    >
                                        Ver todas
                                    </Link>
                                </div>

                                {dashboard.recentOrders.length === 0 ? (
                                    <p className="text-sm text-slate-400">No hay órdenes todavía.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboard.recentOrders.map((order) => (
                                            <article
                                                key={order.id}
                                                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                                            >
                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                    <div>
                                                        <p className="font-semibold text-white">{order.orderNumber}</p>
                                                        <p className="text-sm text-slate-400">{order.customerName}</p>
                                                        <p className="text-xs text-slate-500">{order.customerEmail}</p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-semibold text-white">
                                                            {formatMoney(order.grandTotal, order.currency)}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {formatDate(order.placedAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
                                                        {order.status}
                                                    </span>
                                                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
                                                        {order.paymentStatus}
                                                    </span>
                                                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
                                                        {order.fulfillmentStatus}
                                                    </span>
                                                </div>

                                                <div className="mt-4">
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="text-sm font-semibold text-sky-400 transition hover:text-sky-300"
                                                    >
                                                        Ver detalle →
                                                    </Link>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                                <div className="mb-5 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-white">
                                        Productos con stock bajo
                                    </h2>
                                    <Link
                                        href="/admin/products"
                                        className="text-sm font-semibold text-sky-400 transition hover:text-sky-300"
                                    >
                                        Ver productos
                                    </Link>
                                </div>

                                {dashboard.lowStockProducts.length === 0 ? (
                                    <p className="text-sm text-slate-400">
                                        No hay productos con stock bajo.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboard.lowStockProducts.map((product) => (
                                            <article
                                                key={product.id}
                                                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="font-semibold text-white">{product.name}</p>
                                                        <p className="text-sm text-slate-400">{product.categoryName}</p>
                                                        <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-sm text-slate-400">Stock actual</p>
                                                        <p className="text-xl font-bold text-white">{product.stock}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                                                    <span>Umbral configurado: {product.lowStockThreshold}</span>
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="font-semibold text-sky-400 transition hover:text-sky-300"
                                                    >
                                                        Editar →
                                                    </Link>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                ) : null}
            </div>
        </main>
    );
}

export default function AdminDashboardPage() {
    return (
        <RequireRole role="ADMIN">
            <AdminDashboardPageContent />
        </RequireRole>
    );
}