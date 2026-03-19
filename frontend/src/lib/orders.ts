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

export type OrderResponse = {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    currency: string;
    subtotal: number;
    grandTotal: number;
    placedAt: string;
    items: OrderItemResponse[];
};

export async function checkoutOrder() {
    return apiFetchJson<OrderResponse>("/api/orders/checkout", {
        method: "POST",
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