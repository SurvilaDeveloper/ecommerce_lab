// backend/src/main/java/com/gabrielsurvila/commerce_lab/admin/controller/AdminCategoryController.java
package com.gabrielsurvila.commerce_lab.admin.controller;

import com.gabrielsurvila.commerce_lab.admin.dto.*;
import com.gabrielsurvila.commerce_lab.admin.service.AdminCategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    public AdminCategoryController(AdminCategoryService adminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    @GetMapping
    public List<AdminCategoryResponse> findAll() {
        return adminCategoryService.findAll();
    }

    @PostMapping
    public AdminCategoryResponse create(@RequestBody AdminCreateCategoryRequest request) {
        return adminCategoryService.create(request);
    }

    @PutMapping("/{id}")
    public AdminCategoryResponse update(
            @PathVariable Long id,
            @RequestBody AdminUpdateCategoryRequest request) {
        return adminCategoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        adminCategoryService.delete(id);
    }
}