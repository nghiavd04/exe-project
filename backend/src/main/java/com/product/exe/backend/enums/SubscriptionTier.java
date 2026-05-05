package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum SubscriptionTier {
    FREE(0, "Miễn phí"),
    VIP(1, "Thành viên VIP"),
    PREMIUM(2, "Thành viên Premium");

    private final int weight;
    private final String displayName;

    SubscriptionTier(int weight, String displayName) {
        this.weight = weight;
        this.displayName = displayName;
    }
}
