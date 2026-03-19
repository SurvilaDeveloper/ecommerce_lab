//backend/src/main/java/com/gabrielsurvila/commerce_lab/admin/service/AdminDashboardService.java
package com.gabrielsurvila.commerce_lab.admin.service;

import com.gabrielsurvila.commerce_lab.admin.dto.AdminDashboardLowStockProductResponse;
import com.gabrielsurvila.commerce_lab.admin.dto.AdminDashboardMetricResponse;
import com.gabrielsurvila.commerce_lab.admin.dto.AdminDashboardRecentOrderResponse;
import com.gabrielsurvila.commerce_lab.admin.dto.AdminDashboardResponse;
import com.gabrielsurvila.commerce_lab.catalog.entity.Product;
import com.gabrielsurvila.commerce_lab.catalog.repository.ProductRepository;
import com.gabrielsurvila.commerce_lab.order.entity.CustomerOrder;
import com.gabrielsurvila.commerce_lab.order.repository.CustomerOrderRepository;
import com.gabrielsurvila.commerce_lab.user.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final ProductRepository productRepository;
    private final UserAccountRepository userAccountRepository;
    private final CustomerOrderRepository customerOrderRepository;

    public AdminDashboardService(
            ProductRepository productRepository,
            UserAccountRepository userAccountRepository,
            CustomerOrderRepository customerOrderRepository) {
        this.productRepository = productRepository;
        this.userAccountRepository = userAccountRepository;
        this.customerOrderRepository = customerOrderRepository;
    }

    public AdminDashboardResponse getDashboard() {
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByIsActiveTrue();
        long lowStockProductsCount = productRepository.countLowStockProducts();

        long totalUsers = userAccountRepository.count();
        long activeUsers = userAccountRepository.findAll().stream()
                .filter(user -> user.isActive())
                .count();

        long totalOrders = customerOrderRepository.count();
        long pendingOrders = customerOrderRepository.countByStatus("PENDING");
        long paidOrders = customerOrderRepository.countByPaymentStatus("PAID");

        BigDecimal paidRevenue = customerOrderRepository.sumPaidRevenue();

        List<AdminDashboardMetricResponse> metrics = List.of(
                new AdminDashboardMetricResponse("Productos", String.valueOf(totalProducts),
                        "Total cargado en catálogo."),
                new AdminDashboardMetricResponse("Productos activos", String.valueOf(activeProducts),
                        "Actualmente visibles para venta."),
                new AdminDashboardMetricResponse("Stock bajo", String.valueOf(lowStockProductsCount),
                        "Productos que requieren atención."),
                new AdminDashboardMetricResponse("Usuarios", String.valueOf(totalUsers), "Cuentas registradas."),
                new AdminDashboardMetricResponse("Usuarios activos", String.valueOf(activeUsers),
                        "Cuentas habilitadas."),
                new AdminDashboardMetricResponse("Órdenes", String.valueOf(totalOrders), "Compras registradas."),
                new AdminDashboardMetricResponse("Órdenes pendientes", String.valueOf(pendingOrders),
                        "Órdenes aún no procesadas."),
                new AdminDashboardMetricResponse("Órdenes pagadas", String.valueOf(paidOrders),
                        "Órdenes con pago confirmado."),
                new AdminDashboardMetricResponse("Ingresos cobrados", paidRevenue.toPlainString(),
                        "Suma de órdenes con estado PAID."));

        List<AdminDashboardRecentOrderResponse> recentOrders = customerOrderRepository
                .findAllWithUserOrderByCreatedAtDesc()
                .stream()
                .limit(5)
                .map(this::toRecentOrderResponse)
                .toList();

        List<AdminDashboardLowStockProductResponse> lowStockProducts = productRepository.findLowStockProducts()
                .stream()
                .limit(5)
                .map(this::toLowStockProductResponse)
                .toList();

        return new AdminDashboardResponse(metrics, recentOrders, lowStockProducts);
    }

    private AdminDashboardRecentOrderResponse toRecentOrderResponse(CustomerOrder order) {
        String customerName = order.getUser().getFirstName() + " " + order.getUser().getLastName();

        return new AdminDashboardRecentOrderResponse(
                order.getId(),
                order.getOrderNumber(),
                customerName,
                order.getUser().getEmail(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getFulfillmentStatus(),
                order.getCurrency(),
                order.getGrandTotal(),
                order.getPlacedAt());
    }

    private AdminDashboardLowStockProductResponse toLowStockProductResponse(Product product) {
        return new AdminDashboardLowStockProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getCategory().getName(),
                product.getStock(),
                product.getLowStockThreshold(),
                product.isActive());
    }
}
