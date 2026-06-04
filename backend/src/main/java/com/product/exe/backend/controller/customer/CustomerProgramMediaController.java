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

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer/program/medias")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerProgramMediaController {

    private final ProgramMediaService programMediaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerProgramMediaResponse>>> getAllForCustomer(Authentication authentication) {
        String email = authentication.getName();
        List<CustomerProgramMediaResponse> response = programMediaService.getAllForCustomer(email);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
