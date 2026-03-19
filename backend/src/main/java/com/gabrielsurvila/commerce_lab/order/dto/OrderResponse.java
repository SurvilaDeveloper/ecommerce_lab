//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/dto/OrderResponse.java
package com.gabrielsurvila.commerce_lab.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private final Long id;
    private final String orderNumber;
    private final String status;
    private final String paymentStatus;
    private final String fulfillmentStatus;
    private final String currency;
    private final BigDecimal subtotal;
    private final BigDecimal grandTotal;
    private final LocalDateTime placedAt;
    private final List<OrderItemResponse> items;

    public OrderResponse(
            Long id,
            String orderNumber,
            String status,
            String paymentStatus,
            String fulfillmentStatus,
            String currency,
            BigDecimal subtotal,
            BigDecimal grandTotal,
            LocalDateTime placedAt,
            List<OrderItemResponse> items) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.fulfillmentStatus = fulfillmentStatus;
        this.currency = currency;
        this.subtotal = subtotal;
        this.grandTotal = grandTotal;
        this.placedAt = placedAt;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public String getStatus() {
        return status;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public String getFulfillmentStatus() {
        return fulfillmentStatus;
    }

    public String getCurrency() {
        return currency;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public LocalDateTime getPlacedAt() {
        return placedAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }
}