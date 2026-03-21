// backend/src/main/java/com/gabrielsurvila/commerce_lab/order/service/CheckoutService.java
package com.gabrielsurvila.commerce_lab.order.service;

import com.gabrielsurvila.commerce_lab.cart.entity.Cart;
import com.gabrielsurvila.commerce_lab.cart.entity.CartItem;
import com.gabrielsurvila.commerce_lab.cart.repository.CartItemRepository;
import com.gabrielsurvila.commerce_lab.cart.repository.CartRepository;
import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import com.gabrielsurvila.commerce_lab.order.dto.CheckoutAddressRequest;
import com.gabrielsurvila.commerce_lab.order.dto.CheckoutRequest;
import com.gabrielsurvila.commerce_lab.order.dto.OrderAddressResponse;
import com.gabrielsurvila.commerce_lab.order.dto.OrderItemResponse;
import com.gabrielsurvila.commerce_lab.order.dto.OrderResponse;
import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.order.entity.OrderItem;
import com.gabrielsurvila.commerce_lab.order.repository.CustomerOrderRepository;
import com.gabrielsurvila.commerce_lab.order.repository.OrderItemRepository;
import com.gabrielsurvila.commerce_lab.user.entity.Address;
import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import com.gabrielsurvila.commerce_lab.user.repository.AddressRepository;
import com.gabrielsurvila.commerce_lab.user.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class CheckoutService {

    private static final String DELIVERY_METHOD_PICKUP = "PICKUP";
    private static final String DELIVERY_METHOD_DELIVERY = "DELIVERY";
    private static final BigDecimal DELIVERY_FLAT_RATE = new BigDecimal("3500.00");

    private final UserAccountRepository userAccountRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddressRepository addressRepository;

    public CheckoutService(
            UserAccountRepository userAccountRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            CustomerOrderRepository customerOrderRepository,
            OrderItemRepository orderItemRepository,
            AddressRepository addressRepository) {
        this.userAccountRepository = userAccountRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderItemRepository = orderItemRepository;
        this.addressRepository = addressRepository;
    }

    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Checkout request is required");
        }

        UserAccount user = findUser(userId);
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCartOrderByCreatedAtAsc(cart);

        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        validateCartItems(cartItems);

        String deliveryMethod = normalizeDeliveryMethod(request.getDeliveryMethod());
        String recipientName = normalizeRequiredText(request.getRecipientName(), "Recipient name is required");
        String phone = normalizeRequiredText(request.getPhone(), "Phone is required");
        String notes = normalizeOptionalText(request.getNotes());

        Address shippingAddress = null;
        BigDecimal shippingTotal = BigDecimal.ZERO;

        if (DELIVERY_METHOD_DELIVERY.equals(deliveryMethod)) {
            shippingAddress = createShippingAddress(user, recipientName, request.getShippingAddress());
            shippingTotal = DELIVERY_FLAT_RATE;
        }

        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
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
        order.setPlacedAt(java.time.LocalDateTime.now());

        CustomerOrder savedOrder = customerOrderRepository.save(order);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setProductSku(product.getSku());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setDiscountTotal(BigDecimal.ZERO);
            orderItem.setLineTotal(lineTotal);

            orderItemRepository.save(orderItem);

            subtotal = subtotal.add(lineTotal);

            int nextStock = product.getStock() - cartItem.getQuantity();
            product.setStock(nextStock);
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

        cartItemRepository.deleteByCart(cart);

        return toResponse(finalOrder);
    }

    private UserAccount findUser(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Authenticated user id is invalid");
        }

        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private void validateCartItems(List<CartItem> cartItems) {
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            if (!product.isActive()) {
                throw new IllegalArgumentException("One of the products is inactive");
            }

            if (product.getStock() == null || product.getStock() <= 0) {
                throw new IllegalArgumentException("One of the products is out of stock");
            }

            if (cartItem.getQuantity() > product.getStock()) {
                throw new IllegalArgumentException("One of the products exceeds available stock");
            }
        }
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

    private Address createShippingAddress(
            UserAccount user,
            String recipientName,
            CheckoutAddressRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Shipping address is required for delivery");
        }

        Address address = new Address();
        address.setUser(user);
        address.setLabel("Checkout");
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
                order.getDeliveryMethod(),
                order.getRecipientName(),
                order.getPhone(),
                order.getNotes(),
                order.getPlacedAt(),
                shippingAddress,
                items);
    }
}
