// backend/src/main/java/com/gabrielsurvila/commerce_lab/admin/dto/AdminDashboardLowStockProductResponse.java
package com.gabrielsurvila.commerce_lab.admin.dto;

public class AdminDashboardLowStockProductResponse {

    private final Long id;
    private final String name;
    private final String sku;
    private final String categoryName;
    private final Integer stock;
    private final Integer lowStockThreshold;
    private final boolean active;

    public AdminDashboardLowStockProductResponse(
            Long id,
            String name,
            String sku,
            String categoryName,
            Integer stock,
            Integer lowStockThreshold,
            boolean active) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.categoryName = categoryName;
        this.stock = stock;
        this.lowStockThreshold = lowStockThreshold;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSku() {
        return sku;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public Integer getStock() {
        return stock;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }

    public boolean isActive() {
        return active;
    }
}
