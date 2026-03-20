//frontend/src/components/admin/AdminCategorySelectField.tsx
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
    createAdminCategory,
    getAdminCategories,
    type AdminCategory,
} from "@/lib/admin-categories";
import { slugify } from "@/lib/admin-product-form";

type AdminCategorySelectFieldProps = {
    value: string;
    onChange: (value: string) => void;
    onLoadingChange?: (loading: boolean) => void;
    onAvailabilityChange?: (hasCategories: boolean) => void;
    includeInactive?: boolean;
    helperText?: string;
    modalDescription?: string;
};

export default function AdminCategorySelectField({
    value,
    onChange,
    onLoadingChange,
    onAvailabilityChange,
    includeInactive = false,
    helperText = "Si falta una categoría, podés crearla acá mismo.",
    modalDescription = "Creá una categoría sin salir de este flujo.",
}: AdminCategorySelectFieldProps) {
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryModalName, setCategoryModalName] = useState("");
    const [categoryModalSlug, setCategoryModalSlug] = useState("");
    const [categoryModalDescription, setCategoryModalDescription] = useState("");
    const [categoryModalAutoSlug, setCategoryModalAutoSlug] = useState(true);
    const [categoryModalSubmitting, setCategoryModalSubmitting] = useState(false);
    const [categoryModalError, setCategoryModalError] = useState("");

    const computedCategoryModalSlug = useMemo(
        () => slugify(categoryModalName),
        [categoryModalName]
    );

    function normalizeCategories(data: AdminCategory[]) {
        const filtered = includeInactive ? data : data.filter((category) => category.active);

        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    async function reloadCategories(options?: { selectCategoryId?: number }) {
        setCategoriesLoading(true);
        setLoadError("");
        onLoadingChange?.(true);

        try {
            const data = await getAdminCategories();
            const normalized = normalizeCategories(data);

            setCategories(normalized);
            onAvailabilityChange?.(normalized.length > 0);

            if (options?.selectCategoryId) {
                onChange(String(options.selectCategoryId));
            } else if (normalized.length > 0) {
                const stillExists = normalized.some(
                    (category) => String(category.id) === value
                );

                if (!value || !stillExists) {
                    onChange(String(normalized[0].id));
                }
            } else {
                onChange("");
            }
        } catch (error) {
            const message =
                error instanceof Error && error.message.trim()
                    ? error.message
                    : "No se pudieron cargar las categorías.";

            setLoadError(message);
            onAvailabilityChange?.(false);
        } finally {
            setCategoriesLoading(false);
            onLoadingChange?.(false);
        }
    }

    useEffect(() => {
        void reloadCategories();
    }, []);

    function resetCategoryModal() {
        setCategoryModalName("");
        setCategoryModalSlug("");
        setCategoryModalDescription("");
        setCategoryModalAutoSlug(true);
        setCategoryModalError("");
        setCategoryModalSubmitting(false);
    }

    function openCategoryModal() {
        setCategoryModalError("");
        setIsCategoryModalOpen(true);
    }

    function closeCategoryModal() {
        if (categoryModalSubmitting) {
            return;
        }

        setIsCategoryModalOpen(false);
        resetCategoryModal();
    }

    async function handleCreateCategoryFromModal(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setCategoryModalSubmitting(true);
        setCategoryModalError("");

        const finalSlug = categoryModalAutoSlug
            ? computedCategoryModalSlug
            : slugify(categoryModalSlug);

        if (!categoryModalName.trim()) {
            setCategoryModalError("El nombre de la categoría es obligatorio.");
            setCategoryModalSubmitting(false);
            return;
        }

        if (!finalSlug) {
            setCategoryModalError("El slug no puede quedar vacío.");
            setCategoryModalSubmitting(false);
            return;
        }

        try {
            const createdCategory = await createAdminCategory({
                name: categoryModalName.trim(),
                slug: finalSlug,
                description: categoryModalDescription.trim(),
            });

            await reloadCategories({ selectCategoryId: createdCategory.id });

            setIsCategoryModalOpen(false);
            resetCategoryModal();
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setCategoryModalError(error.message);
            } else {
                setCategoryModalError("No se pudo crear la categoría.");
            }
        } finally {
            setCategoryModalSubmitting(false);
        }
    }

    return (
        <>
            <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Categoría</span>

                <div className="space-y-2">
                    <select
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        className="input"
                        required
                        disabled={categoriesLoading || categories.length === 0}
                    >
                        {categories.length === 0 ? (
                            <option value="">
                                {categoriesLoading
                                    ? "Cargando categorías..."
                                    : "No hay categorías disponibles"}
                            </option>
                        ) : (
                            categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {includeInactive && !category.active
                                        ? `${category.name} (inactiva)`
                                        : category.name}
                                </option>
                            ))
                        )}
                    </select>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        <button
                            type="button"
                            onClick={openCategoryModal}
                            className="inline-flex items-center rounded-xl border border-slate-700 px-3 py-2 text-slate-300 transition hover:border-slate-500 hover:text-white"
                        >
                            Nueva categoría
                        </button>

                        <span className="text-slate-500">{helperText}</span>
                    </div>

                    {loadError ? (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {loadError}
                        </div>
                    ) : null}
                </div>
            </label>

            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
                    <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                                    Admin · Categorías
                                </p>
                                <h2 className="mt-2 text-2xl font-bold text-white">
                                    Crear categoría
                                </h2>
                                <p className="mt-2 text-sm text-slate-400">
                                    {modalDescription}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeCategoryModal}
                                className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                            >
                                Cerrar
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategoryFromModal} className="space-y-5">
                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-200">Nombre</span>
                                <input
                                    type="text"
                                    value={categoryModalName}
                                    onChange={(event) => {
                                        const nextName = event.target.value;
                                        setCategoryModalName(nextName);

                                        if (categoryModalAutoSlug) {
                                            setCategoryModalSlug(slugify(nextName));
                                        }
                                    }}
                                    className="input"
                                    placeholder="Ej: Electrónica"
                                    required
                                />
                            </label>

                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-200">Slug</span>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={
                                            categoryModalAutoSlug
                                                ? computedCategoryModalSlug
                                                : categoryModalSlug
                                        }
                                        onChange={(event) => {
                                            setCategoryModalAutoSlug(false);
                                            setCategoryModalSlug(event.target.value);
                                        }}
                                        className="input"
                                        placeholder="electronica"
                                        required
                                    />
                                    <label className="flex items-center gap-2 text-xs text-slate-400">
                                        <input
                                            type="checkbox"
                                            checked={categoryModalAutoSlug}
                                            onChange={(event) => {
                                                const checked = event.target.checked;
                                                setCategoryModalAutoSlug(checked);
                                                if (checked) {
                                                    setCategoryModalSlug(slugify(categoryModalName));
                                                }
                                            }}
                                        />
                                        Generar slug automáticamente
                                    </label>
                                </div>
                            </label>

                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-200">Descripción</span>
                                <textarea
                                    value={categoryModalDescription}
                                    onChange={(event) =>
                                        setCategoryModalDescription(event.target.value)
                                    }
                                    className="textarea"
                                    rows={4}
                                    placeholder="Descripción breve de la categoría"
                                />
                            </label>

                            {categoryModalError && (
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {categoryModalError}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={categoryModalSubmitting}
                                    className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {categoryModalSubmitting
                                        ? "Creando categoría..."
                                        : "Crear categoría"}
                                </button>

                                <button
                                    type="button"
                                    onClick={closeCategoryModal}
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}