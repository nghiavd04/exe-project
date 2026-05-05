package com.product.exe.backend.controller.customer;

import com.product.exe.backend.dto.request.ChangeEmailRequest;
import com.product.exe.backend.dto.request.ChangePasswordRequest;
import com.product.exe.backend.dto.request.UpdateProfileRequest;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.dto.response.UserProfileResponse;
import com.product.exe.backend.service.CustomerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/profile")
@RequiredArgsConstructor
public class CustomerProfileController {

    private final CustomerProfileService profileService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profileService.getProfile(email)));
    }

    @PutMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profileService.updateProfile(email, request)));
    }

    @PatchMapping("/password")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        profileService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "Please login again with your new password"));
    }

    @PatchMapping("/email")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> changeEmail(
            Authentication authentication,
            @Valid @RequestBody ChangeEmailRequest request) {
        String currentEmail = authentication.getName();
        profileService.changeEmail(currentEmail, request.getNewEmail(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Email changed successfully", "Please login again with your new email"));
    }

    @PatchMapping("/avatar")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateAvatar(
            Authentication authentication,
            @RequestParam String avatarUrl,
            @RequestParam String publicId) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Avatar updated successfully", profileService.updateAvatar(email, avatarUrl, publicId)));
    }
}
