//backend/src/main/java/com/gabrielsurvila/commerce_lab/catalog/dto/UpdateProductImageRequest.java
package com.gabrielsurvila.commerce_lab.catalog.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UpdateProductImageRequest {

    private String altText;
    private Integer sortOrder;

    @JsonProperty("isPrimary")
    private Boolean primary;

    public UpdateProductImageRequest() {
    }

    public String getAltText() {
        return altText;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public Boolean getPrimary() {
        return primary;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public void setPrimary(Boolean primary) {
        this.primary = primary;
    }
}
