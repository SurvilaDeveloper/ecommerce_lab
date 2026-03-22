//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/controller/AdminOrderController.java
package com.gabrielsurvila.commerce_lab.order.controller;

import com.gabrielsurvila.commerce_lab.common.dto.PageResponse;
import com.gabrielsurvila.commerce_lab.order.dto.AdminOrderResponse;
import com.gabrielsurvila.commerce_lab.order.dto.UpdateAdminOrderStatusRequest;
import com.gabrielsurvila.commerce_lab.order.service.AdminOrderManagementService;
import com.gabrielsurvila.commerce_lab.order.service.AdminOrderQueryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final AdminOrderQueryService adminOrderQueryService;
    private final AdminOrderManagementService adminOrderManagementService;

    public AdminOrderController(
            AdminOrderQueryService adminOrderQueryService,
            AdminOrderManagementService adminOrderManagementService) {
        this.adminOrderQueryService = adminOrderQueryService;
        this.adminOrderManagementService = adminOrderManagementService;
    }

    @GetMapping
    public PageResponse<AdminOrderResponse> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String deliveryMethod,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String fulfillmentStatus,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return adminOrderQueryService.findOrders(
                search,
                deliveryMethod,
                status,
                paymentStatus,
                fulfillmentStatus,
                page,
                size);
    }

    @GetMapping("/{orderId}")
    public AdminOrderResponse findById(@PathVariable Long orderId) {
        return adminOrderQueryService.findById(orderId);
    }

    @PatchMapping("/{orderId}/status")
    public AdminOrderResponse updateStatuses(
            @PathVariable Long orderId,
            @RequestBody UpdateAdminOrderStatusRequest request) {
        return adminOrderManagementService.updateStatuses(orderId, request);
    }
}
