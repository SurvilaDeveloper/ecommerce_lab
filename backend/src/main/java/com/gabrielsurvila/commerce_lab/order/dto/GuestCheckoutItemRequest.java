// backend/src/main/java/com/gabrielsurvila/commerce_lab/order/dto/GuestCheckoutItemRequest.java
package com.gabrielsurvila.commerce_lab.order.dto;

public class GuestCheckoutItemRequest {

    private Long productId;
    private Integer quantity;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
