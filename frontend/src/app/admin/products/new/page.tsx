//frontend/src/app/admin/products/new/page.tsx
"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { RequireRole } from "@/components/auth/RequireRole";
import { createProduct } from "@/lib/products";

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function parseOptionalNumber(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : NaN;
}

function CreateProductPageContent() {
    const router = useRouter();

    const [categoryId, setCategoryId] = useState("1");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [sku, setSku] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [compareAtPrice, setCompareAtPrice] = useState("");
    const [costPrice, setCostPrice] = useState("");
    const [currency, setCurrency] = useState("ARS");
    const [stock, setStock] = useState("0");
    const [lowStockThreshold, setLowStockThreshold] = useState("0");
    const [isActive, setIsActive] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);

    const [autoSlug, setAutoSlug] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [message, setMessage] = useState("");

    const computedSlug = useMemo(() => slugify(name), [name]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSubmitting(true);
        setErrorMessage("");
        setMessage("");

        const parsedCategoryId = Number(categoryId);
        const parsedPrice = Number(price);
        const parsedCompareAtPrice = parseOptionalNumber(compareAtPrice);
        const parsedCostPrice = parseOptionalNumber(costPrice);
        const parsedStock = Number(stock);
        const parsedLowStockThreshold = Number(lowStockThreshold);

        if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
            setErrorMessage("Category ID debe ser mayor que cero.");
            setIsSubmitting(false);
            return;
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            setErrorMessage("El precio debe ser un número válido.");
            setIsSubmitting(false);
            return;
        }

        if (Number.isNaN(parsedCompareAtPrice)) {
            setErrorMessage("Compare at price no es válido.");
            setIsSubmitting(false);
            return;
        }

        if (Number.isNaN(parsedCostPrice)) {
            setErrorMessage("Cost price no es válido.");
            setIsSubmitting(false);
            return;
        }

        if (!Number.isInteger(parsedStock) || parsedStock < 0) {
            setErrorMessage("Stock debe ser un entero mayor o igual a cero.");
            setIsSubmitting(false);
            return;
        }

        if (!Number.isInteger(parsedLowStockThreshold) || parsedLowStockThreshold < 0) {
            setErrorMessage("Low stock threshold debe ser un entero mayor o igual a cero.");
            setIsSubmitting(false);
            return;
        }

        const finalSlug = autoSlug ? computedSlug : slugify(slug);

        if (!finalSlug) {
            setErrorMessage("El slug no puede quedar vacío.");
            setIsSubmitting(false);
            return;
        }

        try {
            const product = await createProduct({
                categoryId: parsedCategoryId,
                name: name.trim(),
                slug: finalSlug,
                sku: sku.trim(),
                shortDescription: shortDescription.trim() || null,
                description: description.trim() || null,
                price: parsedPrice,
                compareAtPrice: parsedCompareAtPrice,
                costPrice: parsedCostPrice,
                currency: currency.trim() || "ARS",
                stock: parsedStock,
                lowStockThreshold: parsedLowStockThreshold,
                isActive,
                isFeatured,
            });

            setMessage("Producto creado correctamente.");
            router.push(`/admin/products/${product.id}/images`);
            router.refresh();
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo crear el producto.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-5xl px-6 py-10">
                <header className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                        Admin · Productos
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Crear producto
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-slate-400">
                        En esta etapa vamos a crear el producto y enseguida te redirigimos a
                        la gestión de imágenes de ese producto.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20"
                >
                    <section className="grid gap-5 md:grid-cols-2">
                        <Field label="Category ID">
                            <input
                                type="number"
                                min="1"
                                value={categoryId}
                                onChange={(event) => setCategoryId(event.target.value)}
                                className="input"
                                required
                            />
                        </Field>

                        <Field label="SKU">
                            <input
                                type="text"
                                value={sku}
                                onChange={(event) => setSku(event.target.value)}
                                className="input"
                                placeholder="SKU-001"
                                required
                            />
                        </Field>

                        <Field label="Nombre">
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => {
                                    const nextName = event.target.value;
                                    setName(nextName);
                                    if (autoSlug) {
                                        setSlug(slugify(nextName));
                                    }
                                }}
                                className="input"
                                placeholder="Auriculares inalámbricos"
                                required
                            />
                        </Field>

                        <Field label="Slug">
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={autoSlug ? computedSlug : slug}
                                    onChange={(event) => {
                                        setAutoSlug(false);
                                        setSlug(event.target.value);
                                    }}
                                    className="input"
                                    placeholder="auriculares-inalambricos"
                                    required
                                />
                                <label className="flex items-center gap-2 text-xs text-slate-400">
                                    <input
                                        type="checkbox"
                                        checked={autoSlug}
                                        onChange={(event) => {
                                            const checked = event.target.checked;
                                            setAutoSlug(checked);
                                            if (checked) {
                                                setSlug(slugify(name));
                                            }
                                        }}
                                    />
                                    Generar slug automáticamente
                                </label>
                            </div>
                        </Field>

                        <Field label="Precio">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                className="input"
                                placeholder="15000"
                                required
                            />
                        </Field>

                        <Field label="Moneda">
                            <input
                                type="text"
                                value={currency}
                                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                                className="input"
                                placeholder="ARS"
                                required
                            />
                        </Field>

                        <Field label="Compare at price">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={compareAtPrice}
                                onChange={(event) => setCompareAtPrice(event.target.value)}
                                className="input"
                                placeholder="18000"
                            />
                        </Field>

                        <Field label="Cost price">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={costPrice}
                                onChange={(event) => setCostPrice(event.target.value)}
                                className="input"
                                placeholder="9000"
                            />
                        </Field>

                        <Field label="Stock">
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={stock}
                                onChange={(event) => setStock(event.target.value)}
                                className="input"
                                required
                            />
                        </Field>

                        <Field label="Low stock threshold">
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={lowStockThreshold}
                                onChange={(event) => setLowStockThreshold(event.target.value)}
                                className="input"
                                required
                            />
                        </Field>
                    </section>

                    <section className="grid gap-5">
                        <Field label="Descripción corta">
                            <textarea
                                value={shortDescription}
                                onChange={(event) => setShortDescription(event.target.value)}
                                className="textarea"
                                rows={3}
                                placeholder="Resumen corto del producto"
                            />
                        </Field>

                        <Field label="Descripción completa">
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                className="textarea"
                                rows={6}
                                placeholder="Descripción detallada"
                            />
                        </Field>
                    </section>

                    <section className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(event) => setIsActive(event.target.checked)}
                            />
                            Producto activo
                        </label>

                        <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(event) => setIsFeatured(event.target.checked)}
                            />
                            Producto destacado
                        </label>
                    </section>

                    {errorMessage && (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {errorMessage}
                        </div>
                    )}

                    {message && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                            {message}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Creando producto..." : "Crear producto"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">{label}</span>
            {children}
        </label>
    );
}

export default function CreateProductPage() {
    return (
        <RequireRole role="ADMIN">
            <CreateProductPageContent />
        </RequireRole>
    );
}