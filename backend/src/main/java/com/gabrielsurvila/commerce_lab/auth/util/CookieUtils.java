//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/util/CookieUtils.java
package com.gabrielsurvila.commerce_lab.auth.util;

import com.gabrielsurvila.commerce_lab.auth.config.SecurityProperties;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtils {

    public static final String ACCESS_TOKEN_COOKIE_NAME = "access_token";

    private final SecurityProperties securityProperties;

    public CookieUtils(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    public void addAccessTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(securityProperties.getCookie().isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(securityProperties.getJwt().getAccessTokenExpirationSeconds())
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearAccessTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(securityProperties.getCookie().isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
