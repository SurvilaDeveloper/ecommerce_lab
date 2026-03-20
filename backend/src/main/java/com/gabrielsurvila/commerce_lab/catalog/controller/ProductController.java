//src/main/java/com/gabrielsurvila/commerce_lab/catalog/controller/ProductController.java
package com.gabrielsurvila.commerce_lab.catalog.controller;

import com.gabrielsurvila.commerce_lab.catalog.dto.CreateProductRequest;
import com.gabrielsurvila.commerce_lab.catalog.dto.ProductPageResponse;
import com.gabrielsurvila.commerce_lab.catalog.dto.ProductResponse;
import com.gabrielsurvila.commerce_lab.catalog.dto.UpdateProductRequest;
import com.gabrielsurvila.commerce_lab.catalog.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@RequestBody CreateProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @RequestBody UpdateProductRequest request) {
        return productService.update(id, request);
    }

    @GetMapping
    public ProductPageResponse findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String stock,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "NAME") String sortField,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        return productService.findAll(search, categoryId, status, stock, featured, page, size, sortField,
                sortDirection);
    }

    @GetMapping("/{id}")
    public ProductResponse findById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @GetMapping("/slug/{slug}")
    public ProductResponse findBySlug(@PathVariable String slug) {
        return productService.findBySlug(slug);
    }

    @GetMapping("/category/{categoryId}")
    public List<ProductResponse> findByCategoryId(@PathVariable Long categoryId) {
        return productService.findByCategoryId(categoryId);
    }
}