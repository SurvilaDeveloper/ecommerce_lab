//backend/src/main/java/com/gabrielsurvila/commerce_lab/catalog/service/ProductImageService.java
package com.gabrielsurvila.commerce_lab.catalog.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.gabrielsurvila.commerce_lab.catalog.dto.ProductImageResponse;
import com.gabrielsurvila.commerce_lab.catalog.dto.UpdateProductImageRequest;
import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import com.gabrielsurvila.commerce_lab.catalog.entity.ProductImage;
import com.gabrielsurvila.commerce_lab.catalog.repository.ProductImageRepository;
import com.gabrielsurvila.commerce_lab.catalog.repository.ProductRepository;
import com.gabrielsurvila.commerce_lab.config.CloudinaryProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final Cloudinary cloudinary;
    private final CloudinaryProperties cloudinaryProperties;

    public ProductImageService(
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            Cloudinary cloudinary,
            CloudinaryProperties cloudinaryProperties) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.cloudinary = cloudinary;
        this.cloudinaryProperties = cloudinaryProperties;
    }

    @Transactional
    public ProductImageResponse upload(Long productId, MultipartFile file, String altText, Boolean isPrimary) {
        Product product = findProduct(productId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        String normalizedAltText = normalizeOptionalText(altText);
        boolean makePrimary = shouldBePrimary(product, isPrimary);
        int nextSortOrder = (int) productImageRepository.countByProduct(product);

        Map uploadResult;
        try {
            String folder = buildProductFolder(product.getId());

            uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "unique_filename", true,
                            "overwrite", false));
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to upload image to Cloudinary");
        }

        if (makePrimary) {
            clearPrimaryImage(product);
        }

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(String.valueOf(uploadResult.get("secure_url")));
        image.setPublicId(String.valueOf(uploadResult.get("public_id")));
        image.setAltText(normalizedAltText);
        image.setSortOrder(nextSortOrder);
        image.setPrimary(makePrimary);
        image.setWidth(asInteger(uploadResult.get("width")));
        image.setHeight(asInteger(uploadResult.get("height")));

        ProductImage saved = productImageRepository.save(image);

        return toResponse(saved);
    }

    public List<ProductImageResponse> findAllByProduct(Long productId) {
        Product product = findProduct(productId);

        return productImageRepository.findByProductOrderBySortOrderAscIdAsc(product)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProductImageResponse update(Long productId, Long imageId, UpdateProductImageRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Update image request is required");
        }

        Product product = findProduct(productId);
        ProductImage image = productImageRepository.findByIdAndProduct(imageId, product)
                .orElseThrow(() -> new IllegalArgumentException("Product image not found"));

        if (request.getAltText() != null) {
            image.setAltText(normalizeOptionalText(request.getAltText()));
        }

        if (request.getSortOrder() != null) {
            if (request.getSortOrder() < 0) {
                throw new IllegalArgumentException("Sort order must be zero or greater");
            }
            image.setSortOrder(request.getSortOrder());
        }

        if (Boolean.TRUE.equals(request.getPrimary())) {
            clearPrimaryImage(product);
            image.setPrimary(true);
        } else if (Boolean.FALSE.equals(request.getPrimary())) {
            image.setPrimary(false);
            ensureAnyPrimary(product, image);
        }

        ProductImage saved = productImageRepository.save(image);

        return toResponse(saved);
    }

    @Transactional
    public void delete(Long productId, Long imageId) {
        Product product = findProduct(productId);
        ProductImage image = productImageRepository.findByIdAndProduct(imageId, product)
                .orElseThrow(() -> new IllegalArgumentException("Product image not found"));

        try {
            cloudinary.uploader().destroy(image.getPublicId(), ObjectUtils.asMap(
                    "resource_type", "image"));
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to delete image from Cloudinary");
        }

        boolean wasPrimary = image.isPrimary();

        productImageRepository.delete(image);

        if (wasPrimary) {
            List<ProductImage> remaining = productImageRepository.findByProductOrderBySortOrderAscIdAsc(product);
            if (!remaining.isEmpty()) {
                ProductImage first = remaining.get(0);
                first.setPrimary(true);
                productImageRepository.save(first);
            }
        }
    }

    private Product findProduct(Long productId) {
        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException("Product id must be greater than zero");
        }

        return productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    private ProductImageResponse toResponse(ProductImage image) {
        return new ProductImageResponse(
                image.getId(),
                image.getProduct().getId(),
                image.getImageUrl(),
                image.getPublicId(),
                image.getAltText(),
                image.getSortOrder(),
                image.isPrimary(),
                image.getWidth(),
                image.getHeight(),
                image.getCreatedAt());
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private boolean shouldBePrimary(Product product, Boolean isPrimary) {
        if (Boolean.TRUE.equals(isPrimary)) {
            return true;
        }

        return !productImageRepository.existsByProductAndIsPrimaryTrue(product);
    }

    private void clearPrimaryImage(Product product) {
        productImageRepository.findFirstByProductAndIsPrimaryTrue(product)
                .ifPresent(existing -> {
                    existing.setPrimary(false);
                    productImageRepository.save(existing);
                });
    }

    private void ensureAnyPrimary(Product product, ProductImage currentImage) {
        if (productImageRepository.existsByProductAndIsPrimaryTrue(product)) {
            return;
        }

        List<ProductImage> images = productImageRepository.findByProductOrderBySortOrderAscIdAsc(product);
        for (ProductImage image : images) {
            if (!image.getId().equals(currentImage.getId())) {
                image.setPrimary(true);
                productImageRepository.save(image);
                return;
            }
        }
    }

    private String buildProductFolder(Long productId) {
        return cloudinaryProperties.getBaseFolder() + "/products/" + productId;
    }

    private Integer asInteger(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Integer integerValue) {
            return integerValue;
        }

        if (value instanceof Number numberValue) {
            return numberValue.intValue();
        }

        return Integer.valueOf(String.valueOf(value));
    }
}
