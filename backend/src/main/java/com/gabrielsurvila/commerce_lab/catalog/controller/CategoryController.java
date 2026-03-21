//backend/src/main/java/com/gabrielsurvila/commerce_lab/catalog/controller/CategoryController.java
package com.gabrielsurvila.commerce_lab.catalog.controller;

import com.gabrielsurvila.commerce_lab.catalog.dto.CategoryResponse;
import com.gabrielsurvila.commerce_lab.catalog.dto.CreateCategoryRequest;
import com.gabrielsurvila.commerce_lab.catalog.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@RequestBody CreateCategoryRequest request) {
        return categoryService.create(request);
    }

    @GetMapping
    public List<CategoryResponse> findAll() {
        return categoryService.findAll();
    }

    @GetMapping("/{id}")
    public CategoryResponse findById(@PathVariable Long id) {
        return categoryService.findById(id);
    }

    @GetMapping("/slug/{slug}")
    public CategoryResponse findBySlug(@PathVariable String slug) {
        return categoryService.findBySlug(slug);
    }
}