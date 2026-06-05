package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.request.AdminCreateRequest;
import com.product.exe.backend.dto.response.AdminManagerAccountRespone;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.dto.response.AdminUserProgressDetailsResponse;
import com.product.exe.backend.enums.Role;
import com.product.exe.backend.service.AdminManagerAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminManagerAccountController {

    private final AdminManagerAccountService adminManagerAccountService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminManagerAccountRespone>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                adminManagerAccountService.getAllUsers(search, role, isActive, pageable)));
    }

    @GetMapping("/{id}/progress-details")
    public ResponseEntity<ApiResponse<AdminUserProgressDetailsResponse>> getUserProgressDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                adminManagerAccountService.getUserProgressDetails(id)));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(@PathVariable Long id) {
        adminManagerAccountService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái người dùng thành công"));
    }

    @PostMapping("/admins")
    public ResponseEntity<ApiResponse<String>> createAdmin(@Valid @RequestBody AdminCreateRequest request) {
        adminManagerAccountService.createAdmin(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản quản trị viên thành công"));
    }
}
