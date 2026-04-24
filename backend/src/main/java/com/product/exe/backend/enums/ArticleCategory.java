package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum ArticleCategory implements DbValueEnum {
    HEALTH("HEALTH"),
    PSYCHOLOGY("PSYCHOLOGY"),
    LIFESTYLE("LIFESTYLE"),
    EDUCATION("EDUCATION"),
    SCIENCE("SCIENCE");

    private final String dbValue;

    ArticleCategory(String dbValue) {
        this.dbValue = dbValue;
    }
}
