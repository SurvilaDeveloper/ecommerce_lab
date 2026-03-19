//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/repository/OrderItemRepository.java
package com.gabrielsurvila.commerce_lab.order.repository;

import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderOrderByCreatedAtAsc(CustomerOrder order);
}
