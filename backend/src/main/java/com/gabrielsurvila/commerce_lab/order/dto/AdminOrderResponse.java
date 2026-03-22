//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/dto/AdminOrderResponse.java
package com.gabrielsurvila.commerce_lab.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminOrderResponse {

    private final Long id;
    private final Long userId;
    private final String customerName;
    private final String customerEmail;
    private final String orderSource;
    private final String orderNumber;
    private final String status;
    private final String paymentStatus;
    private final String fulfillmentStatus;
    private final String currency;
    private final BigDecimal subtotal;
    private final BigDecimal discountTotal;
    private final BigDecimal shippingTotal;
    private final BigDecimal taxTotal;
    private final BigDecimal grandTotal;
    private final String deliveryMethod;
    private final String recipientName;
    private final String phone;
    private final String notes;
    private final LocalDateTime placedAt;
    private final OrderAddressResponse shippingAddress;
    private final List<OrderItemResponse> items;

    public AdminOrderResponse(
            Long id,
            Long userId,
            String customerName,
            String customerEmail,
            String orderSource,
            String orderNumber,
            String status,
            String paymentStatus,
            String fulfillmentStatus,
            String currency,
            BigDecimal subtotal,
            BigDecimal discountTotal,
            BigDecimal shippingTotal,
            BigDecimal taxTotal,
            BigDecimal grandTotal,
            String deliveryMethod,
            String recipientName,
            String phone,
            String notes,
            LocalDateTime placedAt,
            OrderAddressResponse shippingAddress,
            List<OrderItemResponse> items) {
        this.id = id;
        this.userId = userId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.orderSource = orderSource;
        this.orderNumber = orderNumber;
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.fulfillmentStatus = fulfillmentStatus;
        this.currency = currency;
        this.subtotal = subtotal;
        this.discountTotal = discountTotal;
        this.shippingTotal = shippingTotal;
        this.taxTotal = taxTotal;
        this.grandTotal = grandTotal;
        this.deliveryMethod = deliveryMethod;
        this.recipientName = recipientName;
        this.phone = phone;
        this.notes = notes;
        this.placedAt = placedAt;
        this.shippingAddress = shippingAddress;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getOrderSource() {
        return orderSource;
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

    public BigDecimal getDiscountTotal() {
        return discountTotal;
    }

    public BigDecimal getShippingTotal() {
        return shippingTotal;
    }

    public BigDecimal getTaxTotal() {
        return taxTotal;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public String getDeliveryMethod() {
        return deliveryMethod;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getPhone() {
        return phone;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDateTime getPlacedAt() {
        return placedAt;
    }

    public OrderAddressResponse getShippingAddress() {
        return shippingAddress;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }
}
