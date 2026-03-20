//frontend/src/app/admin/products/[productId]/edit/page.tsx
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RequireRole } from "@/components/auth/RequireRole";
import {
    getProductById,
    updateProduct,
    type ProductResponse,
} from "@/lib/products";
import { parseOptionalNumber, slugify } from "@/lib/admin-product-form";
import AdminCategorySelectField from "@/components/admin/AdminCategorySelectField";

function EditProductPageContent() {
    const params = useParams();
    const router = useRouter();
    const productId = Number(params.productId);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [message, setMessage] = useState("");

    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [hasCategories, setHasCategories] = useState(false);

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

    const [autoSlug, setAutoSlug] = useState(false);

    const computedSlug = useMemo(() => slugify(name), [name]);

    useEffect(() => {
        if (!Number.isInteger(productId) || productId <= 0) {
            setIsLoading(false);
            setErrorMessage("El productId de la URL no es válido.");
            return;
        }

        void loadProduct();
    }, [productId]);

    async function loadProduct() {
        setIsLoading(true);
        setErrorMessage("");
        setMessage("");

        try {
            const product = await getProductById(productId);
            hydrateForm(product);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo cargar el producto.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    function hydrateForm(product: ProductResponse) {
        setCategoryId(String(product.categoryId));
        setName(product.name);
        setSlug(product.slug);
        setSku(product.sku);
        setShortDescription(product.shortDescription ?? "");
        setDescription(product.description ?? "");
        setPrice(String(product.price));
        setCompareAtPrice(product.compareAtPrice != null ? String(product.compareAtPrice) : "");
        setCostPrice(product.costPrice != null ? String(product.costPrice) : "");
        setCurrency(product.currency);
        setStock(String(product.stock));
        setLowStockThreshold(String(product.lowStockThreshold));
        setIsActive(!!product.active);
        setIsFeatured(!!product.featured);
        setAutoSlug(false);
    }

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
            setErrorMessage("Tenés que seleccionar una categoría válida.");
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
            await updateProduct(productId, {
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

            setMessage("Producto actualizado correctamente.");
            router.refresh();
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo actualizar el producto.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
                <div className="mx-auto w-full max-w-5xl px-6 py-10">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                        Cargando producto...
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-5xl px-6 py-10">
                <header className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                        Admin · Productos · Edición
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Editar producto #{productId}
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-slate-400">
                        Modificá la información principal del producto y guardá los cambios.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20"
                >
                    <section className="grid gap-5 md:grid-cols-2">
                        <AdminCategorySelectField
                            value={categoryId}
                            onChange={setCategoryId}
                            onLoadingChange={setCategoriesLoading}
                            onAvailabilityChange={setHasCategories}
                            includeInactive
                            helperText="Si falta una categoría, podés crearla acá mismo."
                            modalDescription="Creá una categoría sin salir del flujo de edición del producto."
                        />

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
                                required
                            />
                        </Field>

                        <Field label="Moneda">
                            <input
                                type="text"
                                value={currency}
                                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                                className="input"
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
                            />
                        </Field>

                        <Field label="Descripción completa">
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                className="textarea"
                                rows={6}
                            />
                        </Field>
                    </section>

                    <section className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                checked={!!isActive}
                                onChange={(event) => setIsActive(event.target.checked)}
                            />
                            Producto activo
                        </label>

                        <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                checked={!!isFeatured}
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
                            disabled={isSubmitting || categoriesLoading || !hasCategories}
                            className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Guardando cambios..." : "Guardar cambios"}
                        </button>

                        <Link
                            href={`/admin/products/${productId}/images`}
                            className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                        >
                            Gestionar imágenes
                        </Link>

                        <Link
                            href="/admin/products"
                            className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                        >
                            Volver al listado
                        </Link>
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

export default function EditProductPage() {
    return (
        <RequireRole role="ADMIN">
            <EditProductPageContent />
        </RequireRole>
    );
}