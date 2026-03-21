//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/service/AdminOrderManagementService.java
package com.gabrielsurvila.commerce_lab.order.service;

import com.gabrielsurvila.commerce_lab.order.dto.AdminOrderResponse;
import com.gabrielsurvila.commerce_lab.order.dto.OrderAddressResponse;
import com.gabrielsurvila.commerce_lab.order.dto.OrderItemResponse;
import com.gabrielsurvila.commerce_lab.order.dto.UpdateAdminOrderStatusRequest;
import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.order.repository.CustomerOrderRepository;
import com.gabrielsurvila.commerce_lab.order.repository.OrderItemRepository;
import com.gabrielsurvila.commerce_lab.user.entity.Address;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional
public class AdminOrderManagementService {

        private static final Set<String> VALID_ORDER_STATUSES = Set.of(
                        "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED");

        private static final Set<String> VALID_PAYMENT_STATUSES = Set.of(
                        "PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED");

        private static final Set<String> VALID_FULFILLMENT_STATUSES = Set.of(
                        "UNFULFILLED", "PARTIALLY_FULFILLED", "FULFILLED", "RETURNED");

        private final CustomerOrderRepository customerOrderRepository;
        private final OrderItemRepository orderItemRepository;

        public AdminOrderManagementService(
                        CustomerOrderRepository customerOrderRepository,
                        OrderItemRepository orderItemRepository) {
                this.customerOrderRepository = customerOrderRepository;
                this.orderItemRepository = orderItemRepository;
        }

        public AdminOrderResponse updateStatuses(Long orderId, UpdateAdminOrderStatusRequest request) {
                if (orderId == null || orderId <= 0) {
                        throw new IllegalArgumentException("Order id must be greater than zero");
                }

                if (request == null) {
                        throw new IllegalArgumentException("Update order status request is required");
                }

                CustomerOrder order = customerOrderRepository.findByIdWithUser(orderId)
                                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

                String status = normalizeRequiredStatus(
                                request.getStatus(),
                                VALID_ORDER_STATUSES,
                                "Order status is invalid");

                String paymentStatus = normalizeRequiredStatus(
                                request.getPaymentStatus(),
                                VALID_PAYMENT_STATUSES,
                                "Payment status is invalid");

                String fulfillmentStatus = normalizeRequiredStatus(
                                request.getFulfillmentStatus(),
                                VALID_FULFILLMENT_STATUSES,
                                "Fulfillment status is invalid");

                order.setStatus(status);
                order.setPaymentStatus(paymentStatus);
                order.setFulfillmentStatus(fulfillmentStatus);

                CustomerOrder saved = customerOrderRepository.save(order);

                return toResponse(saved);
        }

        private String normalizeRequiredStatus(String value, Set<String> allowed, String errorMessage) {
                if (value == null || value.isBlank()) {
                        throw new IllegalArgumentException(errorMessage);
                }

                String normalized = value.trim().toUpperCase(Locale.ROOT);

                if (!allowed.contains(normalized)) {
                        throw new IllegalArgumentException(errorMessage);
                }

                return normalized;
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

                OrderAddressResponse shippingAddress = null;

                if (order.getShippingAddress() != null) {
                        Address address = order.getShippingAddress();

                        shippingAddress = new OrderAddressResponse(
                                        address.getId(),
                                        address.getRecipientName(),
                                        address.getLine1(),
                                        address.getLine2(),
                                        address.getCity(),
                                        address.getState(),
                                        address.getPostalCode(),
                                        address.getCountryCode());
                }

                String firstName = order.getUser().getFirstName() == null ? "" : order.getUser().getFirstName().trim();
                String lastName = order.getUser().getLastName() == null ? "" : order.getUser().getLastName().trim();
                String customerName = (firstName + " " + lastName).trim();

                if (customerName.isBlank()) {
                        customerName = order.getUser().getEmail();
                }

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
                                order.getDiscountTotal(),
                                order.getShippingTotal(),
                                order.getTaxTotal(),
                                order.getGrandTotal(),
                                order.getDeliveryMethod(),
                                order.getRecipientName(),
                                order.getPhone(),
                                order.getNotes(),
                                order.getPlacedAt(),
                                shippingAddress,
                                items);
        }
}
