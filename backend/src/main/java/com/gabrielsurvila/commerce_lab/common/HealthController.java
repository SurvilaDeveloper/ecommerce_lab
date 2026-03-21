//backend/src/main/java/com/gabrielsurvila/commerce_lab/common/dto/HealthController
package com.gabrielsurvila.commerce_lab.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public String health() {
        return "OK";
    }
}
