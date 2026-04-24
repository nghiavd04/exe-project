package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum QuizAttemptStatus implements DbValueEnum {
    IN_PROGRESS("IN_PROGRESS"),
    COMPLETED("COMPLETED"),
    EXPIRED("EXPIRED");

    private final String dbValue;

    QuizAttemptStatus(String dbValue) {
        this.dbValue = dbValue;
    }
}
