//src/main/java/com/gabrielsurvila/commerce_lab/catalog/dto/ProductResponse.java
package com.gabrielsurvila.commerce_lab.catalog.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String slug;
    private String sku;
    private String shortDescription;
    private String description;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private BigDecimal costPrice;
    private String currency;
    private Integer stock;
    private Integer lowStockThreshold;
    private boolean isActive;
    private boolean isFeatured;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse(
            Long id,
            Long categoryId,
            String categoryName,
            String name,
            String slug,
            String sku,
            String shortDescription,
            String description,
            BigDecimal price,
            BigDecimal compareAtPrice,
            BigDecimal costPrice,
            String currency,
            Integer stock,
            Integer lowStockThreshold,
            boolean isActive,
            boolean isFeatured,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.name = name;
        this.slug = slug;
        this.sku = sku;
        this.shortDescription = shortDescription;
        this.description = description;
        this.price = price;
        this.compareAtPrice = compareAtPrice;
        this.costPrice = costPrice;
        this.currency = currency;
        this.stock = stock;
        this.lowStockThreshold = lowStockThreshold;
        this.isActive = isActive;
        this.isFeatured = isFeatured;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getSku() {
        return sku;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getCompareAtPrice() {
        return compareAtPrice;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public Integer getStock() {
        return stock;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }

    public boolean isActive() {
        return isActive;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}