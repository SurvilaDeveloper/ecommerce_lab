//backend/src/main/java/com/gabrielsurvila/commerce_lab/admin/dto/AdminDashboardRecentOrderResponse.java
package com.gabrielsurvila.commerce_lab.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminDashboardRecentOrderResponse {

    private final Long id;
    private final String orderNumber;
    private final String customerName;
    private final String customerEmail;
    private final String status;
    private final String paymentStatus;
    private final String fulfillmentStatus;
    private final String currency;
    private final BigDecimal grandTotal;
    private final LocalDateTime placedAt;

    public AdminDashboardRecentOrderResponse(
            Long id,
            String orderNumber,
            String customerName,
            String customerEmail,
            String status,
            String paymentStatus,
            String fulfillmentStatus,
            String currency,
            BigDecimal grandTotal,
            LocalDateTime placedAt) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.fulfillmentStatus = fulfillmentStatus;
        this.currency = currency;
        this.grandTotal = grandTotal;
        this.placedAt = placedAt;
    }

    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
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

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public LocalDateTime getPlacedAt() {
        return placedAt;
    }
}
