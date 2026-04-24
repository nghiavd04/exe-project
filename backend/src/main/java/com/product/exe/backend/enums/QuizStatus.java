package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum QuizStatus implements DbValueEnum {
    DRAFT("DRAFT"),
    PUBLISHED("PUBLISHED"),
    ARCHIVED("ARCHIVED");

    private final String dbValue;

    QuizStatus(String dbValue) {
        this.dbValue = dbValue;
    }
}
