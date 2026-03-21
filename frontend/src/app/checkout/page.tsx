//frontend/src/app/checkout/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, type CartResponse } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { checkoutOrder, type CheckoutRequest } from "@/lib/orders";
import { useCart } from "@/components/cart/CartProvider";

type DeliveryMethod = "PICKUP" | "DELIVERY";

export default function CheckoutPage() {
    const router = useRouter();
    const { refreshCart } = useCart();

    const [cart, setCart] = useState<CartResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [deliveryMethod, setDeliveryMethod] =
        useState<DeliveryMethod>("PICKUP");
    const [recipientName, setRecipientName] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [line1, setLine1] = useState("");
    const [line2, setLine2] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [countryCode, setCountryCode] = useState("AR");

    useEffect(() => {
        loadCart();
    }, []);

    async function loadCart() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await getCart();
            setCart(data);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo cargar el checkout.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const items = useMemo(() => cart?.items ?? [], [cart]);
    const subtotal = cart?.subtotal ?? 0;
    const shippingTotal = deliveryMethod === "DELIVERY" ? 3500 : 0;
    const total = subtotal + shippingTotal;

    const canSubmit = useMemo(() => {
        if (items.length === 0) return false;
        if (!recipientName.trim()) return false;
        if (!phone.trim()) return false;

        if (deliveryMethod === "DELIVERY") {
            if (!line1.trim()) return false;
            if (!city.trim()) return false;
            if (!postalCode.trim()) return false;
            if (!countryCode.trim()) return false;
        }

        return true;
    }, [
        items.length,
        recipientName,
        phone,
        deliveryMethod,
        line1,
        city,
        postalCode,
        countryCode,
    ]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!canSubmit) return;

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const payload: CheckoutRequest = {
                deliveryMethod,
                recipientName: recipientName.trim(),
                phone: phone.trim(),
                notes: notes.trim() || undefined,
            };

            if (deliveryMethod === "DELIVERY") {
                payload.shippingAddress = {
                    line1: line1.trim(),
                    line2: line2.trim() || undefined,
                    city: city.trim(),
                    state: state.trim() || undefined,
                    postalCode: postalCode.trim(),
                    countryCode: countryCode.trim().toUpperCase(),
                };
            }

            const order = await checkoutOrder(payload);
            await refreshCart();

            router.push(`/checkout/success?orderId=${order.id}`);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo finalizar la compra.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-7xl px-6 py-12">
                <header className="mb-8 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                        Checkout
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        Finalizar compra
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-slate-400">
                        Completá tus datos de retiro o envío antes de confirmar la orden.
                    </p>
                </header>

                {errorMessage && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                        Cargando checkout...
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
                        <div className="mx-auto max-w-md space-y-3">
                            <h2 className="text-xl font-semibold text-slate-100">
                                Tu carrito está vacío
                            </h2>
                            <p className="text-sm leading-6 text-slate-400">
                                Agregá productos al carrito antes de continuar al checkout.
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
                    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold text-white">
                                        Datos del comprador
                                    </h2>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">
                                                Nombre y apellido
                                            </label>
                                            <input
                                                value={recipientName}
                                                onChange={(event) =>
                                                    setRecipientName(event.target.value)
                                                }
                                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                                placeholder="Gabriel Survila"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">
                                                Teléfono
                                            </label>
                                            <input
                                                value={phone}
                                                onChange={(event) =>
                                                    setPhone(event.target.value)
                                                }
                                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                                placeholder="11 1234 5678"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold text-white">
                                        Método de entrega
                                    </h2>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryMethod("PICKUP")}
                                            className={`rounded-2xl border px-4 py-4 text-left transition ${deliveryMethod === "PICKUP"
                                                    ? "border-sky-500 bg-sky-500/10"
                                                    : "border-slate-700 bg-slate-950 hover:border-slate-600"
                                                }`}
                                        >
                                            <div className="font-semibold text-white">
                                                Retiro
                                            </div>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Retirás el pedido personalmente.
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setDeliveryMethod("DELIVERY")}
                                            className={`rounded-2xl border px-4 py-4 text-left transition ${deliveryMethod === "DELIVERY"
                                                    ? "border-sky-500 bg-sky-500/10"
                                                    : "border-slate-700 bg-slate-950 hover:border-slate-600"
                                                }`}
                                        >
                                            <div className="font-semibold text-white">
                                                Envío
                                            </div>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Enviamos el pedido a tu dirección.
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                {deliveryMethod === "DELIVERY" ? (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold text-white">
                                            Dirección de envío
                                        </h2>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-medium text-slate-300">
                                                    Dirección
                                                </label>
                                                <input
                                                    value={line1}
                                                    onChange={(event) =>
                                                        setLine1(event.target.value)
                                                    }
                                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                                    placeholder="Calle 1234"
                                                />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-medium text-slate-300">
                                                    Piso / depto / referencia
                                                </label>
                                                <input
                                                    value={line2}
                                                    onChange={(event) =>
                                                        setLine2(event.target.value)
                                                    }
                                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                                    placeholder="Depto B"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">
                                                    Ciudad
                                                </label>
                                                <input
                                                    value={city}
                                                    onChange={(event) =>
                                                        setCity(event.target.value)
                                                    }
                                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                                    placeholder="Berazategui"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">
                                                    Provincia
                                                </label>
                                                <input
                                                    value={state}
                                                    onChange={(event) =>
                                                        setState(event.target.value)
                                                    }
                                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                                    placeholder="Buenos Aires"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">
                                                    Código postal
                                                </label>
                                                <input
                                                    value={postalCode}
                                                    onChange={(event) =>
                                                        setPostalCode(event.target.value)
                                                    }
                                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                                    placeholder="1884"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">
                                                    País
                                                </label>
                                                <input
                                                    value={countryCode}
                                                    onChange={(event) =>
                                                        setCountryCode(event.target.value)
                                                    }
                                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                                    placeholder="AR"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">
                                        Notas del pedido
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(event) => setNotes(event.target.value)}
                                        rows={4}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                        placeholder="Indicaciones adicionales para tu pedido"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/cart"
                                        className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                                    >
                                        Volver al carrito
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={!canSubmit || isSubmitting}
                                        className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSubmitting
                                            ? "Procesando compra..."
                                            : "Confirmar compra"}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                            <h2 className="text-xl font-semibold text-white">Resumen</h2>

                            <div className="mt-6 space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4"
                                    >
                                        <div>
                                            <p className="font-medium text-white">
                                                {item.productName}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                Cantidad: {item.quantity}
                                            </p>
                                        </div>

                                        <p className="text-sm font-semibold text-white">
                                            {formatMoney(item.lineTotal, "ARS")}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between text-sm text-slate-400">
                                    <span>Subtotal</span>
                                    <span>{formatMoney(subtotal, "ARS")}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm text-slate-400">
                                    <span>Envío</span>
                                    <span>{formatMoney(shippingTotal, "ARS")}</span>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-base font-bold text-white">
                                    <span>Total</span>
                                    <span>{formatMoney(total, "ARS")}</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}