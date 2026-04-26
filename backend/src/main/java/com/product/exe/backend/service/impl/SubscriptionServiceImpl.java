package com.product.exe.backend.service.impl;

import com.product.exe.backend.entity.UserSubscription;
import com.product.exe.backend.enums.SubscriptionTier;
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
        SubscriptionTier tier = getUserHighestTier(userId);
        return tier.getWeight() > SubscriptionTier.FREE.getWeight();
    }

    @Override
    public SubscriptionTier getUserHighestTier(Long userId) {
        if (userId == null) {
            return SubscriptionTier.FREE;
        }
        return userSubscriptionRepository.findActiveSubscriptionByUserId(userId)
                .map(UserSubscription::getPlan)
                .map(plan -> plan.getTier())
                .orElse(SubscriptionTier.FREE);
    }
}
