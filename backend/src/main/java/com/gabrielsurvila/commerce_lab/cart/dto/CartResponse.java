//backend/src/main/java/com/gabrielsurvila/commerce_lab/cart/dto/CartResponse.java
package com.gabrielsurvila.commerce_lab.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {

    private final Long cartId;
    private final Long userId;
    private final List<CartItemResponse> items;
    private final Integer totalItems;
    private final BigDecimal subtotal;

    public CartResponse(
            Long cartId,
            Long userId,
            List<CartItemResponse> items,
            Integer totalItems,
            BigDecimal subtotal) {
        this.cartId = cartId;
        this.userId = userId;
        this.items = items;
        this.totalItems = totalItems;
        this.subtotal = subtotal;
    }

    public Long getCartId() {
        return cartId;
    }

    public Long getUserId() {
        return userId;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }
}
