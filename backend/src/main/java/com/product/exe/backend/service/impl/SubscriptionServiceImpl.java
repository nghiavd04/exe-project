package com.product.exe.backend.service.impl;

import com.product.exe.backend.repository.UserSubscriptionRepository;
import com.product.exe.backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final UserSubscriptionRepository userSubscriptionRepository;

    @Override
    public boolean isUserPremium(Long userId) {
        if (userId == null) {
            return false;
        }
        return userSubscriptionRepository.findActiveSubscriptionByUserId(userId).isPresent();
    }
}
