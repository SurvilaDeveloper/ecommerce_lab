//frontend/src/lib/guest-cart.ts
import type { CartItemResponse, CartResponse } from "@/lib/cart";

const STORAGE_KEY = "guest-cart";

export type GuestCartItem = {
    productId: number;
    productName: string;
    productSlug: string;
    productSku: string;
    productPrimaryImageUrl: string | null;
    quantity: number;
    unitPrice: number;
    availableStock: number;
    productActive: boolean;
};

type GuestCartStorage = {
    items: GuestCartItem[];
};

function isBrowser() {
    return typeof window !== "undefined";
}

function readStorage(): GuestCartStorage {
    if (!isBrowser()) {
        return { items: [] };
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return { items: [] };

        const parsed = JSON.parse(raw) as GuestCartStorage | null;
        if (!parsed || !Array.isArray(parsed.items)) {
            return { items: [] };
        }

        return {
            items: parsed.items.filter((item) => {
                return (
                    typeof item?.productId === "number" &&
                    typeof item?.productName === "string" &&
                    typeof item?.productSlug === "string" &&
                    typeof item?.productSku === "string" &&
                    typeof item?.quantity === "number" &&
                    typeof item?.unitPrice === "number" &&
                    typeof item?.availableStock === "number" &&
                    typeof item?.productActive === "boolean"
                );
            }),
        };
    } catch {
        return { items: [] };
    }
}

function writeStorage(data: GuestCartStorage) {
    if (!isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function toCartResponse(items: GuestCartItem[]): CartResponse {
    const mappedItems: CartItemResponse[] = items.map((item) => ({
        id: item.productId,
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        productSku: item.productSku,
        productPrimaryImageUrl: item.productPrimaryImageUrl,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.unitPrice * item.quantity,
        availableStock: item.availableStock,
        productActive: item.productActive,
    }));

    const totalItems = mappedItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = mappedItems.reduce((acc, item) => acc + item.lineTotal, 0);

    return {
        cartId: 0,
        userId: null,
        items: mappedItems,
        totalItems,
        subtotal,
    };
}

export function getGuestCart(): CartResponse {
    const storage = readStorage();
    return toCartResponse(storage.items);
}

export function addGuestCartItem(input: GuestCartItem): CartResponse {
    const storage = readStorage();
    const existing = storage.items.find((item) => item.productId === input.productId);

    if (existing) {
        existing.quantity = Math.min(
            existing.quantity + input.quantity,
            Math.max(input.availableStock, 1)
        );
        existing.unitPrice = input.unitPrice;
        existing.availableStock = input.availableStock;
        existing.productActive = input.productActive;
        existing.productName = input.productName;
        existing.productSlug = input.productSlug;
        existing.productSku = input.productSku;
        existing.productPrimaryImageUrl = input.productPrimaryImageUrl;
    } else {
        storage.items.push({
            ...input,
            quantity: Math.min(Math.max(input.quantity, 1), Math.max(input.availableStock, 1)),
        });
    }

    writeStorage(storage);
    return toCartResponse(storage.items);
}

export function updateGuestCartItem(productId: number, quantity: number): CartResponse {
    const storage = readStorage();
    const item = storage.items.find((entry) => entry.productId === productId);

    if (!item) {
        return toCartResponse(storage.items);
    }

    item.quantity = Math.min(Math.max(quantity, 1), Math.max(item.availableStock, 1));
    writeStorage(storage);

    return toCartResponse(storage.items);
}

export function removeGuestCartItem(productId: number): CartResponse {
    const storage = readStorage();
    const nextItems = storage.items.filter((item) => item.productId !== productId);
    writeStorage({ items: nextItems });
    return toCartResponse(nextItems);
}

export function clearGuestCart(): CartResponse {
    writeStorage({ items: [] });
    return toCartResponse([]);
}

export function buildGuestCheckoutItems() {
    const cart = getGuestCart();

    return cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
    }));
}

export function storeGuestLastOrder(order: unknown) {
    if (!isBrowser()) return;
    window.sessionStorage.setItem("guest-last-order", JSON.stringify(order));
}

export function readGuestLastOrder<T>() {
    if (!isBrowser()) return null;

    try {
        const raw = window.sessionStorage.getItem("guest-last-order");
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export function clearGuestLastOrder() {
    if (!isBrowser()) return;
    window.sessionStorage.removeItem("guest-last-order");
}