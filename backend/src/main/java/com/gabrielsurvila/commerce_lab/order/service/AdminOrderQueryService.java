//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/service/AdminOrderQueryService.java
package com.gabrielsurvila.commerce_lab.order.service;

import com.gabrielsurvila.commerce_lab.order.dto.AdminOrderResponse;
import com.gabrielsurvila.commerce_lab.order.dto.OrderItemResponse;
import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.order.repository.CustomerOrderRepository;
import com.gabrielsurvila.commerce_lab.order.repository.OrderItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminOrderQueryService {

    private final CustomerOrderRepository customerOrderRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminOrderQueryService(
            CustomerOrderRepository customerOrderRepository,
            OrderItemRepository orderItemRepository) {
        this.customerOrderRepository = customerOrderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<AdminOrderResponse> findAllOrders() {
        return customerOrderRepository.findAllWithUserOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminOrderResponse findById(Long orderId) {
        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException("Order id must be greater than zero");
        }

        CustomerOrder order = customerOrderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        return toResponse(order);
    }

    private AdminOrderResponse toResponse(CustomerOrder order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrderOrderByCreatedAtAsc(order)
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProductName(),
                        item.getProductSku(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getLineTotal()))
                .toList();

        String customerName = order.getUser().getFirstName() + " " + order.getUser().getLastName();

        return new AdminOrderResponse(
                order.getId(),
                order.getUser().getId(),
                customerName,
                order.getUser().getEmail(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getFulfillmentStatus(),
                order.getCurrency(),
                order.getSubtotal(),
                order.getGrandTotal(),
                order.getPlacedAt(),
                items);
    }
}
