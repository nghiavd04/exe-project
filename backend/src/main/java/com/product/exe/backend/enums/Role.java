package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum Role implements DbValueEnum {
    ADMIN("ADMIN", "Quản trị viên"),
    CUSTOMER("CUSTOMER", "Khách hàng");

    private final String dbValue;
    private final String displayName;

    Role(String dbValue, String displayName) {
        this.dbValue = dbValue;
        this.displayName = displayName;
    }
}
