// backend/src/main/java/com/gabrielsurvila/commerce_lab/admin/service/AdminCategoryService.java
package com.gabrielsurvila.commerce_lab.admin.service;

import com.gabrielsurvila.commerce_lab.admin.dto.*;
import com.gabrielsurvila.commerce_lab.catalog.entity.Category;
import com.gabrielsurvila.commerce_lab.catalog.repository.CategoryRepository;
import com.gabrielsurvila.commerce_lab.catalog.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public AdminCategoryService(
            CategoryRepository categoryRepository,
            ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public List<AdminCategoryResponse> findAll() {
        return categoryRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminCategoryResponse create(AdminCreateCategoryRequest request) {
        String name = normalizeRequiredText(request.getName(), "Category name is required");
        String slug = normalizeSlug(normalizeRequiredText(request.getSlug(), "Category slug is required"));
        String description = normalizeOptionalText(request.getDescription());

        if (categoryRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Category slug already exists");
        }

        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Category name already exists");
        }

        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(description);
        category.setActive(true);

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public AdminCategoryResponse update(Long id, AdminUpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (request.getName() != null) {
            String name = normalizeRequiredText(request.getName(), "Category name is required");
            category.setName(name);
        }

        if (request.getSlug() != null) {
            String slug = normalizeSlug(request.getSlug());
            if (!slug.equals(category.getSlug()) && categoryRepository.existsBySlug(slug)) {
                throw new IllegalArgumentException("Category slug already exists");
            }
            category.setSlug(slug);
        }

        if (request.getDescription() != null) {
            category.setDescription(normalizeOptionalText(request.getDescription()));
        }

        if (request.getIsActive() != null) {
            category.setActive(request.getIsActive());
        }

        return toResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        long productCount = productRepository.countByCategoryId(id);

        if (productCount > 0) {
            throw new IllegalStateException("Cannot delete category with associated products");
        }

        categoryRepository.delete(category);
    }

    private AdminCategoryResponse toResponse(Category category) {
        long productCount = productRepository.countByCategoryId(category.getId());

        return new AdminCategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.isActive(),
                productCount,
                category.getCreatedAt(),
                category.getUpdatedAt());
    }

    // ===== helpers (copiados de tu service original) =====

    private String normalizeRequiredText(String value, String errorMessage) {
        if (value == null || value.trim().isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }
        return value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null)
            return null;
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private String normalizeSlug(String value) {
        String normalized = value.trim().toLowerCase(Locale.ROOT);

        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return normalized
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s_]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
    }
}