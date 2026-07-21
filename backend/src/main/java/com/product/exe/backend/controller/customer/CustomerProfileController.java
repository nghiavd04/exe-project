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
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin cá nhân thành công", profileService.getProfile(email)));
    }

    @PutMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin cá nhân thành công", profileService.updateProfile(email, request)));
    }

    @PatchMapping("/password")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        profileService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", "Vui lòng đăng nhập lại bằng mật khẩu mới của bạn"));
    }

    @PatchMapping("/email")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> changeEmail(
            Authentication authentication,
            @Valid @RequestBody ChangeEmailRequest request) {
        String currentEmail = authentication.getName();
        profileService.changeEmail(currentEmail, request.getNewEmail(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Thay đổi email thành công", "Vui lòng đăng nhập lại bằng email mới của bạn"));
    }

    @PatchMapping("/avatar")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateAvatar(
            Authentication authentication,
            @RequestParam String avatarUrl,
            @RequestParam String publicId) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ảnh đại diện thành công", profileService.updateAvatar(email, avatarUrl, publicId)));
    }
}
