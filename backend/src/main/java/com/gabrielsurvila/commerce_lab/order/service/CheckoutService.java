//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/service/CheckoutService.java
package com.gabrielsurvila.commerce_lab.order.service;

import com.gabrielsurvila.commerce_lab.cart.entity.Cart;
import com.gabrielsurvila.commerce_lab.cart.entity.CartItem;
import com.gabrielsurvila.commerce_lab.cart.repository.CartItemRepository;
import com.gabrielsurvila.commerce_lab.cart.repository.CartRepository;
import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import com.gabrielsurvila.commerce_lab.order.dto.OrderItemResponse;
import com.gabrielsurvila.commerce_lab.order.dto.OrderResponse;
import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.order.entity.OrderItem;
import com.gabrielsurvila.commerce_lab.order.repository.CustomerOrderRepository;
import com.gabrielsurvila.commerce_lab.order.repository.OrderItemRepository;
import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import com.gabrielsurvila.commerce_lab.user.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CheckoutService {

    private final UserAccountRepository userAccountRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderItemRepository orderItemRepository;

    public CheckoutService(
            UserAccountRepository userAccountRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            CustomerOrderRepository customerOrderRepository,
            OrderItemRepository orderItemRepository) {
        this.userAccountRepository = userAccountRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public OrderResponse checkout(Long userId) {
        UserAccount user = findUser(userId);

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCartOrderByCreatedAtAsc(cart);

        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        validateCartItems(cartItems);

        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus("CONFIRMED");
        order.setPaymentStatus("PENDING");
        order.setFulfillmentStatus("UNFULFILLED");
        order.setCurrency("ARS");
        order.setPlacedAt(LocalDateTime.now());

        BigDecimal subtotal = BigDecimal.ZERO;

        CustomerOrder savedOrder = customerOrderRepository.save(order);

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

        savedOrder.setSubtotal(subtotal);
        savedOrder.setDiscountTotal(BigDecimal.ZERO);
        savedOrder.setShippingTotal(BigDecimal.ZERO);
        savedOrder.setTaxTotal(BigDecimal.ZERO);
        savedOrder.setGrandTotal(subtotal);

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
