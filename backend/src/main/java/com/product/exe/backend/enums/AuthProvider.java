package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum AuthProvider implements DbValueEnum {
    LOCAL("LOCAL", "Hệ thống"),
    GOOGLE("GOOGLE", "Google");

    private final String dbValue;
    private final String displayName;

    AuthProvider(String dbValue, String displayName) {
        this.dbValue = dbValue;
        this.displayName = displayName;
    }
}
