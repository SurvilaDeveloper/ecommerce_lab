//src/main/java/com/gabrielsurvila/commerce_lab/catalog/dto/ProductResponse.java
package com.gabrielsurvila.commerce_lab.catalog.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {

    private final Long id;
    private final Long categoryId;
    private final String categoryName;
    private final String name;
    private final String slug;
    private final String sku;
    private final String shortDescription;
    private final String description;
    private final BigDecimal price;
    private final BigDecimal compareAtPrice;
    private final BigDecimal costPrice;
    private final String currency;
    private final Integer stock;
    private final Integer lowStockThreshold;
    private final boolean active;
    private final boolean featured;
    private final String primaryImageUrl;
    private final String primaryImageAltText;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

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
            boolean active,
            boolean featured,
            String primaryImageUrl,
            String primaryImageAltText,
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
        this.active = active;
        this.featured = featured;
        this.primaryImageUrl = primaryImageUrl;
        this.primaryImageAltText = primaryImageAltText;
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
        return active;
    }

    public boolean isFeatured() {
        return featured;
    }

    public String getPrimaryImageUrl() {
        return primaryImageUrl;
    }

    public String getPrimaryImageAltText() {
        return primaryImageAltText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}