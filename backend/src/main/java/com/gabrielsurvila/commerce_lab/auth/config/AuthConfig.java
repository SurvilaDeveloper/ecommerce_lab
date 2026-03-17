//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/config/AuthConfig.java
package com.gabrielsurvila.commerce_lab.auth.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(SecurityProperties.class)
public class AuthConfig {
}
