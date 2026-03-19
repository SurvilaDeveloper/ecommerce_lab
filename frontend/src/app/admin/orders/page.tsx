//frontend/src/app/admin/orders/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/RequireRole";
import { getAdminOrders, type AdminOrderResponse } from "@/lib/admin-orders";
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

function AdminOrdersPageContent() {
    const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await getAdminOrders();
            setOrders(data);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudieron cargar las órdenes.");
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
                        Admin · Órdenes
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Panel de órdenes
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-slate-400">
                        Acá podés ver todas las órdenes generadas por los usuarios.
                    </p>
                </header>

                {errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                <section className="mt-8">
                    {isLoading ? (
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                            Cargando órdenes...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-slate-400">
                            Todavía no hay órdenes registradas.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-950/70 text-left text-slate-400">
                                        <tr>
                                            <th className="px-4 py-4 font-medium">Orden</th>
                                            <th className="px-4 py-4 font-medium">Cliente</th>
                                            <th className="px-4 py-4 font-medium">Fecha</th>
                                            <th className="px-4 py-4 font-medium">Estado</th>
                                            <th className="px-4 py-4 font-medium">Pago</th>
                                            <th className="px-4 py-4 font-medium">Entrega</th>
                                            <th className="px-4 py-4 font-medium">Total</th>
                                            <th className="px-4 py-4 font-medium">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id} className="border-t border-slate-800 align-top">
                                                <td className="px-4 py-4">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-slate-100">
                                                            {order.orderNumber}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            #{order.id}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-slate-200">
                                                            {order.customerName}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {order.customerEmail}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-slate-300">
                                                    {formatDate(order.placedAt)}
                                                </td>

                                                <td className="px-4 py-4 text-slate-300">
                                                    {order.status}
                                                </td>

                                                <td className="px-4 py-4 text-slate-300">
                                                    {order.paymentStatus}
                                                </td>

                                                <td className="px-4 py-4 text-slate-300">
                                                    {order.fulfillmentStatus}
                                                </td>

                                                <td className="px-4 py-4 font-semibold text-white">
                                                    {formatMoney(order.grandTotal, order.currency)}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="inline-flex rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                                                    >
                                                        Ver detalle
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default function AdminOrdersPage() {
    return (
        <RequireRole role="ADMIN">
            <AdminOrdersPageContent />
        </RequireRole>
    );
}