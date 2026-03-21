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

export type AdminOrderAddressResponse = {
    id: number;
    recipientName: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    countryCode: string;
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
    discountTotal: number;
    shippingTotal: number;
    taxTotal: number;
    grandTotal: number;
    deliveryMethod: "PICKUP" | "DELIVERY";
    recipientName: string;
    phone: string;
    notes: string | null;
    placedAt: string | null;
    shippingAddress: AdminOrderAddressResponse | null;
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