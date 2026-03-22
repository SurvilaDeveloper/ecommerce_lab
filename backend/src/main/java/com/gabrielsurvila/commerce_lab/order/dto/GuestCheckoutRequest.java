// backend/src/main/java/com/gabrielsurvila/commerce_lab/order/dto/GuestCheckoutRequest.java
package com.gabrielsurvila.commerce_lab.order.dto;

import java.util.List;

public class GuestCheckoutRequest {

    private String customerEmail;
    private String deliveryMethod;
    private String recipientName;
    private String phone;
    private String notes;
    private CheckoutAddressRequest shippingAddress;
    private List<GuestCheckoutItemRequest> items;

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getDeliveryMethod() {
        return deliveryMethod;
    }

    public void setDeliveryMethod(String deliveryMethod) {
        this.deliveryMethod = deliveryMethod;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public CheckoutAddressRequest getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(CheckoutAddressRequest shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public List<GuestCheckoutItemRequest> getItems() {
        return items;
    }

    public void setItems(List<GuestCheckoutItemRequest> items) {
        this.items = items;
    }
}
