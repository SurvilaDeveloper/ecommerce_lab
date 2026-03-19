//backend/src/main/java/com/gabrielsurvila/commerce_lab/cart/dto/CartItemResponse.java
package com.gabrielsurvila.commerce_lab.cart.dto;

import java.math.BigDecimal;

public class CartItemResponse {

    private final Long id;
    private final Long productId;
    private final String productName;
    private final String productSlug;
    private final String productSku;
    private final String productPrimaryImageUrl;
    private final Integer quantity;
    private final BigDecimal unitPrice;
    private final BigDecimal lineTotal;
    private final Integer availableStock;
    private final boolean productActive;

    public CartItemResponse(
            Long id,
            Long productId,
            String productName,
            String productSlug,
            String productSku,
            String productPrimaryImageUrl,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal,
            Integer availableStock,
            boolean productActive) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productSlug = productSlug;
        this.productSku = productSku;
        this.productPrimaryImageUrl = productPrimaryImageUrl;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.lineTotal = lineTotal;
        this.availableStock = availableStock;
        this.productActive = productActive;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getProductSlug() {
        return productSlug;
    }

    public String getProductSku() {
        return productSku;
    }

    public String getProductPrimaryImageUrl() {
        return productPrimaryImageUrl;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public Integer getAvailableStock() {
        return availableStock;
    }

    public boolean isProductActive() {
        return productActive;
    }
}
