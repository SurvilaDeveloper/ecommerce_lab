//frontend/src/app/admin/orders/[orderId]/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { RequireRole } from "@/components/auth/RequireRole";
import {
    getAdminOrderById,
    updateAdminOrderStatus,
    type AdminOrderResponse,
} from "@/lib/admin-orders";
import { formatMoney } from "@/lib/format";

const ORDER_STATUS_OPTIONS = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
] as const;

const PAYMENT_STATUS_OPTIONS = [
    "PENDING",
    "AUTHORIZED",
    "PAID",
    "FAILED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
] as const;

const FULFILLMENT_STATUS_OPTIONS = [
    "UNFULFILLED",
    "PARTIALLY_FULFILLED",
    "FULFILLED",
    "RETURNED",
] as const;

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

function AdminOrderDetailPageContent() {
    const params = useParams();
    const orderId = Number(params.orderId);

    const [order, setOrder] = useState<AdminOrderResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [message, setMessage] = useState("");

    const [status, setStatus] = useState("PENDING");
    const [paymentStatus, setPaymentStatus] = useState("PENDING");
    const [fulfillmentStatus, setFulfillmentStatus] = useState("UNFULFILLED");

    useEffect(() => {
        if (!Number.isInteger(orderId) || orderId <= 0) {
            setIsLoading(false);
            setErrorMessage("El orderId de la URL no es válido.");
            return;
        }

        loadOrder();
    }, [orderId]);

    async function loadOrder() {
        setIsLoading(true);
        setErrorMessage("");
        setMessage("");

        try {
            const data = await getAdminOrderById(orderId);
            setOrder(data);
            hydrateForm(data);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo cargar la orden.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    function hydrateForm(data: AdminOrderResponse) {
        setStatus(data.status);
        setPaymentStatus(data.paymentStatus);
        setFulfillmentStatus(data.fulfillmentStatus);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSaving(true);
        setErrorMessage("");
        setMessage("");

        try {
            const updated = await updateAdminOrderStatus(orderId, {
                status,
                paymentStatus,
                fulfillmentStatus,
            });

            setOrder(updated);
            hydrateForm(updated);
            setMessage("Estados de la orden actualizados correctamente.");
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudieron actualizar los estados.");
            }
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-6xl px-6 py-10">
                <header className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                        Admin · Órdenes · Detalle
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Detalle de orden
                    </h1>
                </header>

                {errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                {message && (
                    <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {message}
                    </div>
                )}

                {isLoading ? (
                    <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                        Cargando orden...
                    </div>
                ) : order ? (
                    <>
                        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <Info label="Orden" value={order.orderNumber} />
                            <Info label="Cliente" value={order.customerName} />
                            <Info label="Email" value={order.customerEmail} />
                            <Info label="Fecha" value={formatDate(order.placedAt)} />
                            <Info label="Recibe" value={order.recipientName} />
                            <Info label="Teléfono" value={order.phone} />
                            <Info
                                label="Método"
                                value={
                                    order.deliveryMethod === "DELIVERY"
                                        ? "Envío a domicilio"
                                        : "Retiro en local"
                                }
                            />
                            <Info label="Total" value={formatMoney(order.grandTotal, order.currency)} />
                        </section>

                        <section className="mt-8 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                                <h2 className="text-xl font-semibold text-white">
                                    Información del pedido
                                </h2>

                                {order.shippingAddress ? (
                                    <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                            Dirección de envío
                                        </p>

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
                                    </div>
                                ) : (
                                    <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                            Entrega
                                        </p>
                                        <p className="mt-3 text-sm text-slate-300">
                                            Esta orden fue cargada con retiro en local.
                                        </p>
                                    </div>
                                )}

                                {order.notes ? (
                                    <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                            Notas del pedido
                                        </p>
                                        <p className="mt-3 text-sm leading-7 text-slate-300">
                                            {order.notes}
                                        </p>
                                    </div>
                                ) : null}

                                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                        Resumen económico
                                    </p>

                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between text-sm text-slate-400">
                                            <span>Subtotal</span>
                                            <span>{formatMoney(order.subtotal, order.currency)}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-slate-400">
                                            <span>Envío</span>
                                            <span>{formatMoney(order.shippingTotal, order.currency)}</span>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-base font-semibold text-white">
                                            <span>Total</span>
                                            <span>{formatMoney(order.grandTotal, order.currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                                <h2 className="text-xl font-semibold text-white">
                                    Actualizar estados
                                </h2>

                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-6 grid gap-5 md:grid-cols-3"
                                >
                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-200">
                                            Estado de orden
                                        </span>
                                        <select
                                            value={status}
                                            onChange={(event) => setStatus(event.target.value)}
                                            className="input"
                                        >
                                            {ORDER_STATUS_OPTIONS.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-200">
                                            Estado de pago
                                        </span>
                                        <select
                                            value={paymentStatus}
                                            onChange={(event) => setPaymentStatus(event.target.value)}
                                            className="input"
                                        >
                                            {PAYMENT_STATUS_OPTIONS.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-200">
                                            Estado de entrega
                                        </span>
                                        <select
                                            value={fulfillmentStatus}
                                            onChange={(event) => setFulfillmentStatus(event.target.value)}
                                            className="input"
                                        >
                                            {FULFILLMENT_STATUS_OPTIONS.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="md:col-span-3">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isSaving ? "Guardando..." : "Guardar estados"}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </section>

                        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-950/70 text-left text-slate-400">
                                        <tr>
                                            <th className="px-4 py-4 font-medium">Producto</th>
                                            <th className="px-4 py-4 font-medium">SKU</th>
                                            <th className="px-4 py-4 font-medium">Cantidad</th>
                                            <th className="px-4 py-4 font-medium">Unitario</th>
                                            <th className="px-4 py-4 font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item) => (
                                            <tr key={item.id} className="border-t border-slate-800">
                                                <td className="px-4 py-4 text-slate-200">
                                                    {item.productName}
                                                </td>
                                                <td className="px-4 py-4 text-slate-400">
                                                    {item.productSku}
                                                </td>
                                                <td className="px-4 py-4 text-slate-400">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-4 text-slate-400">
                                                    {formatMoney(item.unitPrice, order.currency)}
                                                </td>
                                                <td className="px-4 py-4 font-semibold text-white">
                                                    {formatMoney(item.lineTotal, order.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <div className="mt-8">
                            <Link
                                href="/admin/orders"
                                className="inline-flex rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                            >
                                Volver a órdenes
                            </Link>
                        </div>
                    </>
                ) : null}
            </div>
        </main>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-base font-semibold text-slate-100">{value || "—"}</p>
        </div>
    );
}

export default function AdminOrderDetailPage() {
    return (
        <RequireRole role="ADMIN">
            <AdminOrderDetailPageContent />
        </RequireRole>
    );
}