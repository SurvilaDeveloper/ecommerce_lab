//backend/src/main/java/com/gabrielsurvila/commerce_lab/order/repository/CustomerOrderRepository.java
package com.gabrielsurvila.commerce_lab.order.repository;

import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
      left join fetch o.user
      order by o.createdAt desc
      """)
  List<CustomerOrder> findAllWithUserOrderByCreatedAtDesc();

  @Query("""
      select o
      from CustomerOrder o
      left join fetch o.user
      where o.id = :id
      """)
  Optional<CustomerOrder> findByIdWithUser(Long id);

  @EntityGraph(attributePaths = "user")
  @Query(value = """
      select o
      from CustomerOrder o
      left join o.user u
      where (:searchPattern is null
             or lower(o.orderNumber) like :searchPattern
             or lower(coalesce(o.customerEmail, '')) like :searchPattern
             or lower(coalesce(u.email, '')) like :searchPattern
             or lower(coalesce(o.recipientName, '')) like :searchPattern
             or lower(concat(coalesce(u.firstName, ''), ' ', coalesce(u.lastName, ''))) like :searchPattern)
        and (:deliveryMethod is null or o.deliveryMethod = :deliveryMethod)
        and (:status is null or o.status = :status)
        and (:paymentStatus is null or o.paymentStatus = :paymentStatus)
        and (:fulfillmentStatus is null or o.fulfillmentStatus = :fulfillmentStatus)
      """, countQuery = """
      select count(o)
      from CustomerOrder o
      left join o.user u
      where (:searchPattern is null
             or lower(o.orderNumber) like :searchPattern
             or lower(coalesce(o.customerEmail, '')) like :searchPattern
             or lower(coalesce(u.email, '')) like :searchPattern
             or lower(coalesce(o.recipientName, '')) like :searchPattern
             or lower(concat(coalesce(u.firstName, ''), ' ', coalesce(u.lastName, ''))) like :searchPattern)
        and (:deliveryMethod is null or o.deliveryMethod = :deliveryMethod)
        and (:status is null or o.status = :status)
        and (:paymentStatus is null or o.paymentStatus = :paymentStatus)
        and (:fulfillmentStatus is null or o.fulfillmentStatus = :fulfillmentStatus)
      """)
  Page<CustomerOrder> searchAdminOrders(
      @Param("searchPattern") String searchPattern,
      @Param("deliveryMethod") String deliveryMethod,
      @Param("status") String status,
      @Param("paymentStatus") String paymentStatus,
      @Param("fulfillmentStatus") String fulfillmentStatus,
      Pageable pageable);
}
