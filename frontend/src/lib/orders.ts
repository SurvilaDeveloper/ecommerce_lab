//frontend/src/lib/orders.ts
import { apiFetchJson } from "@/lib/api";

export type OrderItemResponse = {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

export type OrderAddressResponse = {
    id: number;
    recipientName: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    countryCode: string;
};

export type OrderResponse = {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    currency: string;
    subtotal: number;
    discountTotal: number;
    shippingTotal: number;
    taxTotal: number;
    grandTotal: number;
    deliveryMethod: "PICKUP" | "DELIVERY";
    recipientName: string;
    phone: string;
    notes: string | null;
    placedAt: string | null;
    shippingAddress: OrderAddressResponse | null;
    items: OrderItemResponse[];
};

export type CheckoutAddressRequest = {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    countryCode: string;
};

export type CheckoutRequest = {
    deliveryMethod: "PICKUP" | "DELIVERY";
    recipientName: string;
    phone: string;
    notes?: string;
    shippingAddress?: CheckoutAddressRequest;
};

export type GuestCheckoutItemRequest = {
    productId: number;
    quantity: number;
};

export type GuestCheckoutRequest = {
    customerEmail: string;
    deliveryMethod: "PICKUP" | "DELIVERY";
    recipientName: string;
    phone: string;
    notes?: string;
    shippingAddress?: CheckoutAddressRequest;
    items: GuestCheckoutItemRequest[];
};

export async function checkoutOrder(payload: CheckoutRequest) {
    return apiFetchJson<OrderResponse>("/api/orders/checkout", {
        method: "POST",
        json: payload,
    });
}

export async function guestCheckoutOrder(payload: GuestCheckoutRequest) {
    return apiFetchJson<OrderResponse>("/api/orders/guest-checkout", {
        method: "POST",
        json: payload,
    });
}

export async function getMyOrders() {
    return apiFetchJson<OrderResponse[]>("/api/orders", {
        method: "GET",
    });
}

export async function getMyOrderById(orderId: number) {
    return apiFetchJson<OrderResponse>(`/api/orders/${orderId}`, {
        method: "GET",
    });
}