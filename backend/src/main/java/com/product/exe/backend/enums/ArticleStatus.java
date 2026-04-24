package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum ArticleStatus implements DbValueEnum {
    DRAFT("DRAFT"),
    PUBLISHED("PUBLISHED"),
    ARCHIVED("ARCHIVED");

    private final String dbValue;

    ArticleStatus(String dbValue) {
        this.dbValue = dbValue;
    }
}
