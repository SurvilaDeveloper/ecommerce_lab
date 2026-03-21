//frontend/src/app/orders/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyOrders, type OrderResponse } from "@/lib/orders";
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

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await getMyOrders();
            setOrders(data);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudieron cargar tus órdenes.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-6xl px-6 py-12">
                <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                            Mi cuenta
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Historial de órdenes
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-slate-400">
                            Acá podés ver las compras que fuiste generando desde el checkout.
                        </p>
                    </div>

                    <Link
                        href="/products"
                        className="text-sm font-semibold text-sky-400 transition hover:text-sky-300"
                    >
                        Seguir comprando →
                    </Link>
                </header>

                {errorMessage && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                        Cargando órdenes...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
                        <div className="mx-auto max-w-md space-y-3">
                            <h2 className="text-xl font-semibold text-slate-100">
                                Todavía no tenés órdenes
                            </h2>
                            <p className="text-sm leading-6 text-slate-400">
                                Cuando finalices una compra, tus órdenes aparecerán acá.
                            </p>
                            <div className="pt-2">
                                <Link
                                    href="/products"
                                    className="inline-flex rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                                >
                                    Ir al catálogo
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <article
                                key={order.id}
                                className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
                                            {order.orderNumber}
                                        </p>
                                        <h2 className="text-xl font-semibold text-white">
                                            Orden #{order.id}
                                        </h2>
                                        <p className="text-sm text-slate-400">
                                            Creada el {formatDate(order.placedAt)}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-slate-300">
                                            Estado: {order.status}
                                        </span>
                                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-slate-300">
                                            Pago: {order.paymentStatus}
                                        </span>
                                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-slate-300">
                                            Entrega: {order.fulfillmentStatus}
                                        </span>
                                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-slate-300">
                                            Método:{" "}
                                            {order.deliveryMethod === "DELIVERY"
                                                ? "Envío"
                                                : "Retiro"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                            Datos del pedido
                                        </p>

                                        <div className="mt-3 space-y-2 text-sm">
                                            <p className="text-slate-200">
                                                <span className="text-slate-400">Recibe:</span>{" "}
                                                {order.recipientName}
                                            </p>
                                            <p className="text-slate-200">
                                                <span className="text-slate-400">Teléfono:</span>{" "}
                                                {order.phone}
                                            </p>
                                        </div>

                                        {order.notes ? (
                                            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                    Notas
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                                    {order.notes}
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                            Entrega
                                        </p>

                                        {order.shippingAddress ? (
                                            <div className="mt-3 space-y-1 text-sm text-slate-300">
                                                <p>{order.shippingAddress.recipientName}</p>
                                                <p>
                                                    {order.shippingAddress.line1}
                                                    {order.shippingAddress.line2
                                                        ? `, ${order.shippingAddress.line2}`
                                                        : ""}
                                                </p>
                                                <p>
                                                    {order.shippingAddress.city}
                                                    {order.shippingAddress.state
                                                        ? `, ${order.shippingAddress.state}`
                                                        : ""}
                                                </p>
                                                <p>
                                                    {order.shippingAddress.postalCode} ·{" "}
                                                    {order.shippingAddress.countryCode}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="mt-3 text-sm text-slate-300">
                                                Retiro en local.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-slate-950/70 text-left text-slate-400">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Producto</th>
                                                    <th className="px-4 py-3 font-medium">SKU</th>
                                                    <th className="px-4 py-3 font-medium">Cantidad</th>
                                                    <th className="px-4 py-3 font-medium">Unitario</th>
                                                    <th className="px-4 py-3 font-medium">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item) => (
                                                    <tr key={item.id} className="border-t border-slate-800">
                                                        <td className="px-4 py-3 text-slate-200">
                                                            {item.productName}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-400">
                                                            {item.productSku}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-400">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-400">
                                                            {formatMoney(item.unitPrice, order.currency)}
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-white">
                                                            {formatMoney(item.lineTotal, order.currency)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-5 flex justify-end">
                                    <div className="w-full max-w-sm space-y-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                                        <div className="flex items-center justify-between text-sm text-slate-400">
                                            <span>Subtotal</span>
                                            <span>{formatMoney(order.subtotal, order.currency)}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-slate-400">
                                            <span>Envío</span>
                                            <span>
                                                {formatMoney(order.shippingTotal, order.currency)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-lg font-bold text-white">
                                            <span>Total</span>
                                            <span>{formatMoney(order.grandTotal, order.currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}