package com.product.exe.backend.controller;

import com.product.exe.backend.dto.request.LoginRequest;
import com.product.exe.backend.dto.request.RegisterRequest;
import com.product.exe.backend.dto.request.ResetPasswordRequest;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.dto.response.LoginResponse;
import com.product.exe.backend.dto.response.RegisterResponse;
import com.product.exe.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        RegisterResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/send-code")
    public ResponseEntity<ApiResponse<String>> sendCode(@RequestParam String email) {
        authService.sendVerificationCode(email);
        return ResponseEntity.ok(ApiResponse.success("Verification code sent to your email", "Success"));
    }

    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<String>> verifyCode(@RequestParam String email, @RequestParam String code) {
        authService.verifyCode(email, code);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", "Success"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success("Mã xác thực đã được gửi để đặt lại mật khẩu", "Success"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công", "Success"));
    }
}

