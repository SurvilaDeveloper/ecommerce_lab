//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/security/AuthUserDetails.java
package com.gabrielsurvila.commerce_lab.auth.security;

import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class AuthUserDetails implements UserDetails {

    private final UserAccount user;

    public AuthUserDetails(UserAccount user) {
        this.user = user;
    }

    public UserAccount getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isEnabled() {
        return user.isActive();
    }
}
