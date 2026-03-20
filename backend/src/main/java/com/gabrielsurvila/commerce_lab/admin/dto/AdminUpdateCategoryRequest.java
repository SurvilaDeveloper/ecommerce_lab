//backend/src/main/java/com/gabrielsurvila/commerce_lab/admin/dto/AdminUpdateCategoryRequest.java
package com.gabrielsurvila.commerce_lab.admin.dto;

public class AdminUpdateCategoryRequest {

    private String name;
    private String slug;
    private String description;
    private Boolean isActive;

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescription() {
        return description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
