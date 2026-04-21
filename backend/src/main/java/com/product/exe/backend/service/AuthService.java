package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.LoginRequest;
import com.product.exe.backend.dto.request.RegisterRequest;
import com.product.exe.backend.dto.response.LoginResponse;
import com.product.exe.backend.dto.response.RegisterResponse;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest);
    RegisterResponse register(RegisterRequest registerRequest);
}
