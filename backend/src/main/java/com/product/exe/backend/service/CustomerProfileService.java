package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.ChangePasswordRequest;
import com.product.exe.backend.dto.request.UpdateProfileRequest;
import com.product.exe.backend.dto.response.UserProfileResponse;

public interface CustomerProfileService {
    UserProfileResponse getProfile(String email);
    UserProfileResponse updateProfile(String currentEmail, UpdateProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);
    void changeEmail(String currentEmail, String newEmail, String code);
    UserProfileResponse updateAvatar(String email, String avatarUrl, String publicId);

}
