package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.AdminCreateRequest;
import com.product.exe.backend.dto.response.AdminManagerAccountRespone;
import com.product.exe.backend.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminManagerAccountService {
    Page<AdminManagerAccountRespone> getAllUsers(String search, Role role, Boolean isActive, Pageable pageable);
    void toggleUserStatus(Long userId);
    void createAdmin(AdminCreateRequest request);
}
