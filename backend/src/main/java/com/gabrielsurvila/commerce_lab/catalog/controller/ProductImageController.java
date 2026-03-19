//backend/src/main/java/com/gabrielsurvila/commerce_lab/catalog/controller/ProductImageController.java
package com.gabrielsurvila.commerce_lab.catalog.controller;

import com.gabrielsurvila.commerce_lab.catalog.dto.ProductImageResponse;
import com.gabrielsurvila.commerce_lab.catalog.service.ProductImageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/images")
public class ProductImageController {

    private final ProductImageService productImageService;

    public ProductImageController(ProductImageService productImageService) {
        this.productImageService = productImageService;
    }

    @GetMapping
    public List<ProductImageResponse> findAll(@PathVariable Long productId) {
        return productImageService.findAllByProduct(productId);
    }
}
