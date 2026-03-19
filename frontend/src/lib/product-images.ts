//frontend/src/lib/product-images.ts
import { apiFetchJson } from "@/lib/api";

export type ProductImage = {
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

export type UpdateProductImageRequest = {
    altText?: string | null;
    sortOrder?: number;
    isPrimary?: boolean;
};

export async function getProductImages(productId: number) {
    return apiFetchJson<ProductImage[]>(
        `/api/admin/products/${productId}/images`,
        {
            method: "GET",
        }
    );
}

export async function uploadProductImage(
    productId: number,
    file: File,
    options?: {
        altText?: string;
        isPrimary?: boolean;
    }
) {
    const formData = new FormData();
    formData.append("file", file);

    if (options?.altText) {
        formData.append("altText", options.altText);
    }

    if (typeof options?.isPrimary === "boolean") {
        formData.append("isPrimary", String(options.isPrimary));
    }

    return apiFetchJson<ProductImage>(
        `/api/admin/products/${productId}/images`,
        {
            method: "POST",
            body: formData,
        }
    );
}

export async function updateProductImage(
    productId: number,
    imageId: number,
    payload: UpdateProductImageRequest
) {
    return apiFetchJson<ProductImage>(
        `/api/admin/products/${productId}/images/${imageId}`,
        {
            method: "PATCH",
            json: payload,
        }
    );
}

export async function deleteProductImage(productId: number, imageId: number) {
    return apiFetchJson<null>(
        `/api/admin/products/${productId}/images/${imageId}`,
        {
            method: "DELETE",
        }
    );
}