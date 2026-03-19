//frontend/src/lib/admin-dashboard.ts
import { apiFetchJson } from "@/lib/api";

export type AdminDashboardMetricResponse = {
    label: string;
    value: string;
    description: string;
};

export type AdminDashboardRecentOrderResponse = {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    currency: string;
    grandTotal: number;
    placedAt: string;
};

export type AdminDashboardLowStockProductResponse = {
    id: number;
    name: string;
    sku: string;
    categoryName: string;
    stock: number;
    lowStockThreshold: number;
    active: boolean;
};

export type AdminDashboardResponse = {
    metrics: AdminDashboardMetricResponse[];
    recentOrders: AdminDashboardRecentOrderResponse[];
    lowStockProducts: AdminDashboardLowStockProductResponse[];
};

export async function getAdminDashboard() {
    return apiFetchJson<AdminDashboardResponse>("/api/admin/dashboard", {
        method: "GET",
    });
}