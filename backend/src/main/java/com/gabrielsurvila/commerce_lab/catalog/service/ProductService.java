//src/main/java/com/gabrielsurvila/commerce_lab/catalog/service/ProductService.java
package com.gabrielsurvila.commerce_lab.catalog.service;

import com.gabrielsurvila.commerce_lab.catalog.dto.CreateProductRequest;
import com.gabrielsurvila.commerce_lab.catalog.dto.ProductResponse;
import com.gabrielsurvila.commerce_lab.catalog.entity.Category;
import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import com.gabrielsurvila.commerce_lab.catalog.repository.CategoryRepository;
import com.gabrielsurvila.commerce_lab.catalog.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Product request is required");
        }

        Long categoryId = request.getCategoryId();
        if (categoryId == null || categoryId <= 0) {
            throw new IllegalArgumentException("Category id is required");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        String name = normalizeRequiredText(request.getName(), "Product name is required");
        String rawSlug = normalizeRequiredText(request.getSlug(), "Product slug is required");
        String slug = normalizeSlug(rawSlug);
        String sku = normalizeRequiredText(request.getSku(), "Product SKU is required").toUpperCase(Locale.ROOT);
        String shortDescription = normalizeOptionalText(request.getShortDescription());
        String description = normalizeOptionalText(request.getDescription());
        String currency = normalizeCurrency(request.getCurrency());

        BigDecimal price = requiredNonNegativeAmount(request.getPrice(), "Product price is required");
        BigDecimal compareAtPrice = optionalNonNegativeAmount(
                request.getCompareAtPrice(),
                "Compare at price must be greater than or equal to zero");
        BigDecimal costPrice = optionalNonNegativeAmount(
                request.getCostPrice(),
                "Cost price must be greater than or equal to zero");

        Integer stock = normalizeNonNegativeInteger(
                request.getStock(),
                0,
                "Stock must be greater than or equal to zero");

        Integer lowStockThreshold = normalizeNonNegativeInteger(
                request.getLowStockThreshold(),
                0,
                "Low stock threshold must be greater than or equal to zero");

        boolean isActive = request.getIsActive() == null || request.getIsActive();
        boolean isFeatured = request.getIsFeatured() != null && request.getIsFeatured();

        if (slug.isBlank()) {
            throw new IllegalArgumentException("Product slug is invalid");
        }

        if (productRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Product slug already exists");
        }

        if (productRepository.existsBySku(sku)) {
            throw new IllegalArgumentException("Product SKU already exists");
        }

        if (compareAtPrice != null && compareAtPrice.compareTo(price) < 0) {
            throw new IllegalArgumentException("Compare at price must be greater than or equal to price");
        }

        Product product = new Product();
        product.setCategory(category);
        product.setName(name);
        product.setSlug(slug);
        product.setSku(sku);
        product.setShortDescription(shortDescription);
        product.setDescription(description);
        product.setPrice(price);
        product.setCompareAtPrice(compareAtPrice);
        product.setCostPrice(costPrice);
        product.setCurrency(currency);
        product.setStock(stock);
        product.setLowStockThreshold(lowStockThreshold);
        product.setActive(isActive);
        product.setFeatured(isFeatured);

        Product saved = productRepository.save(product);

        return toResponse(saved);
    }

    public List<ProductResponse> findAll() {
        return productRepository.findAllWithCategoryOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse findById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Product id must be greater than zero");
        }

        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        return toResponse(product);
    }

    public ProductResponse findBySlug(String slug) {
        String normalizedSlug = normalizeRequiredText(slug, "Product slug is required");
        normalizedSlug = normalizeSlug(normalizedSlug);

        if (normalizedSlug.isBlank()) {
            throw new IllegalArgumentException("Product slug is invalid");
        }

        Product product = productRepository.findBySlugWithCategory(normalizedSlug)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        return toResponse(product);
    }

    public List<ProductResponse> findByCategoryId(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            throw new IllegalArgumentException("Category id must be greater than zero");
        }

        return productRepository.findAllWithCategoryByCategoryIdOrderByNameAsc(categoryId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getName(),
                product.getSlug(),
                product.getSku(),
                product.getShortDescription(),
                product.getDescription(),
                product.getPrice(),
                product.getCompareAtPrice(),
                product.getCostPrice(),
                product.getCurrency(),
                product.getStock(),
                product.getLowStockThreshold(),
                product.isActive(),
                product.isFeatured(),
                product.getCreatedAt(),
                product.getUpdatedAt());
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

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return "ARS";
        }

        String normalized = currency.trim().toUpperCase(Locale.ROOT);

        if (normalized.length() != 3) {
            throw new IllegalArgumentException("Currency must have exactly 3 characters");
        }

        return normalized;
    }

    private BigDecimal requiredNonNegativeAmount(BigDecimal value, String nullMessage) {
        if (value == null) {
            throw new IllegalArgumentException(nullMessage);
        }

        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount must be greater than or equal to zero");
        }

        return value;
    }

    private BigDecimal optionalNonNegativeAmount(BigDecimal value, String errorMessage) {
        if (value == null) {
            return null;
        }

        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(errorMessage);
        }

        return value;
    }

    private Integer normalizeNonNegativeInteger(Integer value, Integer defaultValue, String errorMessage) {
        if (value == null) {
            return defaultValue;
        }

        if (value < 0) {
            throw new IllegalArgumentException(errorMessage);
        }

        return value;
    }
}
