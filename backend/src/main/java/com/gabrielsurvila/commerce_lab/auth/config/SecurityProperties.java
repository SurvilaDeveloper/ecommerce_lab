//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/config/SecurityProperties.java
package com.gabrielsurvila.commerce_lab.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

    private final Jwt jwt = new Jwt();
    private final Cookie cookie = new Cookie();
    private String allowedOrigin;

    public Jwt getJwt() {
        return jwt;
    }

    public Cookie getCookie() {
        return cookie;
    }

    public String getAllowedOrigin() {
        return allowedOrigin;
    }

    public void setAllowedOrigin(String allowedOrigin) {
        this.allowedOrigin = allowedOrigin;
    }

    public static class Jwt {
        private String secret;
        private long accessTokenExpirationSeconds;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getAccessTokenExpirationSeconds() {
            return accessTokenExpirationSeconds;
        }

        public void setAccessTokenExpirationSeconds(long accessTokenExpirationSeconds) {
            this.accessTokenExpirationSeconds = accessTokenExpirationSeconds;
        }
    }

    public static class Cookie {
        private boolean secure;

        public boolean isSecure() {
            return secure;
        }

        public void setSecure(boolean secure) {
            this.secure = secure;
        }
    }
}
