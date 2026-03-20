//frontend/src/lib/admin-categories.ts

export type AdminCategory = {
    id: number
    name: string
    slug: string
    description: string | null
    active: boolean
    productCount: number
    createdAt: string
    updatedAt: string
}

export type AdminCreateCategoryRequest = {
    name: string
    slug: string
    description: string
}

export type AdminUpdateCategoryRequest = {
    name: string
    slug: string
    description: string
    isActive: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

async function parseJsonSafely(response: Response) {
    const text = await response.text()

    if (!text) {
        return null
    }

    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

function extractErrorMessage(payload: unknown, fallback: string) {
    if (typeof payload === 'string' && payload.trim()) {
        return payload
    }

    if (
        payload &&
        typeof payload === 'object' &&
        'message' in payload &&
        typeof (payload as { message?: unknown }).message === 'string'
    ) {
        return (payload as { message: string }).message
    }

    return fallback
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
    })

    const payload = await parseJsonSafely(response)

    if (!response.ok) {
        throw new Error(
            extractErrorMessage(payload, 'No se pudieron cargar las categorías')
        )
    }

    return (payload as AdminCategory[]).map((category) => ({
        ...category,
        active:
            typeof (category as { active?: boolean }).active === 'boolean'
                ? category.active
                : (category as { isActive?: boolean }).isActive ?? false,
    }))
}

export async function createAdminCategory(
    input: AdminCreateCategoryRequest
): Promise<AdminCategory> {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    })

    const payload = await parseJsonSafely(response)

    if (!response.ok) {
        throw new Error(
            extractErrorMessage(payload, 'No se pudo crear la categoría')
        )
    }

    const category = payload as AdminCategory

    return {
        ...category,
        active:
            typeof (category as { active?: boolean }).active === 'boolean'
                ? category.active
                : (category as { isActive?: boolean }).isActive ?? false,
    }
}

export async function updateAdminCategory(
    id: number,
    input: AdminUpdateCategoryRequest
): Promise<AdminCategory> {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    })

    const payload = await parseJsonSafely(response)

    if (!response.ok) {
        throw new Error(
            extractErrorMessage(payload, 'No se pudo actualizar la categoría')
        )
    }

    const category = payload as AdminCategory

    return {
        ...category,
        active:
            typeof (category as { active?: boolean }).active === 'boolean'
                ? category.active
                : (category as { isActive?: boolean }).isActive ?? false,
    }
}

export async function deleteAdminCategory(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    })

    const payload = await parseJsonSafely(response)

    if (!response.ok) {
        throw new Error(
            extractErrorMessage(payload, 'No se pudo eliminar la categoría')
        )
    }
}