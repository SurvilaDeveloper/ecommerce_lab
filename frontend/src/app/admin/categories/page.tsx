//frontend/src/app/admin/categories/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    createAdminCategory,
    deleteAdminCategory,
    getAdminCategories,
    updateAdminCategory,
} from '@/lib/admin-categories'
import type {
    AdminCategory,
    AdminCreateCategoryRequest,
    AdminUpdateCategoryRequest,
} from '@/lib/admin-categories'

type FormMode = 'create' | 'edit'

type CategoryFormState = {
    name: string
    slug: string
    description: string
    isActive: boolean
}

const initialFormState: CategoryFormState = {
    name: '',
    slug: '',
    description: '',
    isActive: true,
}

function slugify(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<AdminCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [formMode, setFormMode] = useState<FormMode>('create')
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
    const [form, setForm] = useState<CategoryFormState>(initialFormState)
    const [slugTouched, setSlugTouched] = useState(false)

    async function loadCategories() {
        setLoading(true)
        setError(null)

        try {
            const data = await getAdminCategories()
            setCategories(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error al cargar')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => a.name.localeCompare(b.name))
    }, [categories])

    function resetForm() {
        setForm(initialFormState)
        setFormMode('create')
        setEditingCategoryId(null)
        setSlugTouched(false)
    }

    function startCreate() {
        resetForm()
        setMessage(null)
        setError(null)
    }

    function startEdit(category: AdminCategory) {
        setFormMode('edit')
        setEditingCategoryId(category.id)
        setForm({
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
            isActive: category.active,
        })
        setSlugTouched(true)
        setMessage(null)
        setError(null)
    }

    function onNameChange(value: string) {
        setForm((prev) => {
            const next = { ...prev, name: value }

            if (!slugTouched) {
                next.slug = slugify(value)
            }

            return next
        })
    }

    function onSlugChange(value: string) {
        setSlugTouched(true)
        setForm((prev) => ({
            ...prev,
            slug: slugify(value),
        }))
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitting(true)
        setMessage(null)
        setError(null)

        try {
            if (formMode === 'create') {
                const payload: AdminCreateCategoryRequest = {
                    name: form.name,
                    slug: form.slug,
                    description: form.description,
                }

                await createAdminCategory(payload)
                setMessage('Categoría creada correctamente')
            } else {
                if (!editingCategoryId) {
                    throw new Error('No se encontró la categoría a editar')
                }

                const payload: AdminUpdateCategoryRequest = {
                    name: form.name,
                    slug: form.slug,
                    description: form.description,
                    isActive: form.isActive,
                }

                await updateAdminCategory(editingCategoryId, payload)
                setMessage('Categoría actualizada correctamente')
            }

            resetForm()
            await loadCategories()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(category: AdminCategory) {
        const confirmed = window.confirm(
            `¿Querés eliminar la categoría "${category.name}"?`
        )

        if (!confirmed) {
            return
        }

        setMessage(null)
        setError(null)

        try {
            await deleteAdminCategory(category.id)
            setMessage('Categoría eliminada correctamente')
            await loadCategories()

            if (editingCategoryId === category.id) {
                resetForm()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo eliminar')
        }
    }

    return (
        <main className="flex flex-col items-center min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="space-y-8 x-full max-w-7xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Categorías</h1>
                        <p className="text-sm text-slate-400">
                            Administrá las categorías del catálogo.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={startCreate}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90"
                    >
                        Nueva categoría
                    </button>
                </div>

                {message ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        {message}
                    </div>
                ) : null}

                {error ? (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                ) : null}

                <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
                    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-white">
                                {formMode === 'create' ? 'Crear categoría' : 'Editar categoría'}
                            </h2>

                            {formMode === 'edit' ? (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="text-sm text-slate-400 transition hover:text-white"
                                >
                                    Cancelar edición
                                </button>
                            ) : null}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="category-name"
                                    className="mb-1 block text-sm font-medium text-slate-200"
                                >
                                    Nombre
                                </label>
                                <input
                                    id="category-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => onNameChange(e.target.value)}
                                    placeholder="Ej: Electrónica"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-slate-500"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="category-slug"
                                    className="mb-1 block text-sm font-medium text-slate-200"
                                >
                                    Slug
                                </label>
                                <input
                                    id="category-slug"
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => onSlugChange(e.target.value)}
                                    placeholder="Ej: electronica"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-slate-500"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="category-description"
                                    className="mb-1 block text-sm font-medium text-slate-200"
                                >
                                    Descripción
                                </label>
                                <textarea
                                    id="category-description"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                    placeholder="Descripción breve de la categoría"
                                    rows={4}
                                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-slate-500"
                                />
                            </div>

                            {formMode === 'edit' ? (
                                <label className="flex items-center gap-2 text-sm text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                                        }
                                    />
                                    Categoría activa
                                </label>
                            ) : null}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting
                                    ? 'Guardando...'
                                    : formMode === 'create'
                                        ? 'Crear categoría'
                                        : 'Guardar cambios'}
                            </button>
                        </form>
                    </section>

                    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-white">
                                Listado de categorías
                            </h2>
                        </div>

                        {loading ? (
                            <div className="text-sm text-slate-400">Cargando categorías...</div>
                        ) : sortedCategories.length === 0 ? (
                            <div className="text-sm text-slate-400">
                                No hay categorías cargadas todavía.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-left text-slate-400">
                                            <th className="px-3 py-3 font-medium">Nombre</th>
                                            <th className="px-3 py-3 font-medium">Slug</th>
                                            <th className="px-3 py-3 font-medium">Productos</th>
                                            <th className="px-3 py-3 font-medium">Estado</th>
                                            <th className="px-3 py-3 font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedCategories.map((category) => (
                                            <tr
                                                key={category.id}
                                                className="border-b border-slate-800/80 text-slate-200"
                                            >
                                                <td className="px-3 py-3">
                                                    <div className="font-medium text-white">{category.name}</div>
                                                    {category.description ? (
                                                        <div className="mt-1 max-w-[320px] text-xs text-slate-400">
                                                            {category.description}
                                                        </div>
                                                    ) : null}
                                                </td>

                                                <td className="px-3 py-3 text-slate-300">{category.slug}</td>

                                                <td className="px-3 py-3 text-slate-300">
                                                    {category.productCount}
                                                </td>

                                                <td className="px-3 py-3">
                                                    <span
                                                        className={
                                                            category.active
                                                                ? 'rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300'
                                                                : 'rounded-full border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-300'
                                                        }
                                                    >
                                                        {category.active ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </td>

                                                <td className="px-3 py-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(category)}
                                                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500 hover:text-white"
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(category)}
                                                            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    )
}