// backend/src/main/java/com/gabrielsurvila/commerce_lab/admin/dto/AdminCategoryResponse.java
package com.gabrielsurvila.commerce_lab.admin.dto;

import java.time.LocalDateTime;

public class AdminCategoryResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private boolean isActive;
    private long productCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AdminCategoryResponse(
            Long id,
            String name,
            String slug,
            String description,
            boolean isActive,
            long productCount,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.isActive = isActive;
        this.productCount = productCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return isActive;
    }

    public long getProductCount() {
        return productCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}