package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum PaymentMethod implements DbValueEnum {
    PAYOS("PAYOS", "PayOS");

    private final String dbValue;
    private final String displayName;

    PaymentMethod(String dbValue, String displayName) {
        this.dbValue = dbValue;
        this.displayName = displayName;
    }
}
