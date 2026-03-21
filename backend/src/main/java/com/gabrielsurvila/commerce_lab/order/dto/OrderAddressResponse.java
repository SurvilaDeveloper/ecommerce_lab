// backend/src/main/java/com/gabrielsurvila/commerce_lab/order/dto/OrderAddressResponse.java
package com.gabrielsurvila.commerce_lab.order.dto;

public class OrderAddressResponse {

    private final Long id;
    private final String recipientName;
    private final String line1;
    private final String line2;
    private final String city;
    private final String state;
    private final String postalCode;
    private final String countryCode;

    public OrderAddressResponse(
            Long id,
            String recipientName,
            String line1,
            String line2,
            String city,
            String state,
            String postalCode,
            String countryCode) {
        this.id = id;
        this.recipientName = recipientName;
        this.line1 = line1;
        this.line2 = line2;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.countryCode = countryCode;
    }

    public Long getId() {
        return id;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getLine1() {
        return line1;
    }

    public String getLine2() {
        return line2;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public String getCountryCode() {
        return countryCode;
    }
}
