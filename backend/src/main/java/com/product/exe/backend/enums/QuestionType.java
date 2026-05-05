package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum QuestionType implements DbValueEnum {
    SINGLE_CHOICE("SINGLE_CHOICE", "Một lựa chọn"),
    MULTIPLE_CHOICE("MULTIPLE_CHOICE", "Nhiều lựa chọn");

    private final String dbValue;
    private final String displayName;

    QuestionType(String dbValue, String displayName) {
        this.dbValue = dbValue;
        this.displayName = displayName;
    }
}
