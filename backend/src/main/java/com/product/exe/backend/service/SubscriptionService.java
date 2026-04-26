package com.product.exe.backend.service;

import com.product.exe.backend.enums.SubscriptionTier;

public interface SubscriptionService {
    boolean isUserPremium(Long userId);
    SubscriptionTier getUserHighestTier(Long userId);
}
