// backend/src/main/java/com/gabrielsurvila/commerce_lab/order/service/GuestCheckoutService.java
package com.gabrielsurvila.commerce_lab.order.service;

import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import com.gabrielsurvila.commerce_lab.catalog.repository.ProductRepository;
import com.gabrielsurvila.commerce_lab.order.dto.*;
import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.order.entity.OrderItem;
import com.gabrielsurvila.commerce_lab.order.repository.CustomerOrderRepository;
import com.gabrielsurvila.commerce_lab.order.repository.OrderItemRepository;
import com.gabrielsurvila.commerce_lab.user.entity.Address;
import com.gabrielsurvila.commerce_lab.user.repository.AddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class GuestCheckoutService {

    private static final String DELIVERY_METHOD_PICKUP = "PICKUP";
    private static final String DELIVERY_METHOD_DELIVERY = "DELIVERY";
    private static final BigDecimal DELIVERY_FLAT_RATE = new BigDecimal("3500.00");

    private final ProductRepository productRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddressRepository addressRepository;

    public GuestCheckoutService(
            ProductRepository productRepository,
            CustomerOrderRepository customerOrderRepository,
            OrderItemRepository orderItemRepository,
            AddressRepository addressRepository) {
        this.productRepository = productRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderItemRepository = orderItemRepository;
        this.addressRepository = addressRepository;
    }

    public OrderResponse checkout(GuestCheckoutRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Guest checkout request is required");
        }

        String customerEmail = normalizeRequiredText(request.getCustomerEmail(), "Customer email is required");
        String deliveryMethod = normalizeDeliveryMethod(request.getDeliveryMethod());
        String recipientName = normalizeRequiredText(request.getRecipientName(), "Recipient name is required");
        String phone = normalizeRequiredText(request.getPhone(), "Phone is required");
        String notes = normalizeOptionalText(request.getNotes());

        List<GuestCheckoutItemRequest> requestedItems = request.getItems();
        if (requestedItems == null || requestedItems.isEmpty()) {
            throw new IllegalArgumentException("At least one item is required");
        }

        Address shippingAddress = null;
        BigDecimal shippingTotal = BigDecimal.ZERO;

        if (DELIVERY_METHOD_DELIVERY.equals(deliveryMethod)) {
            shippingAddress = createGuestShippingAddress(recipientName, phone, request.getShippingAddress());
            shippingTotal = DELIVERY_FLAT_RATE;
        }

        CustomerOrder order = new CustomerOrder();
        order.setUser(null);
        order.setCustomerEmail(customerEmail.trim().toLowerCase(Locale.ROOT));
        order.setOrderSource("GUEST");
        order.setOrderNumber(generateOrderNumber());
        order.setStatus("PENDING");
        order.setPaymentStatus("PENDING");
        order.setFulfillmentStatus("UNFULFILLED");
        order.setCurrency("ARS");
        order.setDeliveryMethod(deliveryMethod);
        order.setRecipientName(recipientName);
        order.setPhone(phone);
        order.setNotes(notes);
        order.setShippingAddress(shippingAddress);
        order.setBillingAddress(null);
        order.setPlacedAt(LocalDateTime.now());

        CustomerOrder savedOrder = customerOrderRepository.save(order);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (GuestCheckoutItemRequest requestedItem : requestedItems) {
            if (requestedItem.getProductId() == null || requestedItem.getProductId() <= 0) {
                throw new IllegalArgumentException("Product id is required");
            }

            int quantity = normalizeQuantity(requestedItem.getQuantity(), "Quantity must be greater than zero");

            Product product = productRepository.findById(requestedItem.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));

            validateProductForCheckout(product, quantity);

            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setProductSku(product.getSku());
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setDiscountTotal(BigDecimal.ZERO);
            orderItem.setLineTotal(lineTotal);

            orderItemRepository.save(orderItem);

            subtotal = subtotal.add(lineTotal);

            product.setStock(product.getStock() - quantity);
        }

        BigDecimal discountTotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;
        BigDecimal grandTotal = subtotal
                .subtract(discountTotal)
                .add(shippingTotal)
                .add(taxTotal);

        savedOrder.setSubtotal(subtotal);
        savedOrder.setDiscountTotal(discountTotal);
        savedOrder.setShippingTotal(shippingTotal);
        savedOrder.setTaxTotal(taxTotal);
        savedOrder.setGrandTotal(grandTotal);

        CustomerOrder finalOrder = customerOrderRepository.save(savedOrder);

        return toResponse(finalOrder);
    }

    private Address createGuestShippingAddress(
            String recipientName,
            String phone,
            CheckoutAddressRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Shipping address is required for delivery");
        }

        Address address = new Address();
        address.setUser(null);
        address.setLabel("Guest checkout");
        address.setRecipientName(recipientName);
        address.setLine1(normalizeRequiredText(request.getLine1(), "Address line 1 is required"));
        address.setLine2(normalizeOptionalText(request.getLine2()));
        address.setCity(normalizeRequiredText(request.getCity(), "City is required"));
        address.setState(normalizeOptionalText(request.getState()));
        address.setPostalCode(normalizeRequiredText(request.getPostalCode(), "Postal code is required"));

        String countryCode = normalizeOptionalText(request.getCountryCode());
        address.setCountryCode(countryCode == null ? "AR" : countryCode.toUpperCase(Locale.ROOT));
        return addressRepository.save(address);
    }

    private void validateProductForCheckout(Product product, int quantity) {
        if (!product.isActive()) {
            throw new IllegalArgumentException("One of the products is inactive");
        }

        if (product.getStock() == null || product.getStock() <= 0) {
            throw new IllegalArgumentException("One of the products is out of stock");
        }

        if (quantity > product.getStock()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock");
        }
    }

    private int normalizeQuantity(Integer value, String errorMessage) {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException(errorMessage);
        }
        return value;
    }

    private String normalizeDeliveryMethod(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Delivery method is required");
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);

        if (!DELIVERY_METHOD_PICKUP.equals(normalized) && !DELIVERY_METHOD_DELIVERY.equals(normalized)) {
            throw new IllegalArgumentException("Delivery method is invalid");
        }

        return normalized;
    }

    private String normalizeRequiredText(String value, String errorMessage) {
        if (value == null || value.trim().isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }
        return value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private String generateOrderNumber() {
        String orderNumber = "ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        while (customerOrderRepository.existsByOrderNumber(orderNumber)) {
            orderNumber = "ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        }

        return orderNumber;
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

        return new OrderResponse(
                order.getId(),
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
                order.getCustomerEmail(),
                order.getOrderSource(),
                order.getDeliveryMethod(),
                order.getRecipientName(),
                order.getPhone(),
                order.getNotes(),
                order.getPlacedAt(),
                shippingAddress,
                items);
    }
}
