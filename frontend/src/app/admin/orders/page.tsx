//frontend/src/app/admin/orders/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RequireRole } from "@/components/auth/RequireRole";
import {
    getAdminOrders,
    type AdminOrderResponse,
    type AdminOrdersPageResponse,
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

function formatDeliveryMethod(value: string) {
    return value === "DELIVERY" ? "Envío" : "Retiro";
}

function formatSource(value: string | null | undefined) {
    return value === "GUEST" ? "Invitado" : "Registrado";
}

function AdminOrdersPageContent() {
    const [pageData, setPageData] = useState<AdminOrdersPageResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [deliveryMethodFilter, setDeliveryMethodFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
    const [fulfillmentStatusFilter, setFulfillmentStatusFilter] = useState("");

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setCurrentPage(0);
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        setCurrentPage(0);
    }, [
        deliveryMethodFilter,
        statusFilter,
        paymentStatusFilter,
        fulfillmentStatusFilter,
        pageSize,
    ]);

    useEffect(() => {
        loadOrders();
    }, [
        currentPage,
        pageSize,
        debouncedSearch,
        deliveryMethodFilter,
        statusFilter,
        paymentStatusFilter,
        fulfillmentStatusFilter,
    ]);

    async function loadOrders() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await getAdminOrders({
                search: debouncedSearch || undefined,
                deliveryMethod: deliveryMethodFilter || undefined,
                status: statusFilter || undefined,
                paymentStatus: paymentStatusFilter || undefined,
                fulfillmentStatus: fulfillmentStatusFilter || undefined,
                page: currentPage,
                size: pageSize,
            });

            setPageData(data);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudieron cargar las órdenes.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    function resetFilters() {
        setSearchInput("");
        setDebouncedSearch("");
        setDeliveryMethodFilter("");
        setStatusFilter("");
        setPaymentStatusFilter("");
        setFulfillmentStatusFilter("");
        setPageSize(10);
        setCurrentPage(0);
    }

    const orders = pageData?.content ?? [];
    const totalElements = pageData?.totalElements ?? 0;
    const totalPages = Math.max(pageData?.totalPages ?? 0, 1);
    const page = pageData?.page ?? 0;

    const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
    const endItem = totalElements === 0 ? 0 : startItem + orders.length - 1;

    const hasActiveFilters = useMemo(() => {
        return Boolean(
            searchInput.trim() ||
            deliveryMethodFilter ||
            statusFilter ||
            paymentStatusFilter ||
            fulfillmentStatusFilter ||
            pageSize !== 10
        );
    }, [
        searchInput,
        deliveryMethodFilter,
        statusFilter,
        paymentStatusFilter,
        fulfillmentStatusFilter,
        pageSize,
    ]);

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-7xl px-6 py-10">
                <header className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                        Admin · Órdenes
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Panel de órdenes
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-slate-400">
                        Acá podés ver órdenes de compradores registrados e invitados, con búsqueda,
                        filtros y paginación del lado del backend.
                    </p>
                </header>

                {errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                <section className="mt-8 space-y-6">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
                                        Búsqueda, filtros y paginación
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Buscar por número de orden, nombre o email. Los resultados se
                                        cargan paginados desde el backend.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <label className="space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            Órdenes por página
                                        </span>
                                        <select
                                            value={pageSize}
                                            onChange={(event) => setPageSize(Number(event.target.value))}
                                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        disabled={!hasActiveFilters}
                                        className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 xl:grid-cols-5">
                                <label className="space-y-2 xl:col-span-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        Buscar
                                    </span>
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                        placeholder="Número de orden, nombre o email"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-500"
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        Método
                                    </span>
                                    <select
                                        value={deliveryMethodFilter}
                                        onChange={(event) => setDeliveryMethodFilter(event.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                    >
                                        <option value="">Todos</option>
                                        <option value="PICKUP">Retiro</option>
                                        <option value="DELIVERY">Envío</option>
                                    </select>
                                </label>

                                <label className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        Estado
                                    </span>
                                    <select
                                        value={statusFilter}
                                        onChange={(event) => setStatusFilter(event.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                    >
                                        <option value="">Todos</option>
                                        {ORDER_STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        Pago
                                    </span>
                                    <select
                                        value={paymentStatusFilter}
                                        onChange={(event) => setPaymentStatusFilter(event.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                    >
                                        <option value="">Todos</option>
                                        {PAYMENT_STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        Entrega
                                    </span>
                                    <select
                                        value={fulfillmentStatusFilter}
                                        onChange={(event) => setFulfillmentStatusFilter(event.target.value)}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                    >
                                        <option value="">Todos</option>
                                        {FULFILLMENT_STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="flex items-end">
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-400">
                                        Mostrando {startItem}-{endItem} de {totalElements} órdenes
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                            Cargando órdenes...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-slate-400">
                            No hay órdenes para los filtros seleccionados.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-slate-950/70 text-left text-slate-400">
                                            <tr>
                                                <th className="px-4 py-4 font-medium">Orden</th>
                                                <th className="px-4 py-4 font-medium">Cliente</th>
                                                <th className="px-4 py-4 font-medium">Contacto</th>
                                                <th className="px-4 py-4 font-medium">Fecha</th>
                                                <th className="px-4 py-4 font-medium">Método</th>
                                                <th className="px-4 py-4 font-medium">Estado</th>
                                                <th className="px-4 py-4 font-medium">Pago</th>
                                                <th className="px-4 py-4 font-medium">Entrega</th>
                                                <th className="px-4 py-4 font-medium">Total</th>
                                                <th className="px-4 py-4 font-medium">Acciones</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {orders.map((order: AdminOrderResponse) => (
                                                <tr key={order.id} className="border-t border-slate-800 align-top">
                                                    <td className="px-4 py-4">
                                                        <div className="space-y-1">
                                                            <p className="font-semibold text-slate-100">
                                                                {order.orderNumber}
                                                            </p>
                                                            <p className="text-xs text-slate-400">#{order.id}</p>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="space-y-2">
                                                            <div className="space-y-1">
                                                                <p className="font-medium text-slate-200">
                                                                    {order.customerName}
                                                                </p>
                                                                <p className="text-xs text-slate-400">
                                                                    {order.customerEmail}
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${order.orderSource === "GUEST"
                                                                        ? "bg-amber-500/15 text-amber-300"
                                                                        : "bg-emerald-500/15 text-emerald-300"
                                                                    }`}
                                                            >
                                                                {formatSource(order.orderSource)}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="space-y-1">
                                                            <p className="text-slate-300">{order.recipientName}</p>
                                                            <p className="text-xs text-slate-400">{order.phone}</p>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 text-slate-300">
                                                        {formatDate(order.placedAt)}
                                                    </td>

                                                    <td className="px-4 py-4 text-slate-300">
                                                        {formatDeliveryMethod(order.deliveryMethod)}
                                                    </td>

                                                    <td className="px-4 py-4 text-slate-300">{order.status}</td>

                                                    <td className="px-4 py-4 text-slate-300">
                                                        {order.paymentStatus}
                                                    </td>

                                                    <td className="px-4 py-4 text-slate-300">
                                                        {order.fulfillmentStatus}
                                                    </td>

                                                    <td className="px-4 py-4 font-semibold text-white">
                                                        {formatMoney(order.grandTotal, order.currency)}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            className="inline-flex rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                                                        >
                                                            Ver detalle
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-400">
                                    Página {page + 1} de {totalPages}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(0)}
                                        disabled={page <= 0}
                                        className="inline-flex rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Primera
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                                        disabled={page <= 0}
                                        className="inline-flex rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                                        }
                                        disabled={!pageData?.hasNext}
                                        className="inline-flex rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Siguiente
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(Math.max(0, totalPages - 1))}
                                        disabled={!pageData?.hasNext}
                                        className="inline-flex rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Última
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

export default function AdminOrdersPage() {
    return (
        <RequireRole role="ADMIN">
            <AdminOrdersPageContent />
        </RequireRole>
    );
}