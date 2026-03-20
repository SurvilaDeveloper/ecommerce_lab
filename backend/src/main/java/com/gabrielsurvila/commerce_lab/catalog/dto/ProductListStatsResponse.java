//src/main/java/com/gabrielsurvila/commerce_lab/catalog/dto/ProductListStatsResponse.java
package com.gabrielsurvila.commerce_lab.catalog.dto;

public class ProductListStatsResponse {

    private final long totalCount;
    private final long activeCount;
    private final long lowStockCount;
    private final long outOfStockCount;

    public ProductListStatsResponse(
            long totalCount,
            long activeCount,
            long lowStockCount,
            long outOfStockCount) {
        this.totalCount = totalCount;
        this.activeCount = activeCount;
        this.lowStockCount = lowStockCount;
        this.outOfStockCount = outOfStockCount;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public long getActiveCount() {
        return activeCount;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }
}
