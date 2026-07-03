package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum UserProgramStatus {
    ACTIVE("ACTIVE"),
    COMPLETED("COMPLETED"),
    PAUSED("PAUSED"),
    SWITCHED("SWITCHED"),
    CANCELLED("CANCELLED");

    private final String dbValue;

    UserProgramStatus(String dbValue) {
        this.dbValue = dbValue;
    }
}
