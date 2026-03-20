//src/main/java/com/gabrielsurvila/commerce_lab/catalog/repository/ProductRepository.java
package com.gabrielsurvila.commerce_lab.catalog.repository;

import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySku(String sku);

    boolean existsBySlug(String slug);

    boolean existsBySku(String sku);

    long countByIsActiveTrue();

    long countByCategoryId(Long categoryId);

    @Query("""
            select count(p)
            from Product p
            where p.isActive = true
              and p.stock <= p.lowStockThreshold
            """)
    long countLowStockProducts();

    @Query("""
            select p
            from Product p
            join fetch p.category
            where p.isActive = true
              and p.stock <= p.lowStockThreshold
            order by p.stock asc, p.name asc
            """)
    List<Product> findLowStockProducts();

    @Query("""
            select p
            from Product p
            join fetch p.category
            order by p.name asc
            """)
    List<Product> findAllWithCategoryOrderByNameAsc();

    @Query("""
            select p
            from Product p
            join fetch p.category
            where p.id = :id
            """)
    Optional<Product> findByIdWithCategory(Long id);

    @Query("""
            select p
            from Product p
            join fetch p.category
            where p.slug = :slug
            """)
    Optional<Product> findBySlugWithCategory(String slug);

    @Query("""
            select p
            from Product p
            join fetch p.category
            where p.category.id = :categoryId
            order by p.name asc
            """)
    List<Product> findAllWithCategoryByCategoryIdOrderByNameAsc(Long categoryId);
}
