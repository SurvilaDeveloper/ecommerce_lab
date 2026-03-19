//frontend/src/app/admin/products/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/RequireRole";
import { getProducts, type ProductResponse } from "@/lib/products";

function formatMoney(value: number, currency: string) {
    try {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${currency} ${value}`;
    }
}

function ProductsAdminPageContent() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudieron cargar los productos.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-7xl px-6 py-10">
                <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                            Admin · Productos
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Listado de productos
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-slate-400">
                            Desde acá podés ver el catálogo cargado, entrar a editar un producto
                            o gestionar sus imágenes.
                        </p>
                    </div>

                    <Link
                        href="/admin/products/new"
                        className="inline-flex rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                    >
                        Nuevo producto
                    </Link>
                </header>

                {errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                <section className="mt-8">
                    {isLoading ? (
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                            Cargando productos...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
                            <div className="mx-auto max-w-md space-y-3">
                                <h2 className="text-xl font-semibold text-slate-100">
                                    Todavía no hay productos
                                </h2>
                                <p className="text-sm leading-6 text-slate-400">
                                    Creá el primero para empezar a trabajar el catálogo y sus imágenes.
                                </p>
                                <div className="pt-2">
                                    <Link
                                        href="/admin/products/new"
                                        className="inline-flex rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                                    >
                                        Crear primer producto
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-950/70 text-left text-slate-400">
                                        <tr>
                                            <th className="px-4 py-4 font-medium">ID</th>
                                            <th className="px-4 py-4 font-medium">Producto</th>
                                            <th className="px-4 py-4 font-medium">Categoría</th>
                                            <th className="px-4 py-4 font-medium">SKU</th>
                                            <th className="px-4 py-4 font-medium">Precio</th>
                                            <th className="px-4 py-4 font-medium">Stock</th>
                                            <th className="px-4 py-4 font-medium">Estado</th>
                                            <th className="px-4 py-4 font-medium">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="border-t border-slate-800 align-top"
                                            >
                                                <td className="px-4 py-4 text-slate-300">#{product.id}</td>

                                                <td className="px-4 py-4">
                                                    <div className="flex gap-4">
                                                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                                                            {product.primaryImageUrl ? (
                                                                <img
                                                                    src={product.primaryImageUrl}
                                                                    alt={product.primaryImageAltText ?? product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                                                                    Sin imagen
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-1">
                                                            <p className="font-semibold text-slate-100">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs text-slate-400">
                                                                /{product.slug}
                                                            </p>
                                                            {product.shortDescription && (
                                                                <p className="max-w-xs text-xs text-slate-500">
                                                                    {product.shortDescription}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-slate-300">
                                                    {product.categoryName}
                                                </td>

                                                <td className="px-4 py-4 text-slate-300">{product.sku}</td>

                                                <td className="px-4 py-4 text-slate-300">
                                                    {formatMoney(product.price, product.currency)}
                                                </td>

                                                <td className="px-4 py-4 text-slate-300">{product.stock}</td>

                                                <td className="px-4 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.active
                                                                ? "bg-emerald-500/15 text-emerald-300"
                                                                : "bg-slate-700/60 text-slate-300"
                                                                }`}
                                                        >
                                                            {product.active ? "Activo" : "Inactivo"}
                                                        </span>

                                                        {product.featured && (
                                                            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                                                                Destacado
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-2 sm:flex-row">
                                                        <Link
                                                            href={`/products/${product.slug}`}
                                                            className="inline-flex rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                                                        >
                                                            Ver público
                                                        </Link>

                                                        <Link
                                                            href={`/admin/products/${product.id}/edit`}
                                                            className="inline-flex rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                                                        >
                                                            Editar
                                                        </Link>

                                                        <Link
                                                            href={`/admin/products/${product.id}/images`}
                                                            className="inline-flex rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                                                        >
                                                            Imágenes
                                                        </Link>
                                                    </div>
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

export default function ProductsAdminPage() {
    return (
        <RequireRole role="ADMIN">
            <ProductsAdminPageContent />
        </RequireRole>
    );
}