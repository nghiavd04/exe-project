package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum PaymentStatus implements DbValueEnum {
    PENDING("PENDING"),
    SUCCESS("SUCCESS"),
    FAILED("FAILED"),
    REFUNDED("REFUNDED");

    private final String dbValue;

    PaymentStatus(String dbValue) {
        this.dbValue = dbValue;
    }
}
