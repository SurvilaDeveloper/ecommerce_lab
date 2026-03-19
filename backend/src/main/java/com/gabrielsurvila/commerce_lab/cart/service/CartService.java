//backend/src/main/java/com/gabrielsurvila/commerce_lab/cart/service/CartService.java
package com.gabrielsurvila.commerce_lab.cart.service;

import com.gabrielsurvila.commerce_lab.cart.dto.AddCartItemRequest;
import com.gabrielsurvila.commerce_lab.cart.dto.CartItemResponse;
import com.gabrielsurvila.commerce_lab.cart.dto.CartResponse;
import com.gabrielsurvila.commerce_lab.cart.dto.UpdateCartItemRequest;
import com.gabrielsurvila.commerce_lab.cart.entity.Cart;
import com.gabrielsurvila.commerce_lab.cart.entity.CartItem;
import com.gabrielsurvila.commerce_lab.cart.repository.CartItemRepository;
import com.gabrielsurvila.commerce_lab.cart.repository.CartRepository;
import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import com.gabrielsurvila.commerce_lab.catalog.entity.ProductImage;
import com.gabrielsurvila.commerce_lab.catalog.repository.ProductImageRepository;
import com.gabrielsurvila.commerce_lab.catalog.repository.ProductRepository;
import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import com.gabrielsurvila.commerce_lab.user.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserAccountRepository userAccountRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            UserAccountRepository userAccountRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional
    public CartResponse getCartByUserId(Long userId) {
        UserAccount user = findUser(userId);
        Cart cart = getOrCreateCart(user);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(Long userId, AddCartItemRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Add cart item request is required");
        }

        UserAccount user = findUser(userId);
        Cart cart = getOrCreateCart(user);

        Long productId = request.getProductId();
        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException("Product id is required");
        }

        int quantity = normalizeQuantity(request.getQuantity(), "Quantity must be greater than zero");

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        validateProductForCart(product);

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    newItem.setUnitPrice(product.getPrice());
                    return newItem;
                });

        int nextQuantity = item.getQuantity() + quantity;

        if (product.getStock() != null && nextQuantity > product.getStock()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock");
        }

        item.setQuantity(nextQuantity);
        item.setUnitPrice(product.getPrice());

        cartItemRepository.save(item);

        return toResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Update cart item request is required");
        }

        UserAccount user = findUser(userId);
        Cart cart = getOrCreateCart(user);

        if (itemId == null || itemId <= 0) {
            throw new IllegalArgumentException("Cart item id must be greater than zero");
        }

        int quantity = normalizeQuantity(request.getQuantity(), "Quantity must be greater than zero");

        CartItem item = cartItemRepository.findByIdAndCart(itemId, cart)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        Product product = item.getProduct();
        validateProductForCart(product);

        if (product.getStock() != null && quantity > product.getStock()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock");
        }

        item.setQuantity(quantity);
        item.setUnitPrice(product.getPrice());

        cartItemRepository.save(item);

        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        UserAccount user = findUser(userId);
        Cart cart = getOrCreateCart(user);

        if (itemId == null || itemId <= 0) {
            throw new IllegalArgumentException("Cart item id must be greater than zero");
        }

        CartItem item = cartItemRepository.findByIdAndCart(itemId, cart)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        cartItemRepository.delete(item);

        return toResponse(cart);
    }

    @Transactional
    public CartResponse clearCart(Long userId) {
        UserAccount user = findUser(userId);
        Cart cart = getOrCreateCart(user);

        cartItemRepository.deleteByCart(cart);

        return toResponse(cart);
    }

    private UserAccount findUser(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Authenticated user id is invalid");
        }

        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private Cart getOrCreateCart(UserAccount user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    private void validateProductForCart(Product product) {
        if (!product.isActive()) {
            throw new IllegalArgumentException("Product is inactive");
        }

        if (product.getStock() == null || product.getStock() <= 0) {
            throw new IllegalArgumentException("Product is out of stock");
        }
    }

    private int normalizeQuantity(Integer value, String errorMessage) {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException(errorMessage);
        }

        return value;
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartOrderByCreatedAtAsc(cart);

        List<CartItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .toList();

        int totalItems = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        BigDecimal subtotal = itemResponses.stream()
                .map(CartItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(
                cart.getId(),
                cart.getUser().getId(),
                itemResponses,
                totalItems,
                subtotal);
    }

    private CartItemResponse toItemResponse(CartItem item) {
        Product product = item.getProduct();

        ProductImage primaryImage = productImageRepository.findFirstByProductAndIsPrimaryTrue(product)
                .orElseGet(
                        () -> productImageRepository.findFirstByProductOrderBySortOrderAscIdAsc(product).orElse(null));

        String primaryImageUrl = primaryImage != null ? primaryImage.getImageUrl() : null;

        BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

        return new CartItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getSku(),
                primaryImageUrl,
                item.getQuantity(),
                item.getUnitPrice(),
                lineTotal,
                product.getStock(),
                product.isActive());
    }
}
