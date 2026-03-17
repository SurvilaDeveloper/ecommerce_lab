//src/main/java/com/gabrielsurvila/commerce_lab/catalog/repository/CategoryRepository.java
package com.gabrielsurvila.commerce_lab.catalog.repository;

import com.gabrielsurvila.commerce_lab.catalog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    List<Category> findAllByOrderByNameAsc();
}