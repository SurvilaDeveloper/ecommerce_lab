//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/dto/UpdateAdminOrderStatusRequest.java
package com.gabrielsurvila.commerce_lab.order.dto;

public class UpdateAdminOrderStatusRequest {

    private String status;
    private String paymentStatus;
    private String fulfillmentStatus;

    public UpdateAdminOrderStatusRequest() {
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

    public void setStatus(String status) {
        this.status = status;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public void setFulfillmentStatus(String fulfillmentStatus) {
        this.fulfillmentStatus = fulfillmentStatus;
    }
}