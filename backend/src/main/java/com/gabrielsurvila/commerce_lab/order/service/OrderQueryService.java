//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/service/OrderQueryService.java
package com.gabrielsurvila.commerce_lab.order.service;

import com.gabrielsurvila.commerce_lab.order.dto.OrderItemResponse;
import com.gabrielsurvila.commerce_lab.order.dto.OrderResponse;
import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.order.repository.CustomerOrderRepository;
import com.gabrielsurvila.commerce_lab.order.repository.OrderItemRepository;
import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import com.gabrielsurvila.commerce_lab.user.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class OrderQueryService {

    private final UserAccountRepository userAccountRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderQueryService(
            UserAccountRepository userAccountRepository,
            CustomerOrderRepository customerOrderRepository,
            OrderItemRepository orderItemRepository) {
        this.userAccountRepository = userAccountRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<OrderResponse> findOrdersByUserId(Long userId) {
        UserAccount user = findUser(userId);

        return customerOrderRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse findOrderByUserIdAndOrderId(Long userId, Long orderId) {
        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException("Order id must be greater than zero");
        }

        UserAccount user = findUser(userId);

        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Order not found");
        }

        return toResponse(order);
    }

    private UserAccount findUser(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Authenticated user id is invalid");
        }

        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private OrderResponse toResponse(CustomerOrder order) {
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

        return new OrderResponse(
                order.getId(),
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
