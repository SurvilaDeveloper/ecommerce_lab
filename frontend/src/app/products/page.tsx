//frontend/src/app/products/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCategories, type CategoryResponse } from "@/lib/categories";
import {
    getProducts,
    type ProductPageResponse,
    type ProductResponse,
} from "@/lib/products";
import { formatMoney } from "@/lib/format";

export default function ProductsCatalogPage() {
    const [pageData, setPageData] = useState<ProductPageResponse | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const [inStockOnly, setInStockOnly] = useState(false);

    useEffect(() => {
        void loadCategories();
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearch(searchInput.trim());
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        void loadCatalog();
    }, [search, selectedCategoryId, featuredOnly, inStockOnly]);

    async function loadCategories() {
        try {
            const categoriesData = await getCategories();
            setCategories(categoriesData.filter((category) => category.isActive));
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudieron cargar las categorías.");
            }
        }
    }

    async function loadCatalog() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const productsData = await getProducts({
                search,
                categoryId:
                    selectedCategoryId === "all" ? null : Number(selectedCategoryId),
                featured: featuredOnly,
                status: "ACTIVE",
                stock: inStockOnly ? "IN_STOCK" : "ALL",
                sortField: "NAME",
                sortDirection: "ASC",
                page: 0,
                size: 100,
            });

            setPageData(productsData);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo cargar el catálogo.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const products = pageData?.content ?? [];

    const resultLabel = useMemo(() => {
        const count = pageData?.totalElements ?? 0;
        return `${count} producto${count === 1 ? "" : "s"} encontrado${count === 1 ? "" : "s"
            }`;
    }, [pageData]);

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-7xl px-6 py-12">
                <header className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                        Catálogo
                    </p>

                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                            Explorá nuestros productos
                        </h1>
                        <p className="max-w-3xl text-base leading-7 text-slate-300">
                            Esta es la primera versión pública del catálogo. Ya podés navegar,
                            filtrar y entrar al detalle real de cada producto.
                        </p>
                    </div>
                </header>

                <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-200">Buscar</span>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Nombre, slug o SKU"
                                className="input"
                            />
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-200">Categoría</span>
                            <select
                                value={selectedCategoryId}
                                onChange={(event) => setSelectedCategoryId(event.target.value)}
                                className="input"
                            >
                                <option value="all">Todas</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex items-end gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                checked={featuredOnly}
                                onChange={(event) => setFeaturedOnly(event.target.checked)}
                            />
                            Solo destacados
                        </label>

                        <label className="flex items-end gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                checked={inStockOnly}
                                onChange={(event) => setInStockOnly(event.target.checked)}
                            />
                            Solo con stock
                        </label>
                    </div>
                </section>

                {errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                <section className="mt-8">
                    {isLoading ? (
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                            Cargando catálogo...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
                            <div className="mx-auto max-w-md space-y-3">
                                <h2 className="text-xl font-semibold text-slate-100">
                                    No encontramos productos
                                </h2>
                                <p className="text-sm leading-6 text-slate-400">
                                    Probá ajustando los filtros o volvé a una búsqueda más amplia.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-slate-400">{resultLabel}</div>

                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {products.map((product: ProductResponse) => (
                                    <article
                                        key={product.id}
                                        className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-slate-700"
                                    >
                                        <div className="aspect-[4/3] bg-slate-950">
                                            {product.primaryImageUrl ? (
                                                <img
                                                    src={product.primaryImageUrl}
                                                    alt={product.primaryImageAltText ?? product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                                    Sin imagen
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 p-5">
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
                                                    {product.categoryName}
                                                </p>

                                                <h2 className="text-xl font-semibold text-white">
                                                    {product.name}
                                                </h2>

                                                {product.shortDescription ? (
                                                    <p className="text-sm leading-6 text-slate-400">
                                                        {product.shortDescription}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm leading-6 text-slate-500">
                                                        Sin descripción corta.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs">
                                                <span className="rounded-full bg-slate-950 px-3 py-1 text-slate-300">
                                                    SKU: {product.sku}
                                                </span>

                                                {product.featured && (
                                                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-300">
                                                        Destacado
                                                    </span>
                                                )}

                                                <span
                                                    className={`rounded-full px-3 py-1 ${product.stock > 0
                                                            ? "bg-emerald-500/15 text-emerald-300"
                                                            : "bg-red-500/15 text-red-300"
                                                        }`}
                                                >
                                                    {product.stock > 0
                                                        ? `Stock: ${product.stock}`
                                                        : "Sin stock"}
                                                </span>
                                            </div>

                                            <div className="flex items-end justify-between gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-2xl font-bold text-white">
                                                        {formatMoney(product.price, product.currency)}
                                                    </p>

                                                    {product.compareAtPrice != null &&
                                                        product.compareAtPrice > product.price && (
                                                            <p className="text-sm text-slate-500 line-through">
                                                                {formatMoney(
                                                                    product.compareAtPrice,
                                                                    product.currency
                                                                )}
                                                            </p>
                                                        )}
                                                </div>

                                                <Link
                                                    href={`/products/${product.slug}`}
                                                    className="rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                                                >
                                                    Ver detalle
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}