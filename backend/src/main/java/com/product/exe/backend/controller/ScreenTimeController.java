package com.product.exe.backend.controller;

import com.product.exe.backend.dto.response.ScreenTimeUploadResponse;
import com.product.exe.backend.service.ScreenTimeExtractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/screen-time")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class ScreenTimeController {

    private final ScreenTimeExtractionService screenTimeExtractionService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ScreenTimeUploadResponse> uploadScreenTime(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        log.info("Received screen time upload request for user: {}", authentication.getName());
        ScreenTimeUploadResponse response = screenTimeExtractionService.extractScreenTime(file, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
