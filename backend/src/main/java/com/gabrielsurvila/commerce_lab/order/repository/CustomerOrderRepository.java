//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/repository/CustomerOrderRepository.java
package com.gabrielsurvila.commerce_lab.order.repository;

import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

        boolean existsByOrderNumber(String orderNumber);

        long countByStatus(String status);

        long countByPaymentStatus(String paymentStatus);

        List<CustomerOrder> findByUserOrderByCreatedAtDesc(UserAccount user);

        @Query("""
                        select coalesce(sum(o.grandTotal), 0)
                        from CustomerOrder o
                        where o.paymentStatus = 'PAID'
                        """)
        BigDecimal sumPaidRevenue();

        @Query("""
                        select o
                        from CustomerOrder o
                        join fetch o.user
                        order by o.createdAt desc
                        """)
        List<CustomerOrder> findAllWithUserOrderByCreatedAtDesc();

        @Query("""
                        select o
                        from CustomerOrder o
                        join fetch o.user
                        where o.id = :id
                        """)
        Optional<CustomerOrder> findByIdWithUser(Long id);
}
