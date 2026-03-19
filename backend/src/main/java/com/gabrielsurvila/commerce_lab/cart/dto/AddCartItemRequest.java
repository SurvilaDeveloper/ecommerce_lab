//backend/src/main/java/com/gabrielsurvila/commerce_lab/cart/dto/AddCartItemRequest.java
package com.gabrielsurvila.commerce_lab.cart.dto;

public class AddCartItemRequest {

    private Long productId;
    private Integer quantity;

    public AddCartItemRequest() {
    }

    public Long getProductId() {
        return productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
