//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/dto/OrderItemResponse.java
package com.gabrielsurvila.commerce_lab.order.dto;

import java.math.BigDecimal;

public class OrderItemResponse {

    private final Long id;
    private final Long productId;
    private final String productName;
    private final String productSku;
    private final Integer quantity;
    private final BigDecimal unitPrice;
    private final BigDecimal lineTotal;

    public OrderItemResponse(
            Long id,
            Long productId,
            String productName,
            String productSku,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productSku = productSku;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.lineTotal = lineTotal;
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

    public String getProductSku() {
        return productSku;
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
}
