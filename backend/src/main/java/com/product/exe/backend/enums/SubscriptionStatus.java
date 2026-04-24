package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum SubscriptionStatus implements DbValueEnum {
    ACTIVE("ACTIVE"),
    EXPIRED("EXPIRED"),
    CANCELLED("CANCELLED");

    private final String dbValue;

    SubscriptionStatus(String dbValue) {
        this.dbValue = dbValue;
    }
}
