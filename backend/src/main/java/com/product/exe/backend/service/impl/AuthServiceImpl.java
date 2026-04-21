package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.LoginRequest;
import com.product.exe.backend.dto.request.RegisterRequest;
import com.product.exe.backend.dto.response.LoginResponse;
import com.product.exe.backend.dto.response.RegisterResponse;
import com.product.exe.backend.entity.Customer;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.AuthProvider;
import com.product.exe.backend.enums.Role;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.repository.CustomerRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.security.JwtTokenProvider;
import com.product.exe.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String jwt = tokenProvider.generateToken(user);
        String fullName = user.getCustomer() != null ? user.getCustomer().getFullName() : user.getEmail();

        return LoginResponse.builder()
                .token(jwt)
                .expiresIn((long) jwtExpirationMs)
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(fullName)
                .build();
    }

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email already exists!");
        }

        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .provider(AuthProvider.LOCAL)
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();
        User savedUser = userRepository.save(user);

        Customer customer = Customer.builder()
                .user(savedUser)
                .fullName(registerRequest.getFullName())
                .isActive(true)
                .build();
        customerRepository.save(customer);

        return RegisterResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .fullName(registerRequest.getFullName())
                .message("Registration successful! Please login to continue.")
                .build();
    }
}
