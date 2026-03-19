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

export async function getProducts() {
    return apiFetchJson<ProductResponse[]>("/api/products", {
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