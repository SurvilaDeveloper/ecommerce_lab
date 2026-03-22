//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/service/AdminOrderQueryService.java
package com.gabrielsurvila.commerce_lab.order.service;

import com.gabrielsurvila.commerce_lab.common.dto.PageResponse;
import com.gabrielsurvila.commerce_lab.order.dto.AdminOrderResponse;
import com.gabrielsurvila.commerce_lab.order.dto.OrderAddressResponse;
import com.gabrielsurvila.commerce_lab.order.dto.OrderItemResponse;
import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.order.repository.CustomerOrderRepository;
import com.gabrielsurvila.commerce_lab.order.repository.OrderItemRepository;
import com.gabrielsurvila.commerce_lab.user.entity.Address;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminOrderQueryService {

    private static final int DEFAULT_PAGE_SIZE = 10;

    private final CustomerOrderRepository customerOrderRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminOrderQueryService(
            CustomerOrderRepository customerOrderRepository,
            OrderItemRepository orderItemRepository) {
        this.customerOrderRepository = customerOrderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public PageResponse<AdminOrderResponse> findOrders(
            String search,
            String deliveryMethod,
            String status,
            String paymentStatus,
            String fulfillmentStatus,
            Integer page,
            Integer size) {

        String searchPattern = normalizeSearchPattern(search);
        String normalizedDeliveryMethod = normalizeExactFilter(deliveryMethod);
        String normalizedStatus = normalizeExactFilter(status);
        String normalizedPaymentStatus = normalizeExactFilter(paymentStatus);
        String normalizedFulfillmentStatus = normalizeExactFilter(fulfillmentStatus);

        Pageable pageable = PageRequest.of(
                normalizePage(page),
                normalizePageSize(size),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<CustomerOrder> orderPage = customerOrderRepository.searchAdminOrders(
                searchPattern,
                normalizedDeliveryMethod,
                normalizedStatus,
                normalizedPaymentStatus,
                normalizedFulfillmentStatus,
                pageable);

        List<AdminOrderResponse> content = orderPage.getContent()
                .stream()
                .map(this::toResponse)
                .toList();

        Page<AdminOrderResponse> responsePage = new PageImpl<>(
                content,
                pageable,
                orderPage.getTotalElements());

        return PageResponse.from(responsePage);
    }

    public List<AdminOrderResponse> findAllOrders() {
        return customerOrderRepository.findAllWithUserOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminOrderResponse findById(Long orderId) {
        validateOrderId(orderId);

        CustomerOrder order = customerOrderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        return toResponse(order);
    }

    private void validateOrderId(Long orderId) {
        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException("Order id must be greater than zero");
        }
    }

    private int normalizePage(Integer page) {
        if (page == null || page < 0) {
            return 0;
        }

        return page;
    }

    private int normalizePageSize(Integer size) {
        if (size == null) {
            return DEFAULT_PAGE_SIZE;
        }

        return switch (size) {
            case 10, 25, 50 -> size;
            default -> DEFAULT_PAGE_SIZE;
        };
    }

    private String normalizeSearchPattern(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim().toLowerCase();
        if (trimmed.isEmpty()) {
            return null;
        }

        return "%" + trimmed + "%";
    }

    private String normalizeExactFilter(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim().toUpperCase();
        return trimmed.isEmpty() ? null : trimmed;
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

        return new AdminOrderResponse(
                order.getId(),
                getUserId(order),
                resolveCustomerName(order),
                resolveCustomerEmail(order),
                order.getOrderSource(),
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
                toShippingAddressResponse(order),
                items);
    }

    private Long getUserId(CustomerOrder order) {
        return order.getUser() != null ? order.getUser().getId() : null;
    }

    private String resolveCustomerEmail(CustomerOrder order) {
        if (order.getUser() != null && order.getUser().getEmail() != null) {
            return order.getUser().getEmail();
        }

        return order.getCustomerEmail();
    }

    private String resolveCustomerName(CustomerOrder order) {
        if (order.getUser() == null) {
            return order.getRecipientName();
        }

        String firstName = safeTrim(order.getUser().getFirstName());
        String lastName = safeTrim(order.getUser().getLastName());
        String fullName = (firstName + " " + lastName).trim();

        if (!fullName.isBlank()) {
            return fullName;
        }

        String email = resolveCustomerEmail(order);
        return email != null && !email.isBlank() ? email : order.getRecipientName();
    }

    private OrderAddressResponse toShippingAddressResponse(CustomerOrder order) {
        if (order.getShippingAddress() == null) {
            return null;
        }

        Address address = order.getShippingAddress();

        return new OrderAddressResponse(
                address.getId(),
                address.getRecipientName(),
                address.getLine1(),
                address.getLine2(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountryCode());
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }
}
