//backend/src/main/java/com/gabrielsurvila/commerce_lab/admin/dto/AdminDashboardResponse.java
package com.gabrielsurvila.commerce_lab.admin.dto;

import java.util.List;

public class AdminDashboardResponse {

    private final List<AdminDashboardMetricResponse> metrics;
    private final List<AdminDashboardRecentOrderResponse> recentOrders;
    private final List<AdminDashboardLowStockProductResponse> lowStockProducts;

    public AdminDashboardResponse(
            List<AdminDashboardMetricResponse> metrics,
            List<AdminDashboardRecentOrderResponse> recentOrders,
            List<AdminDashboardLowStockProductResponse> lowStockProducts) {
        this.metrics = metrics;
        this.recentOrders = recentOrders;
        this.lowStockProducts = lowStockProducts;
    }

    public List<AdminDashboardMetricResponse> getMetrics() {
        return metrics;
    }

    public List<AdminDashboardRecentOrderResponse> getRecentOrders() {
        return recentOrders;
    }

    public List<AdminDashboardLowStockProductResponse> getLowStockProducts() {
        return lowStockProducts;
    }
}
