//frontend/src/app/checkout/success/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getMyOrderById, type OrderResponse } from "@/lib/orders";
import { formatMoney } from "@/lib/format";
import { clearGuestLastOrder, readGuestLastOrder } from "@/lib/guest-cart";
import { useAuth } from "@/components/auth/AuthProvider";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderIdParam = searchParams.get("orderId");
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const hasInitialized = useRef(false);

    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [isGuestOrder, setIsGuestOrder] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (authLoading || hasInitialized.current) {
            return;
        }

        hasInitialized.current = true;

        async function loadOrder() {
            const guestOrder = readGuestLastOrder<OrderResponse>();

            if (guestOrder) {
                setOrder(guestOrder);
                setIsGuestOrder(true);
                setIsLoading(false);
                return;
            }

            if (!orderIdParam) {
                setErrorMessage("No se encontró la orden.");
                setIsLoading(false);
                return;
            }

            const orderId = Number(orderIdParam);

            if (!Number.isFinite(orderId) || orderId <= 0) {
                setErrorMessage("El identificador de la orden es inválido.");
                setIsLoading(false);
                return;
            }

            if (!isAuthenticated) {
                setErrorMessage(
                    "No se pudo recuperar la orden. Si realizaste la compra como invitado, volvé a intentar desde la confirmación final."
                );
                setIsLoading(false);
                return;
            }

            try {
                const data = await getMyOrderById(orderId);
                setOrder(data);
                setIsGuestOrder(false);
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

        loadOrder();
    }, [authLoading, isAuthenticated, orderIdParam]);

    useEffect(() => {
        if (order && isGuestOrder) {
            clearGuestLastOrder();
        }
    }, [order, isGuestOrder]);

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto flex w-full max-w-3xl px-6 py-16">
                <div className="w-full rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-8 shadow-2xl shadow-black/20">
                    {isLoading ? (
                        <p className="text-sm text-emerald-100/90">
                            Cargando confirmación...
                        </p>
                    ) : errorMessage ? (
                        <>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-300">
                                Error
                            </p>

                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                                No se pudo cargar la orden
                            </h1>

                            <p className="mt-4 text-sm leading-7 text-red-100/90">
                                {errorMessage}
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="/products"
                                    className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                                >
                                    Seguir comprando
                                </Link>
                                <Link
                                    href="/"
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                                >
                                    Volver al inicio
                                </Link>
                                {isAuthenticated ? (
                                    <Link
                                        href="/orders"
                                        className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                                    >
                                        Ver mis órdenes
                                    </Link>
                                ) : null}
                            </div>
                        </>
                    ) : order ? (
                        <>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                                Compra confirmada
                            </p>

                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                                Tu orden fue creada correctamente
                            </h1>

                            <p className="mt-4 text-sm leading-7 text-emerald-50/90">
                                {isGuestOrder
                                    ? "Tu compra quedó registrada como visitante."
                                    : "Tu compra quedó registrada en tu cuenta."}
                            </p>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-emerald-400/15 bg-slate-950/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                        Número de orden
                                    </p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        {order.orderNumber}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-emerald-400/15 bg-slate-950/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                        Total
                                    </p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        {formatMoney(order.grandTotal, order.currency)}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-emerald-400/15 bg-slate-950/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                        Entrega
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                        {order.deliveryMethod === "DELIVERY"
                                            ? "Envío a domicilio"
                                            : "Retiro en local"}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-emerald-400/15 bg-slate-950/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                        Estado
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                        {order.status}
                                    </p>
                                </div>
                            </div>

                            {order.shippingAddress ? (
                                <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-slate-950/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                        Dirección de envío
                                    </p>

                                    <div className="mt-3 space-y-1 text-sm text-emerald-50/90">
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
                            ) : null}

                            {order.notes ? (
                                <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-slate-950/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                        Notas del pedido
                                    </p>
                                    <p className="mt-3 text-sm leading-7 text-emerald-50/90">
                                        {order.notes}
                                    </p>
                                </div>
                            ) : null}

                            <div className="mt-8 flex flex-wrap gap-3">
                                {!isGuestOrder && isAuthenticated ? (
                                    <Link
                                        href="/orders"
                                        className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                                    >
                                        Ver mis órdenes
                                    </Link>
                                ) : null}

                                <Link
                                    href="/products"
                                    className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                                >
                                    Seguir comprando
                                </Link>

                                <Link
                                    href="/"
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                                >
                                    Volver al inicio
                                </Link>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </main>
    );
}