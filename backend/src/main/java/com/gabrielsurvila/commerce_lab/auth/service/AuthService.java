//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/service/AuthService.java
package com.gabrielsurvila.commerce_lab.auth.service;

import com.gabrielsurvila.commerce_lab.auth.dto.AuthResponse;
import com.gabrielsurvila.commerce_lab.auth.dto.AuthUserResponse;
import com.gabrielsurvila.commerce_lab.auth.dto.LoginRequest;
import com.gabrielsurvila.commerce_lab.auth.dto.SignupRequest;
import com.gabrielsurvila.commerce_lab.user.dto.AuthProvider;
import com.gabrielsurvila.commerce_lab.user.dto.UserRole;
import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import com.gabrielsurvila.commerce_lab.user.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$",
            Pattern.CASE_INSENSITIVE);

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Signup request is required");
        }

        String firstName = normalizeRequiredText(request.getFirstName(), "First name is required");
        String lastName = normalizeRequiredText(request.getLastName(), "Last name is required");
        String email = normalizeEmail(request.getEmail());
        String password = normalizeRequiredText(request.getPassword(), "Password is required");

        validatePassword(password);

        if (userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        UserAccount user = new UserAccount();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(UserRole.CUSTOMER);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setActive(true);
        user.setEmailVerified(false);

        UserAccount saved = userAccountRepository.save(user);

        return new AuthResponse(toUserResponse(saved));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Login request is required");
        }

        String email = normalizeEmail(request.getEmail());
        String password = normalizeRequiredText(request.getPassword(), "Password is required");

        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isActive()) {
            throw new IllegalArgumentException("User account is inactive");
        }

        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new IllegalArgumentException("This account must sign in with its provider");
        }

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        user.setLastLoginAt(LocalDateTime.now());

        UserAccount saved = userAccountRepository.save(user);

        return new AuthResponse(toUserResponse(saved));
    }

    public AuthUserResponse getAuthenticatedUser(UserAccount user) {
        if (user == null) {
            throw new IllegalArgumentException("Authenticated user is required");
        }

        return toUserResponse(user);
    }

    public AuthUserResponse getAuthenticatedUserById(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Authenticated user id is invalid");
        }

        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));

        return toUserResponse(user);
    }

    private AuthUserResponse toUserResponse(UserAccount user) {
        return new AuthUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getAuthProvider(),
                user.getAvatarUrl());
    }

    private String normalizeRequiredText(String value, String errorMessage) {
        if (value == null) {
            throw new IllegalArgumentException(errorMessage);
        }

        String normalized = value.trim();

        if (normalized.isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }

        return normalized;
    }

    private String normalizeEmail(String value) {
        String email = normalizeRequiredText(value, "Email is required")
                .toLowerCase(Locale.ROOT);

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Email is invalid");
        }

        return email;
    }

    private void validatePassword(String password) {
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }

        if (password.length() > 72) {
            throw new IllegalArgumentException("Password is too long");
        }
    }
}
