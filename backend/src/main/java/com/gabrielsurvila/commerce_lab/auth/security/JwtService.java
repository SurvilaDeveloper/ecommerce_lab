//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/security/JwtService.java
package com.gabrielsurvila.commerce_lab.auth.security;

import com.gabrielsurvila.commerce_lab.auth.config.SecurityProperties;
import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecurityProperties securityProperties;
    private final SecretKey secretKey;

    public JwtService(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
        this.secretKey = Keys.hmacShaKeyFor(
                securityProperties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserAccount user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(securityProperties.getJwt().getAccessTokenExpirationSeconds());

        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("provider", user.getAuthProvider().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    public Long extractUserId(String token) {
        Claims claims = extractClaims(token);
        return Long.valueOf(claims.getSubject());
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
