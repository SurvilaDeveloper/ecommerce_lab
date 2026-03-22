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
    userId: number | null;
    customerName: string;
    customerEmail: string;
    orderSource: string;
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

export type AdminOrdersPageResponse = {
    content: AdminOrderResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    first: boolean;
    last: boolean;
};

export type GetAdminOrdersParams = {
    search?: string;
    deliveryMethod?: string;
    status?: string;
    paymentStatus?: string;
    fulfillmentStatus?: string;
    page?: number;
    size?: number;
};

export type UpdateAdminOrderStatusRequest = {
    status: string;
    paymentStatus: string;
    fulfillmentStatus: string;
};

export async function getAdminOrders(params: GetAdminOrdersParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.search?.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.deliveryMethod?.trim()) {
        searchParams.set("deliveryMethod", params.deliveryMethod.trim());
    }

    if (params.status?.trim()) {
        searchParams.set("status", params.status.trim());
    }

    if (params.paymentStatus?.trim()) {
        searchParams.set("paymentStatus", params.paymentStatus.trim());
    }

    if (params.fulfillmentStatus?.trim()) {
        searchParams.set("fulfillmentStatus", params.fulfillmentStatus.trim());
    }

    searchParams.set("page", String(params.page ?? 0));
    searchParams.set("size", String(params.size ?? 10));

    const query = searchParams.toString();

    return apiFetchJson<AdminOrdersPageResponse>(
        `/api/admin/orders${query ? `?${query}` : ""}`,
        {
            method: "GET",
        }
    );
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