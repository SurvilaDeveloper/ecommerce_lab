//frontend/src/lib/admin-orders.ts
import { apiFetchJson } from "@/lib/api";

export type AdminOrderItemResponse = {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

export type AdminOrderResponse = {
    id: number;
    userId: number;
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    currency: string;
    subtotal: number;
    grandTotal: number;
    placedAt: string;
    items: AdminOrderItemResponse[];
};

export type UpdateAdminOrderStatusRequest = {
    status: string;
    paymentStatus: string;
    fulfillmentStatus: string;
};

export async function getAdminOrders() {
    return apiFetchJson<AdminOrderResponse[]>("/api/admin/orders", {
        method: "GET",
    });
}

export async function getAdminOrderById(orderId: number) {
    return apiFetchJson<AdminOrderResponse>(`/api/admin/orders/${orderId}`, {
        method: "GET",
    });
}

export async function updateAdminOrderStatus(
    orderId: number,
    payload: UpdateAdminOrderStatusRequest
) {
    return apiFetchJson<AdminOrderResponse>(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        json: payload,
    });
}