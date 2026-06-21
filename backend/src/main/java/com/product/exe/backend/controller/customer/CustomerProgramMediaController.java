package com.product.exe.backend.controller.customer;

import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.dto.response.CustomerProgramMediaResponse;
import com.product.exe.backend.service.ProgramMediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.RequestParam;
import com.product.exe.backend.enums.MediaType;

@RestController
@RequestMapping("/api/v1/customer/program/medias")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerProgramMediaController {

    private final ProgramMediaService programMediaService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomerProgramMediaResponse>>> getAllForCustomer(
            Authentication authentication,
            @RequestParam(required = false) MediaType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        String email = authentication.getName();
        PageRequest pageable = PageRequest.of(page, size);
        Page<CustomerProgramMediaResponse> response = programMediaService.getAllForCustomer(email, type, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
