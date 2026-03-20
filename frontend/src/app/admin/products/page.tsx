//frontend/src/app/admin/products/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RequireRole } from "@/components/auth/RequireRole";
import { getCategories, type CategoryResponse } from "@/lib/categories";
import {
    getProducts,
    type ProductPageResponse,
    type ProductResponse,
    type ProductSortDirection,
    type ProductSortField,
    type ProductStatusFilter,
    type ProductStockFilter,
} from "@/lib/products";

type PaginationSize = 10 | 20 | 50;

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

function isLowStock(product: ProductResponse) {
    return product.stock > 0 && product.stock <= product.lowStockThreshold;
}

function getStockBadge(product: ProductResponse) {
    if (product.stock <= 0) {
        return {
            label: "Sin stock",
            className: "bg-red-500/15 text-red-300",
        };
    }

    if (isLowStock(product)) {
        return {
            label: "Stock bajo",
            className: "bg-amber-500/15 text-amber-300",
        };
    }

    return {
        label: "Con stock",
        className: "bg-emerald-500/15 text-emerald-300",
    };
}

function ProductsAdminPageContent() {
    const [pageData, setPageData] = useState<ProductPageResponse | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<number | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("ALL");
    const [stockFilter, setStockFilter] = useState<ProductStockFilter>("ALL");
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const [sortField, setSortField] = useState<ProductSortField>("NAME");
    const [sortDirection, setSortDirection] = useState<ProductSortDirection>("ASC");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState<PaginationSize>(10);

    useEffect(() => {
        void loadCategories();
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setPage(0);
            setSearch(searchInput.trim());
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        void loadProducts();
    }, [search, categoryFilter, statusFilter, stockFilter, featuredOnly, sortField, sortDirection, page, pageSize]);

    async function loadCategories() {
        setIsLoadingCategories(true);

        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudieron cargar las categorías.");
            }
        } finally {
            setIsLoadingCategories(false);
        }
    }

    async function loadProducts() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await getProducts({
                search,
                categoryId: categoryFilter === "ALL" ? null : categoryFilter,
                status: statusFilter,
                stock: stockFilter,
                featured: featuredOnly,
                page,
                size: pageSize,
                sortField,
                sortDirection,
            });

            setPageData(data);
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

    const products = pageData?.content ?? [];

    const stats = pageData?.stats ?? {
        totalCount: 0,
        activeCount: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
    };

    const availableCategories = useMemo(() => {
        return categories
            .filter((category) => category.isActive)
            .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
    }, [categories]);

    const totalProducts = pageData?.totalElements ?? 0;
    const currentPage = pageData?.page ?? 0;
    const totalPages = pageData?.totalPages ?? 0;
    const hasPrevious = pageData?.hasPrevious ?? false;
    const hasNext = pageData?.hasNext ?? false;

    const totalActiveOnPage = useMemo(() => {
        return products.filter((product) => product.active).length;
    }, [products]);

    const totalLowStockOnPage = useMemo(() => {
        return products.filter((product) => isLowStock(product)).length;
    }, [products]);

    const totalOutOfStockOnPage = useMemo(() => {
        return products.filter((product) => product.stock <= 0).length;
    }, [products]);

    const pageFrom = totalProducts === 0 ? 0 : currentPage * pageSize + 1;
    const pageTo = totalProducts === 0 ? 0 : currentPage * pageSize + products.length;

    function resetFilters() {
        setSearchInput("");
        setSearch("");
        setCategoryFilter("ALL");
        setStatusFilter("ALL");
        setStockFilter("ALL");
        setFeaturedOnly(false);
        setSortField("NAME");
        setSortDirection("ASC");
        setPage(0);
        setPageSize(10);
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
                            Desde acá podés ver el catálogo cargado, buscar productos, filtrar el
                            inventario y entrar a editar un producto o gestionar sus imágenes.
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

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Total encontrados
                        </p>
                        <p className="mt-2 text-3xl font-bold text-slate-100">{stats.totalCount}</p>
                        <p className="mt-2 text-xs text-slate-500">
                            En página: {products.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Activos totales
                        </p>
                        <p className="mt-2 text-3xl font-bold text-emerald-300">
                            {stats.activeCount}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            En página: {totalActiveOnPage}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Stock bajo total
                        </p>
                        <p className="mt-2 text-3xl font-bold text-amber-300">
                            {stats.lowStockCount}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            En página: {totalLowStockOnPage}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Sin stock total
                        </p>
                        <p className="mt-2 text-3xl font-bold text-red-300">
                            {stats.outOfStockCount}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            En página: {totalOutOfStockOnPage}
                        </p>
                    </div>
                </section>

                <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Buscar
                            </label>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Buscar por nombre, SKU, slug o categoría"
                                className="input w-full"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Categoría
                            </label>
                            <select
                                value={String(categoryFilter)}
                                onChange={(event) => {
                                    setPage(0);
                                    const value = event.target.value;
                                    setCategoryFilter(value === "ALL" ? "ALL" : Number(value));
                                }}
                                className="input w-full"
                                disabled={isLoadingCategories}
                            >
                                <option value="ALL">
                                    {isLoadingCategories ? "Cargando..." : "Todas"}
                                </option>

                                {availableCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Estado
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(event) => {
                                    setPage(0);
                                    setStatusFilter(event.target.value as ProductStatusFilter);
                                }}
                                className="input w-full"
                            >
                                <option value="ALL">Todos</option>
                                <option value="ACTIVE">Activos</option>
                                <option value="INACTIVE">Inactivos</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Stock
                            </label>
                            <select
                                value={stockFilter}
                                onChange={(event) => {
                                    setPage(0);
                                    setStockFilter(event.target.value as ProductStockFilter);
                                }}
                                className="input w-full"
                            >
                                <option value="ALL">Todos</option>
                                <option value="IN_STOCK">Con stock</option>
                                <option value="OUT_OF_STOCK">Sin stock</option>
                                <option value="LOW_STOCK">Stock bajo</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[auto_auto_auto_1fr] xl:items-end">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Ordenar por
                            </label>
                            <select
                                value={sortField}
                                onChange={(event) => {
                                    setPage(0);
                                    setSortField(event.target.value as ProductSortField);
                                }}
                                className="input w-full"
                            >
                                <option value="NAME">Nombre</option>
                                <option value="PRICE">Precio</option>
                                <option value="STOCK">Stock</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Dirección
                            </label>
                            <select
                                value={sortDirection}
                                onChange={(event) => {
                                    setPage(0);
                                    setSortDirection(event.target.value as ProductSortDirection);
                                }}
                                className="input w-full"
                            >
                                <option value="ASC">Ascendente</option>
                                <option value="DESC">Descendente</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Por página
                            </label>
                            <select
                                value={pageSize}
                                onChange={(event) => {
                                    setPage(0);
                                    setPageSize(Number(event.target.value) as PaginationSize);
                                }}
                                className="input w-full"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={featuredOnly}
                                    onChange={(event) => {
                                        setPage(0);
                                        setFeaturedOnly(event.target.checked);
                                    }}
                                />
                                Solo destacados
                            </label>

                            <p className="text-sm text-slate-400">
                                Mostrando{" "}
                                <span className="font-semibold text-slate-100">{pageFrom}</span> a{" "}
                                <span className="font-semibold text-slate-100">{pageTo}</span> de{" "}
                                <span className="font-semibold text-slate-100">
                                    {totalProducts}
                                </span>{" "}
                                productos
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    {isLoading ? (
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                            Cargando productos...
                        </div>
                    ) : totalProducts === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
                            <div className="mx-auto max-w-md space-y-3">
                                <h2 className="text-xl font-semibold text-slate-100">
                                    No hay productos para esos filtros
                                </h2>
                                <p className="text-sm leading-6 text-slate-400">
                                    Probá cambiando la búsqueda, los filtros o creá un nuevo producto.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="inline-flex rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                                    >
                                        Limpiar filtros
                                    </button>

                                    <Link
                                        href="/admin/products/new"
                                        className="inline-flex rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                                    >
                                        Nuevo producto
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                            {products.map((product) => {
                                                const stockBadge = getStockBadge(product);

                                                return (
                                                    <tr
                                                        key={product.id}
                                                        className="border-t border-slate-800 align-top"
                                                    >
                                                        <td className="px-4 py-4 text-slate-300">
                                                            #{product.id}
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <div className="flex gap-4">
                                                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                                                                    {product.primaryImageUrl ? (
                                                                        <img
                                                                            src={product.primaryImageUrl}
                                                                            alt={
                                                                                product.primaryImageAltText ??
                                                                                product.name
                                                                            }
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

                                                        <td className="px-4 py-4 text-slate-300">
                                                            {product.sku}
                                                        </td>

                                                        <td className="px-4 py-4 text-slate-300">
                                                            {formatMoney(product.price, product.currency)}
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <div className="space-y-2">
                                                                <p className="text-slate-200">
                                                                    {product.stock}
                                                                </p>
                                                                <span
                                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stockBadge.className}`}
                                                                >
                                                                    {stockBadge.label}
                                                                </span>
                                                                <p className="text-xs text-slate-500">
                                                                    Umbral: {product.lowStockThreshold}
                                                                </p>
                                                            </div>
                                                        </td>

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
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 md:flex-row md:items-center md:justify-between">
                                <p className="text-sm text-slate-400">
                                    Página{" "}
                                    <span className="font-semibold text-slate-100">
                                        {totalPages === 0 ? 0 : currentPage + 1}
                                    </span>{" "}
                                    de{" "}
                                    <span className="font-semibold text-slate-100">
                                        {totalPages}
                                    </span>
                                </p>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                        disabled={!hasPrevious}
                                        className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPage((prev) => prev + 1)}
                                        disabled={!hasNext}
                                        className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </>
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