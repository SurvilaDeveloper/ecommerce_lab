//frontend/src/app/cart/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    clearCart,
    getCart,
    removeCartItem,
    updateCartItem,
    type CartResponse,
} from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { useRouter } from "next/navigation";

function CartPageContent() {
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [busyItemId, setBusyItemId] = useState<number | null>(null);
    const [isClearing, setIsClearing] = useState(false);
    const { refreshCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        loadCart();
    }, []);

    async function loadCart() {
        setIsLoading(true);
        setErrorMessage("");
        setMessage("");

        try {
            const data = await getCart();
            setCart(data);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo cargar el carrito.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleUpdateQuantity(itemId: number, quantity: number) {
        if (quantity <= 0) return;

        setBusyItemId(itemId);
        setMessage("");
        setErrorMessage("");

        try {
            const updatedCart = await updateCartItem(itemId, quantity);
            setCart(updatedCart);
            await refreshCart();
            setMessage("Cantidad actualizada.");
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo actualizar la cantidad.");
            }
        } finally {
            setBusyItemId(null);
        }
    }

    async function handleRemoveItem(itemId: number) {
        setBusyItemId(itemId);
        setMessage("");
        setErrorMessage("");

        try {
            const updatedCart = await removeCartItem(itemId);
            setCart(updatedCart);
            await refreshCart();
            setMessage("Producto eliminado del carrito.");
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo eliminar el ítem.");
            }
        } finally {
            setBusyItemId(null);
        }
    }

    async function handleClearCart() {
        setIsClearing(true);
        setMessage("");
        setErrorMessage("");

        try {
            const updatedCart = await clearCart();
            setCart(updatedCart);
            await refreshCart();
            setMessage("Carrito vaciado correctamente.");
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo vaciar el carrito.");
            }
        } finally {
            setIsClearing(false);
        }
    }

    function handleCheckout() {
        setMessage("");
        setErrorMessage("");
        router.push("/checkout");
    }

    const items = useMemo(() => cart?.items ?? [], [cart]);

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-7xl px-6 py-12">
                <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                            Tu carrito
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Carrito de compras
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-slate-400">
                            Revisá los productos agregados, ajustá cantidades y prepará el próximo paso.
                        </p>
                    </div>

                    <Link
                        href="/products"
                        className="text-sm font-semibold text-sky-400 transition hover:text-sky-300"
                    >
                        Seguir comprando →
                    </Link>
                </header>

                {message && (
                    <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {message}
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                        Cargando carrito...
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
                        <div className="mx-auto max-w-md space-y-3">
                            <h2 className="text-xl font-semibold text-slate-100">
                                Tu carrito está vacío
                            </h2>
                            <p className="text-sm leading-6 text-slate-400">
                                Agregá productos desde el catálogo para empezar a armar tu compra.
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
                    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                        <section className="space-y-4">
                            {items.map((item) => {
                                const canDecrease = item.quantity > 1;
                                const canIncrease = item.quantity < item.availableStock;
                                const isBusy = busyItemId === item.id;

                                return (
                                    <article
                                        key={item.id}
                                        className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-black/20"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row">
                                            <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 sm:w-28">
                                                {item.productPrimaryImageUrl ? (
                                                    <img
                                                        src={item.productPrimaryImageUrl}
                                                        alt={item.productName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col gap-4">
                                                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                                    <div className="space-y-1">
                                                        <Link
                                                            href={`/products/${item.productSlug}`}
                                                            className="text-lg font-semibold text-white transition hover:text-sky-300"
                                                        >
                                                            {item.productName}
                                                        </Link>
                                                        <p className="text-xs text-slate-400">SKU: {item.productSku}</p>
                                                        {!item.productActive && (
                                                            <p className="text-xs text-red-300">
                                                                Este producto ya no está activo.
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-sm text-slate-400">Unitario</p>
                                                        <p className="text-lg font-semibold text-white">
                                                            {formatMoney(item.unitPrice, "ARS")}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={!canDecrease || isBusy}
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            −
                                                        </button>

                                                        <div className="min-w-12 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white">
                                                            {item.quantity}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            disabled={!canIncrease || isBusy}
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            +
                                                        </button>

                                                        <span className="text-xs text-slate-500">
                                                            Stock disponible: {item.availableStock}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <p className="text-lg font-bold text-white">
                                                            {formatMoney(item.lineTotal, "ARS")}
                                                        </p>

                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="rounded-xl border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            Quitar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                            <h2 className="text-xl font-semibold text-white">Resumen</h2>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between text-sm text-slate-400">
                                    <span>Items</span>
                                    <span>{cart?.totalItems ?? 0}</span>
                                </div>

                                <div className="flex items-center justify-between text-base text-slate-200">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-white">
                                        {formatMoney(cart?.subtotal ?? 0, "ARS")}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    className="w-full rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                                >
                                    Continuar al checkout
                                </button>

                                <button
                                    type="button"
                                    disabled={isClearing}
                                    onClick={handleClearCart}
                                    className="w-full rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isClearing ? "Vaciando..." : "Vaciar carrito"}
                                </button>
                            </div>

                            <p className="mt-4 text-xs leading-5 text-slate-500">
                                En el siguiente paso vas a completar los datos de entrega antes de confirmar la compra.
                            </p>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function CartPage() {
    return <CartPageContent />;
}