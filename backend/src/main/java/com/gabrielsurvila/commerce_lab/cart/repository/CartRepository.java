//backend/src/main/java/com/gabrielsurvila/commerce_lab/cart/repository/CartRepository.java
package com.gabrielsurvila.commerce_lab.cart.repository;

import com.gabrielsurvila.commerce_lab.cart.entity.Cart;
import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(UserAccount user);
}
