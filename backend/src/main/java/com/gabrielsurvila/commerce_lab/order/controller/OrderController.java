//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/controller/OrderController.java
package com.gabrielsurvila.commerce_lab.order.controller;

import com.gabrielsurvila.commerce_lab.auth.security.AuthUserDetails;
import com.gabrielsurvila.commerce_lab.order.dto.OrderResponse;
import com.gabrielsurvila.commerce_lab.order.service.OrderQueryService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderQueryService orderQueryService;

    public OrderController(OrderQueryService orderQueryService) {
        this.orderQueryService = orderQueryService;
    }

    @GetMapping
    public List<OrderResponse> findMyOrders(@AuthenticationPrincipal AuthUserDetails authUserDetails) {
        return orderQueryService.findOrdersByUserId(authUserDetails.getUser().getId());
    }

    @GetMapping("/{orderId}")
    public OrderResponse findMyOrderById(
            @AuthenticationPrincipal AuthUserDetails authUserDetails,
            @PathVariable Long orderId) {
        return orderQueryService.findOrderByUserIdAndOrderId(authUserDetails.getUser().getId(), orderId);
    }
}