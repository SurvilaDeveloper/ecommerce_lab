//backend/src/main/java/com/gabrielsurvila/commerce_lab/cart/repository/CartItemRepository.java
package com.gabrielsurvila.commerce_lab.cart.repository;

import com.gabrielsurvila.commerce_lab.cart.entity.Cart;
import com.gabrielsurvila.commerce_lab.cart.entity.CartItem;
import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartOrderByCreatedAtAsc(Cart cart);

    Optional<CartItem> findByIdAndCart(Long id, Cart cart);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    void deleteByCart(Cart cart);
}
