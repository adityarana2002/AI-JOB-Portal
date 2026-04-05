package com.portal.ai.controller;

import com.portal.ai.dto.AiTestRequest;
import com.portal.ai.dto.AiTestResponse;
import com.portal.ai.service.AiScreeningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiScreeningService aiScreeningService;

    @PostMapping("/test")
    public ResponseEntity<AiTestResponse> test(@Valid @RequestBody AiTestRequest request) {
        return ResponseEntity.ok(aiScreeningService.runTest(request));
    }
}
