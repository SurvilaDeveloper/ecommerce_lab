//backend/src/main/java/com/gabrielsurvila/commerce_lab/admin/controller/AdminDashboardController.java
package com.gabrielsurvila.commerce_lab.admin.controller;

import com.gabrielsurvila.commerce_lab.admin.dto.AdminDashboardResponse;
import com.gabrielsurvila.commerce_lab.admin.service.AdminDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping
    public AdminDashboardResponse getDashboard() {
        return adminDashboardService.getDashboard();
    }
}
