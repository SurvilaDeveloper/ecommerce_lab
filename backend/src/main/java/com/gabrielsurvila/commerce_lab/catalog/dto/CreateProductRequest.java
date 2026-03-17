//src/main/java/com/gabrielsurvila/commerce_lab/catalog/dto/CreateProductRequest.java
package com.gabrielsurvila.commerce_lab.catalog.dto;

import java.math.BigDecimal;

public class CreateProductRequest {

    private Long categoryId;
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
    private Boolean isActive;
    private Boolean isFeatured;

    public CreateProductRequest() {
    }

    public Long getCategoryId() {
        return categoryId;
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

    public Boolean getIsActive() {
        return isActive;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setCompareAtPrice(BigDecimal compareAtPrice) {
        this.compareAtPrice = compareAtPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public void setIsFeatured(Boolean featured) {
        isFeatured = featured;
    }
}
