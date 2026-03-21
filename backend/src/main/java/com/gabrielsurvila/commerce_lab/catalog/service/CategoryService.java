//backend/src/main/java/com/gabrielsurvila/commerce_lab/catalog/service/CategoryService.java
package com.gabrielsurvila.commerce_lab.catalog.service;

import com.gabrielsurvila.commerce_lab.catalog.dto.CategoryResponse;
import com.gabrielsurvila.commerce_lab.catalog.dto.CreateCategoryRequest;
import com.gabrielsurvila.commerce_lab.catalog.entity.Category;
import com.gabrielsurvila.commerce_lab.catalog.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Category request is required");
        }

        String name = normalizeRequiredText(request.getName(), "Category name is required");
        String rawSlug = normalizeRequiredText(request.getSlug(), "Category slug is required");
        String slug = normalizeSlug(rawSlug);
        String description = normalizeOptionalText(request.getDescription());

        if (slug.isBlank()) {
            throw new IllegalArgumentException("Category slug is invalid");
        }

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

        Category saved = categoryRepository.save(category);

        return toResponse(saved);
    }

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse findById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Category id must be greater than zero");
        }

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        return toResponse(category);
    }

    public CategoryResponse findBySlug(String slug) {
        String normalizedSlug = normalizeRequiredText(slug, "Category slug is required");
        normalizedSlug = normalizeSlug(normalizedSlug);

        if (normalizedSlug.isBlank()) {
            throw new IllegalArgumentException("Category slug is invalid");
        }

        Category category = categoryRepository.findBySlug(normalizedSlug)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        return toResponse(category);
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt());
    }

    private String normalizeRequiredText(String value, String errorMessage) {
        if (value == null) {
            throw new IllegalArgumentException(errorMessage);
        }

        String normalized = value.trim();

        if (normalized.isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }

        return normalized;
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private String normalizeSlug(String value) {
        String normalized = value.trim().toLowerCase(Locale.ROOT);

        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        normalized = normalized
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s_]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");

        return normalized;
    }
}
