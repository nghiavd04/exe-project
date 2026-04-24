package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum Role implements DbValueEnum {
    ADMIN("ADMIN"),
    CUSTOMER("CUSTOMER");

    private final String dbValue;

    Role(String dbValue) {
        this.dbValue = dbValue;
    }
}
