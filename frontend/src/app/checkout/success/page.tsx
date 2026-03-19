//frontend/src/app/checkout/success/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get("orderNumber");

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto flex w-full max-w-3xl px-6 py-16">
                <div className="w-full rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-8 shadow-2xl shadow-black/20">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                        Compra confirmada
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                        Tu orden fue creada correctamente
                    </h1>

                    <p className="mt-4 text-sm leading-7 text-emerald-100/90">
                        {orderNumber
                            ? `Número de orden: ${orderNumber}.`
                            : "La orden fue registrada correctamente."}
                    </p>

                    <p className="mt-2 text-sm leading-7 text-emerald-100/90">
                        En esta etapa el checkout es básico, pero ya crea la orden real,
                        descuenta stock y vacía el carrito.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/orders"
                            className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                        >
                            Ver mis órdenes
                        </Link>
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
                </div>
            </div>
        </main>
    );
}