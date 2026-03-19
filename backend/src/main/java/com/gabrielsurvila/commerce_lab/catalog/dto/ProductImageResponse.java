//backend/src/main/java/com/gabrielsurvila/commerce_lab/catalog/dto/ProductImageResponse.java
package com.gabrielsurvila.commerce_lab.catalog.dto;

import java.time.LocalDateTime;

public class ProductImageResponse {

    private final Long id;
    private final Long productId;
    private final String imageUrl;
    private final String publicId;
    private final String altText;
    private final Integer sortOrder;
    private final boolean isPrimary;
    private final Integer width;
    private final Integer height;
    private final LocalDateTime createdAt;

    public ProductImageResponse(
            Long id,
            Long productId,
            String imageUrl,
            String publicId,
            String altText,
            Integer sortOrder,
            boolean isPrimary,
            Integer width,
            Integer height,
            LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.imageUrl = imageUrl;
        this.publicId = publicId;
        this.altText = altText;
        this.sortOrder = sortOrder;
        this.isPrimary = isPrimary;
        this.width = width;
        this.height = height;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getPublicId() {
        return publicId;
    }

    public String getAltText() {
        return altText;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public Integer getWidth() {
        return width;
    }

    public Integer getHeight() {
        return height;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
