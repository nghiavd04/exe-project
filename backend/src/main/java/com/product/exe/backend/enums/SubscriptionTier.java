package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum SubscriptionTier {
    FREE(0, "Miễn phí"),
    BASIC(1, "Thành viên Basic"),
    PREMIUM(2, "Thành viên Premium"),
    ELITE(3, "Thành viên Elite");

    private final int weight;
    private final String displayName;

    SubscriptionTier(int weight, String displayName) {
        this.weight = weight;
        this.displayName = displayName;
    }
}
