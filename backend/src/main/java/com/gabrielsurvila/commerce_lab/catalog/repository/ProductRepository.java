//src/main/java/com/gabrielsurvila/commerce_lab/catalog/repository/ProductRepository.java
package com.gabrielsurvila.commerce_lab.catalog.repository;

import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySku(String sku);

    boolean existsBySlug(String slug);

    boolean existsBySku(String sku);

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
