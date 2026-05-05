package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum ArticleStatus implements DbValueEnum {
    DRAFT("DRAFT", "Bản nháp"),
    PUBLISHED("PUBLISHED", "Đã xuất bản"),
    ARCHIVED("ARCHIVED", "Đã lưu trữ");

    private final String dbValue;
    private final String displayName;

    ArticleStatus(String dbValue, String displayName) {
        this.dbValue = dbValue;
        this.displayName = displayName;
    }
}
