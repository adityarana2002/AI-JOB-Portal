package com.portal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check controller for Phase 1 verification.
 * Will be removed or moved in later phases.
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of(
            "status", "UP",
            "application", "AI Resume Screening Portal",
            "phase", "Phase 6 - AI Integration Implemented"
        );
    }
}
