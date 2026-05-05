package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum PaymentStatus implements DbValueEnum {
    PENDING("PENDING", "Đang chờ"),
    SUCCESS("SUCCESS", "Thành công"),
    FAILED("FAILED", "Thất bại"),
    REFUNDED("REFUNDED", "Đã hoàn tiền");

    private final String dbValue;
    private final String displayName;

    PaymentStatus(String dbValue, String displayName) {
        this.dbValue = dbValue;
        this.displayName = displayName;
    }
}
