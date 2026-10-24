package com.docurisk.backend.controller;

import com.docurisk.backend.service.AiIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final AiIntegrationService aiIntegrationService;

    @Autowired
    public HealthController(AiIntegrationService aiIntegrationService) {
        this.aiIntegrationService = aiIntegrationService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "DocuRisk Spring Boot Backend");
        status.put("timestamp", LocalDateTime.now());
        status.put("aiServiceConnected", aiIntegrationService.isAiServiceHealthy());
        return ResponseEntity.ok(status);
    }
}
