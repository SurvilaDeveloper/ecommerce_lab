//frontend/src/lib/cart.ts
import { apiFetchJson } from "@/lib/api";

export type CartItemResponse = {
    id: number;
    productId: number;
    productName: string;
    productSlug: string;
    productSku: string;
    productPrimaryImageUrl: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    availableStock: number;
    productActive: boolean;
};

export type CartResponse = {
    cartId: number;
    userId: number;
    items: CartItemResponse[];
    totalItems: number;
    subtotal: number;
};

export async function getCart() {
    return apiFetchJson<CartResponse>("/api/cart", {
        method: "GET",
    });
}

export async function addCartItem(productId: number, quantity: number) {
    return apiFetchJson<CartResponse>("/api/cart/items", {
        method: "POST",
        json: {
            productId,
            quantity,
        },
    });
}

export async function updateCartItem(itemId: number, quantity: number) {
    return apiFetchJson<CartResponse>(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        json: {
            quantity,
        },
    });
}

export async function removeCartItem(itemId: number) {
    return apiFetchJson<CartResponse>(`/api/cart/items/${itemId}`, {
        method: "DELETE",
    });
}

export async function clearCart() {
    return apiFetchJson<CartResponse>("/api/cart/items", {
        method: "DELETE",
    });
}