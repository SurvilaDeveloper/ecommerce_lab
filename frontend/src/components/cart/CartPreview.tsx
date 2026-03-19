//frontend/src/components/cart/CartPreview.tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/format";

export function CartPreview() {
    const { cart, cartCount, isOpen, closeCartPreview, isLoading } = useCart();

    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                closeCartPreview();
            }
        }

        if (isOpen) {
            window.addEventListener("keydown", handleEscape);
        }

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, closeCartPreview]);

    if (!isOpen) {
        return null;
    }

    const items = cart?.items ?? [];

    return (
        <>
            <button
                type="button"
                aria-label="Cerrar resumen del carrito"
                onClick={closeCartPreview}
                className="fixed inset-0 z-40 bg-black/50"
            />

            <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Tu carrito</h2>
                        <p className="text-sm text-slate-400">
                            {cartCount} producto{cartCount === 1 ? "" : "s"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeCartPreview}
                        className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                    >
                        Cerrar
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {isLoading ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-8 text-center text-sm text-slate-400">
                            Cargando carrito...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-4 py-8 text-center">
                            <p className="text-sm text-slate-400">Tu carrito está vacío.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3"
                                >
                                    <div className="flex gap-3">
                                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                                            {item.productPrimaryImageUrl ? (
                                                <img
                                                    src={item.productPrimaryImageUrl}
                                                    alt={item.productName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                                                    Sin imagen
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/products/${item.productSlug}`}
                                                onClick={closeCartPreview}
                                                className="line-clamp-2 text-sm font-semibold text-white transition hover:text-sky-300"
                                            >
                                                {item.productName}
                                            </Link>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Cantidad: {item.quantity}
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-white">
                                                {formatMoney(item.lineTotal, "ARS")}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-800 px-5 py-4">
                    <div className="mb-4 flex items-center justify-between text-sm">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="font-semibold text-white">
                            {formatMoney(cart?.subtotal ?? 0, "ARS")}
                        </span>
                    </div>

                    <div className="grid gap-3">
                        <Link
                            href="/cart"
                            onClick={closeCartPreview}
                            className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                        >
                            Ver carrito
                        </Link>

                        <Link
                            href="/products"
                            onClick={closeCartPreview}
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                        >
                            Seguir comprando
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}