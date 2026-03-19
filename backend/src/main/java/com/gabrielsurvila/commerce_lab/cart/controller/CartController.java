//backend/src/main/java/com/gabrielsurvila/commerce_lab/cart/controller/CartController.java
package com.gabrielsurvila.commerce_lab.cart.controller;

import com.gabrielsurvila.commerce_lab.auth.security.AuthUserDetails;
import com.gabrielsurvila.commerce_lab.cart.dto.AddCartItemRequest;
import com.gabrielsurvila.commerce_lab.cart.dto.CartResponse;
import com.gabrielsurvila.commerce_lab.cart.dto.UpdateCartItemRequest;
import com.gabrielsurvila.commerce_lab.cart.service.CartService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse getCart(
            @org.springframework.security.core.annotation.AuthenticationPrincipal AuthUserDetails authUserDetails) {
        return cartService.getCartByUserId(authUserDetails.getUser().getId());
    }

    @PostMapping("/items")
    public CartResponse addItem(
            @org.springframework.security.core.annotation.AuthenticationPrincipal AuthUserDetails authUserDetails,
            @RequestBody AddCartItemRequest request) {
        return cartService.addItem(authUserDetails.getUser().getId(), request);
    }

    @PatchMapping("/items/{itemId}")
    public CartResponse updateItem(
            @org.springframework.security.core.annotation.AuthenticationPrincipal AuthUserDetails authUserDetails,
            @PathVariable Long itemId,
            @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(authUserDetails.getUser().getId(), itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(
            @org.springframework.security.core.annotation.AuthenticationPrincipal AuthUserDetails authUserDetails,
            @PathVariable Long itemId) {
        return cartService.removeItem(authUserDetails.getUser().getId(), itemId);
    }

    @DeleteMapping("/items")
    public CartResponse clearCart(
            @org.springframework.security.core.annotation.AuthenticationPrincipal AuthUserDetails authUserDetails) {
        return cartService.clearCart(authUserDetails.getUser().getId());
    }
}
