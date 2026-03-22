// backend/src/main/java/com/gabrielsurvila/commerce_lab/order/controller/GuestCheckoutController.java
package com.gabrielsurvila.commerce_lab.order.controller;

import com.gabrielsurvila.commerce_lab.order.dto.GuestCheckoutRequest;
import com.gabrielsurvila.commerce_lab.order.dto.OrderResponse;
import com.gabrielsurvila.commerce_lab.order.service.GuestCheckoutService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class GuestCheckoutController {

    private final GuestCheckoutService guestCheckoutService;

    public GuestCheckoutController(GuestCheckoutService guestCheckoutService) {
        this.guestCheckoutService = guestCheckoutService;
    }

    @PostMapping("/guest-checkout")
    public OrderResponse checkout(@RequestBody GuestCheckoutRequest request) {
        return guestCheckoutService.checkout(request);
    }
}
