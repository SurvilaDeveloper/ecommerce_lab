// backend/src/main/java/com/gabrielsurvila/commerce_lab/order/dto/CheckoutRequest.java
package com.gabrielsurvila.commerce_lab.order.dto;

public class CheckoutRequest {

    private String deliveryMethod;
    private String recipientName;
    private String phone;
    private String notes;
    private CheckoutAddressRequest shippingAddress;

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
}
