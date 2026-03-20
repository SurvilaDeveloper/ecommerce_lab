//frontend/src/lib/products.ts
import { apiFetchJson } from "@/lib/api";

export type CreateProductRequest = {
    categoryId: number;
    name: string;
    slug: string;
    sku: string;
    shortDescription?: string | null;
    description?: string | null;
    price: number;
    compareAtPrice?: number | null;
    costPrice?: number | null;
    currency?: string;
    stock?: number;
    lowStockThreshold?: number;
    isActive?: boolean;
    isFeatured?: boolean;
};

export type UpdateProductRequest = CreateProductRequest;

export type ProductResponse = {
    id: number;
    categoryId: number;
    categoryName: string;
    name: string;
    slug: string;
    sku: string;
    shortDescription: string | null;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    costPrice: number | null;
    currency: string;
    stock: number;
    lowStockThreshold: number;
    active: boolean;
    featured: boolean;
    primaryImageUrl: string | null;
    primaryImageAltText: string | null;
    createdAt: string;
    updatedAt: string;
};

export type ProductImageResponse = {
    id: number;
    productId: number;
    imageUrl: string;
    publicId: string;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
    width: number | null;
    height: number | null;
    createdAt: string;
};

export type ProductListStatsResponse = {
    totalCount: number;
    activeCount: number;
    lowStockCount: number;
    outOfStockCount: number;
};

export type ProductPageResponse = {
    content: ProductResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    first: boolean;
    last: boolean;
    stats: ProductListStatsResponse;
};

export type ProductStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
export type ProductStockFilter = "ALL" | "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
export type ProductSortField = "NAME" | "PRICE" | "STOCK";
export type ProductSortDirection = "ASC" | "DESC";

export type GetProductsParams = {
    search?: string;
    categoryId?: number | null;
    status?: ProductStatusFilter;
    stock?: ProductStockFilter;
    featured?: boolean;
    page?: number;
    size?: number;
    sortField?: ProductSortField;
    sortDirection?: ProductSortDirection;
};

function buildProductsQuery(params: GetProductsParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.search?.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.categoryId != null) {
        searchParams.set("categoryId", String(params.categoryId));
    }

    if (params.status && params.status !== "ALL") {
        searchParams.set("status", params.status);
    }

    if (params.stock && params.stock !== "ALL") {
        searchParams.set("stock", params.stock);
    }

    if (params.featured) {
        searchParams.set("featured", "true");
    }

    searchParams.set("page", String(params.page ?? 0));
    searchParams.set("size", String(params.size ?? 10));
    searchParams.set("sortField", params.sortField ?? "NAME");
    searchParams.set("sortDirection", params.sortDirection ?? "ASC");

    const query = searchParams.toString();
    return query ? `/api/products?${query}` : "/api/products";
}

export async function createProduct(payload: CreateProductRequest) {
    return apiFetchJson<ProductResponse>("/api/products", {
        method: "POST",
        json: payload,
    });
}

export async function updateProduct(productId: number, payload: UpdateProductRequest) {
    return apiFetchJson<ProductResponse>(`/api/products/${productId}`, {
        method: "PUT",
        json: payload,
    });
}

export async function getProducts(params: GetProductsParams = {}) {
    return apiFetchJson<ProductPageResponse>(buildProductsQuery(params), {
        method: "GET",
    });
}

export async function getProductById(productId: number) {
    return apiFetchJson<ProductResponse>(`/api/products/${productId}`, {
        method: "GET",
    });
}

export async function getProductBySlug(slug: string) {
    return apiFetchJson<ProductResponse>(`/api/products/slug/${slug}`, {
        method: "GET",
    });
}

export async function getPublicProductImages(productId: number) {
    return apiFetchJson<ProductImageResponse[]>(`/api/products/${productId}/images`, {
        method: "GET",
    });
}