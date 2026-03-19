//backend/src/main/java/com/gabrielsurvila/commerce_lab/catalog/controller/AdminProductImageController.java
package com.gabrielsurvila.commerce_lab.catalog.controller;

import com.gabrielsurvila.commerce_lab.catalog.dto.ProductImageResponse;
import com.gabrielsurvila.commerce_lab.catalog.dto.UpdateProductImageRequest;
import com.gabrielsurvila.commerce_lab.catalog.service.ProductImageService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products/{productId}/images")
public class AdminProductImageController {

    private final ProductImageService productImageService;

    public AdminProductImageController(ProductImageService productImageService) {
        this.productImageService = productImageService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductImageResponse upload(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary) {
        return productImageService.upload(productId, file, altText, isPrimary);
    }

    @GetMapping
    public List<ProductImageResponse> findAll(@PathVariable Long productId) {
        return productImageService.findAllByProduct(productId);
    }

    @PatchMapping("/{imageId}")
    public ProductImageResponse update(
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @RequestBody UpdateProductImageRequest request) {
        return productImageService.update(productId, imageId, request);
    }

    @DeleteMapping("/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        productImageService.delete(productId, imageId);
    }
}