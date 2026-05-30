package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum SubscriptionStatus implements DbValueEnum {
    PENDING("PENDING", "Đang chờ thanh toán"),
    ACTIVE("ACTIVE", "Đang hoạt động"),
    EXPIRED("EXPIRED", "Hết hạn"),
    CANCELLED("CANCELLED", "Đã hủy");

    private final String dbValue;
    private final String displayName;

    SubscriptionStatus(String dbValue, String displayName) {
        this.dbValue = dbValue;
        this.displayName = displayName;
    }
}
