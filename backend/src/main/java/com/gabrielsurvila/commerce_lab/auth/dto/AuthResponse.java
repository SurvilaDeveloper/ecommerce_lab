//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/dto/AuthResponse.java
package com.gabrielsurvila.commerce_lab.auth.dto;

public class AuthResponse {

    private final AuthUserResponse user;

    public AuthResponse(AuthUserResponse user) {
        this.user = user;
    }

    public AuthUserResponse getUser() {
        return user;
    }
}
