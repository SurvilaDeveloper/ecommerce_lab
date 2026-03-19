//backend/src/main/java/com/gabrielsurvila/commerce_lab/catalog/repository/ProductImageRepository.java
package com.gabrielsurvila.commerce_lab.catalog.repository;

import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import com.gabrielsurvila.commerce_lab.catalog.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductOrderBySortOrderAscIdAsc(Product product);

    Optional<ProductImage> findByIdAndProduct(Long id, Product product);

    boolean existsByProductAndIsPrimaryTrue(Product product);

    Optional<ProductImage> findFirstByProductAndIsPrimaryTrue(Product product);

    Optional<ProductImage> findFirstByProductOrderBySortOrderAscIdAsc(Product product);

    long countByProduct(Product product);
}
