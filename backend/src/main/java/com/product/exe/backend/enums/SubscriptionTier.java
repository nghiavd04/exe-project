package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum SubscriptionTier {
    FREE(0, "Free"),
    VIP(1, "VIP"),
    PREMIUM(2, "Premium");

    private final int weight;
    private final String displayName;

    SubscriptionTier(int weight, String displayName) {
        this.weight = weight;
        this.displayName = displayName;
    }
}
