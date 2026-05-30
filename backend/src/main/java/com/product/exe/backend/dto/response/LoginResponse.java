package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long expiresIn;
    private String email;
    private String role;
    private String fullName;
    private String avatarUrl;
    private String subscriptionTier;
}
