//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/controller/AuthController.java
package com.gabrielsurvila.commerce_lab.auth.controller;

import com.gabrielsurvila.commerce_lab.auth.dto.*;
import com.gabrielsurvila.commerce_lab.auth.security.AuthUserDetails;
import com.gabrielsurvila.commerce_lab.auth.security.JwtService;
import com.gabrielsurvila.commerce_lab.auth.service.AuthService;
import com.gabrielsurvila.commerce_lab.auth.util.CookieUtils;
import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final CookieUtils cookieUtils;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            CookieUtils cookieUtils) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.cookieUtils = cookieUtils;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(
            @RequestBody SignupRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.signup(request);
        UserAccount user = buildUserForToken(authResponse.getUser());
        String token = jwtService.generateAccessToken(user);
        cookieUtils.addAccessTokenCookie(response, token);
        return authResponse;
    }

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        UserAccount user = buildUserForToken(authResponse.getUser());
        String token = jwtService.generateAccessToken(user);
        cookieUtils.addAccessTokenCookie(response, token);
        return authResponse;
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        cookieUtils.clearAccessTokenCookie(response);
    }

    @GetMapping("/me")
    public AuthResponse me(Authentication authentication) {
        AuthUserDetails authUserDetails = (AuthUserDetails) authentication.getPrincipal();
        AuthUserResponse user = authService.getAuthenticatedUserById(authUserDetails.getUser().getId());
        return new AuthResponse(user);
    }

    private UserAccount buildUserForToken(AuthUserResponse userResponse) {
        UserAccount user = new UserAccount();
        user.setEmail(userResponse.getEmail());
        user.setRole(userResponse.getRole());
        user.setAuthProvider(userResponse.getAuthProvider());

        try {
            java.lang.reflect.Field idField = UserAccount.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, userResponse.getId());
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to prepare JWT user data");
        }

        return user;
    }
}
