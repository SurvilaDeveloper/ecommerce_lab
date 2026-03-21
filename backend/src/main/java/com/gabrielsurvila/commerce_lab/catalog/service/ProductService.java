//backend/src/main/java/com/gabrielsurvila/commerce_lab/catalog/service/ProductService.java
package com.gabrielsurvila.commerce_lab.catalog.service;

import com.gabrielsurvila.commerce_lab.catalog.dto.CreateProductRequest;
import com.gabrielsurvila.commerce_lab.catalog.dto.ProductResponse;
import com.gabrielsurvila.commerce_lab.catalog.dto.UpdateProductRequest;
import com.gabrielsurvila.commerce_lab.catalog.dto.ProductListStatsResponse;
import com.gabrielsurvila.commerce_lab.catalog.dto.ProductPageResponse;
import com.gabrielsurvila.commerce_lab.catalog.entity.Category;
import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import com.gabrielsurvila.commerce_lab.catalog.entity.ProductImage;
import com.gabrielsurvila.commerce_lab.catalog.repository.CategoryRepository;
import com.gabrielsurvila.commerce_lab.catalog.repository.ProductImageRepository;
import com.gabrielsurvila.commerce_lab.catalog.repository.ProductRepository;
//import com.gabrielsurvila.commerce_lab.common.dto.PageResponse;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
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

    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Product id must be greater than zero");
        }

        if (request == null) {
            throw new IllegalArgumentException("Update product request is required");
        }

        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

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

        if (!slug.equals(product.getSlug()) && productRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Product slug already exists");
        }

        if (!sku.equals(product.getSku()) && productRepository.existsBySku(sku)) {
            throw new IllegalArgumentException("Product SKU already exists");
        }

        if (compareAtPrice != null && compareAtPrice.compareTo(price) < 0) {
            throw new IllegalArgumentException("Compare at price must be greater than or equal to price");
        }

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

    public ProductPageResponse findAll(
            String search,
            Long categoryId,
            String status,
            String stock,
            Boolean featured,
            int page,
            int size,
            String sortField,
            String sortDirection) {

        int normalizedPage = Math.max(page, 0);
        int normalizedSize = normalizePageSize(size);

        Specification<Product> specification = buildSpecification(
                normalizeOptionalText(search),
                categoryId,
                normalizeOptionalText(status),
                normalizeOptionalText(stock),
                featured);

        Pageable pageable = PageRequest.of(
                normalizedPage,
                normalizedSize,
                buildSort(sortField, sortDirection));

        Page<ProductResponse> responsePage = productRepository.findAll(specification, pageable)
                .map(this::toResponse);

        ProductListStatsResponse stats = buildStats(specification);

        return ProductPageResponse.from(responsePage, stats);
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

    private Specification<Product> buildSpecification(
            String search,
            Long categoryId,
            String status,
            String stock,
            Boolean featured) {

        return (root, query, cb) -> {
            query.distinct(true);

            Join<Object, Object> categoryJoin = root.join("category", JoinType.INNER);
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String likeValue = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likeValue),
                        cb.like(cb.lower(root.get("sku")), likeValue),
                        cb.like(cb.lower(root.get("slug")), likeValue),
                        cb.like(cb.lower(categoryJoin.get("name")), likeValue),
                        cb.like(cb.lower(cb.coalesce(root.get("shortDescription"), "")), likeValue)));
            }

            if (categoryId != null) {
                if (categoryId <= 0) {
                    throw new IllegalArgumentException("Category id must be greater than zero");
                }

                predicates.add(cb.equal(categoryJoin.get("id"), categoryId));
            }

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                if ("ACTIVE".equalsIgnoreCase(status)) {
                    predicates.add(cb.isTrue(root.get("isActive")));
                } else if ("INACTIVE".equalsIgnoreCase(status)) {
                    predicates.add(cb.isFalse(root.get("isActive")));
                } else {
                    throw new IllegalArgumentException("Invalid status filter");
                }
            }

            if (stock != null && !stock.isBlank() && !"ALL".equalsIgnoreCase(stock)) {
                switch (stock.toUpperCase(Locale.ROOT)) {
                    case "IN_STOCK" -> predicates.add(cb.greaterThan(root.get("stock"), 0));
                    case "OUT_OF_STOCK" -> predicates.add(cb.lessThanOrEqualTo(root.get("stock"), 0));
                    case "LOW_STOCK" -> predicates.add(cb.and(
                            cb.greaterThan(root.get("stock"), 0),
                            cb.lessThanOrEqualTo(root.get("stock"), root.get("lowStockThreshold"))));
                    default -> throw new IllegalArgumentException("Invalid stock filter");
                }
            }

            if (featured != null && featured) {
                predicates.add(cb.isTrue(root.get("isFeatured")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private ProductListStatsResponse buildStats(Specification<Product> baseSpecification) {
        long totalCount = productRepository.count(baseSpecification);
        long activeCount = productRepository.count(baseSpecification.and(isActiveSpecification()));
        long lowStockCount = productRepository.count(baseSpecification.and(isLowStockSpecification()));
        long outOfStockCount = productRepository.count(baseSpecification.and(isOutOfStockSpecification()));

        return new ProductListStatsResponse(
                totalCount,
                activeCount,
                lowStockCount,
                outOfStockCount);
    }

    private Sort buildSort(String sortField, String sortDirection) {
        String normalizedField = sortField == null ? "NAME" : sortField.trim().toUpperCase(Locale.ROOT);
        String normalizedDirection = sortDirection == null ? "ASC" : sortDirection.trim().toUpperCase(Locale.ROOT);

        Sort.Direction direction = "DESC".equals(normalizedDirection)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        return switch (normalizedField) {
            case "NAME" -> Sort.by(direction, "name").and(Sort.by(Sort.Direction.ASC, "id"));
            case "PRICE" -> Sort.by(direction, "price").and(Sort.by(Sort.Direction.ASC, "id"));
            case "STOCK" -> Sort.by(direction, "stock").and(Sort.by(Sort.Direction.ASC, "id"));
            default -> throw new IllegalArgumentException("Invalid sort field");
        };
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return 10;
        }

        return Math.min(size, 100);
    }

    private ProductResponse toResponse(Product product) {
        ProductImage primaryImage = productImageRepository.findFirstByProductAndIsPrimaryTrue(product)
                .orElseGet(
                        () -> productImageRepository.findFirstByProductOrderBySortOrderAscIdAsc(product).orElse(null));

        String primaryImageUrl = primaryImage != null ? primaryImage.getImageUrl() : null;
        String primaryImageAltText = primaryImage != null ? primaryImage.getAltText() : null;

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
                primaryImageUrl,
                primaryImageAltText,
                product.getCreatedAt(),
                product.getUpdatedAt());
    }

    private Specification<Product> isActiveSpecification() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

    private Specification<Product> isLowStockSpecification() {
        return (root, query, cb) -> cb.and(
                cb.greaterThan(root.get("stock"), 0),
                cb.lessThanOrEqualTo(root.get("stock"), root.get("lowStockThreshold")));
    }

    private Specification<Product> isOutOfStockSpecification() {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("stock"), 0);
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