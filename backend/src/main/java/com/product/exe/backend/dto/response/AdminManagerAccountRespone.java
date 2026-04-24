package com.product.exe.backend.dto.response;

import com.product.exe.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminManagerAccountRespone {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private String avatarUrl;
    private Boolean isActive;
    private String subscriptionPlan;
}
