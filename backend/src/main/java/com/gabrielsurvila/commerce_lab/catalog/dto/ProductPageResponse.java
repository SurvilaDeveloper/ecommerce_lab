//src/main/java/com/gabrielsurvila/commerce_lab/catalog/dto/ProductPageResponse.java
package com.gabrielsurvila.commerce_lab.catalog.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public class ProductPageResponse {

    private final List<ProductResponse> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean hasNext;
    private final boolean hasPrevious;
    private final boolean first;
    private final boolean last;
    private final ProductListStatsResponse stats;

    public ProductPageResponse(
            List<ProductResponse> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean hasNext,
            boolean hasPrevious,
            boolean first,
            boolean last,
            ProductListStatsResponse stats) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.hasNext = hasNext;
        this.hasPrevious = hasPrevious;
        this.first = first;
        this.last = last;
        this.stats = stats;
    }

    public static ProductPageResponse from(
            Page<ProductResponse> page,
            ProductListStatsResponse stats) {
        return new ProductPageResponse(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious(),
                page.isFirst(),
                page.isLast(),
                stats);
    }

    public List<ProductResponse> getContent() {
        return content;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public boolean isHasPrevious() {
        return hasPrevious;
    }

    public boolean isFirst() {
        return first;
    }

    public boolean isLast() {
        return last;
    }

    public ProductListStatsResponse getStats() {
        return stats;
    }
}
