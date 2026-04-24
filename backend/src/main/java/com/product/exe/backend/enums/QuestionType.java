package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum QuestionType implements DbValueEnum {
    SINGLE_CHOICE("SINGLE_CHOICE"),
    MULTIPLE_CHOICE("MULTIPLE_CHOICE");

    private final String dbValue;

    QuestionType(String dbValue) {
        this.dbValue = dbValue;
    }
}
