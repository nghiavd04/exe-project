package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum AuthProvider implements DbValueEnum {
    LOCAL("LOCAL"),
    GOOGLE("GOOGLE");

    private final String dbValue;

    AuthProvider(String dbValue) {
        this.dbValue = dbValue;
    }
}
