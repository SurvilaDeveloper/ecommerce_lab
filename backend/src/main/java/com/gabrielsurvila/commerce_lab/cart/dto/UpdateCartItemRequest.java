//backend/src/main/java/com/gabrielsurvila/commerce_lab/cart/dto/UpdateCartItemRequest.java
package com.gabrielsurvila.commerce_lab.cart.dto;

public class UpdateCartItemRequest {

    private Integer quantity;

    public UpdateCartItemRequest() {
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
