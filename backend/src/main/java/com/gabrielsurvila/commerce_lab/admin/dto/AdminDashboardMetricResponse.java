//backend/src/main/java/com/gabrielsurvila/commerce_lab/admin/dto/AdminDashboardMetricResponse.java
package com.gabrielsurvila.commerce_lab.admin.dto;

public class AdminDashboardMetricResponse {

    private final String label;
    private final String value;
    private final String description;

    public AdminDashboardMetricResponse(String label, String value, String description) {
        this.label = label;
        this.value = value;
        this.description = description;
    }

    public String getLabel() {
        return label;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }
}
