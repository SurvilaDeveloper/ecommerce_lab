//src/main/java/com/gabrielsurvila/commerce_lab/catalog/dto/CreateCategoryRequest.java
package com.gabrielsurvila.commerce_lab.catalog.dto;

public class CreateCategoryRequest {

    private String name;
    private String slug;
    private String description;

    public CreateCategoryRequest() {
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescription() {
        return description;
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
}
