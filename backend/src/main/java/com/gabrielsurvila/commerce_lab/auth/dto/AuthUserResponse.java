//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/dto/AuthUserResponse.java
package com.gabrielsurvila.commerce_lab.auth.dto;

import com.gabrielsurvila.commerce_lab.user.dto.AuthProvider;
import com.gabrielsurvila.commerce_lab.user.dto.UserRole;

public class AuthUserResponse {

    private final Long id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final UserRole role;
    private final AuthProvider authProvider;
    private final String avatarUrl;

    public AuthUserResponse(
            Long id,
            String firstName,
            String lastName,
            String email,
            UserRole role,
            AuthProvider authProvider,
            String avatarUrl) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.authProvider = authProvider;
        this.avatarUrl = avatarUrl;
    }

    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public AuthProvider getAuthProvider() {
        return authProvider;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }
}
