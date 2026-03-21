// backend/src/main/java/com/gabrielsurvila/commerce_lab/order/controller/CheckoutController.java
package com.gabrielsurvila.commerce_lab.order.controller;

import com.gabrielsurvila.commerce_lab.auth.security.AuthUserDetails;
import com.gabrielsurvila.commerce_lab.order.dto.CheckoutRequest;
import com.gabrielsurvila.commerce_lab.order.dto.OrderResponse;
import com.gabrielsurvila.commerce_lab.order.service.CheckoutService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/checkout")
    public OrderResponse checkout(
            @AuthenticationPrincipal AuthUserDetails authUserDetails,
            @RequestBody CheckoutRequest request) {
        return checkoutService.checkout(authUserDetails.getUser().getId(), request);
    }
}