package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum QuizStatus implements DbValueEnum {
    DRAFT("DRAFT", "Bản nháp"),
    PUBLISHED("PUBLISHED", "Đã xuất bản"),
    ARCHIVED("ARCHIVED", "Đã lưu trữ");

    private final String dbValue;
    private final String displayName;

    QuizStatus(String dbValue, String displayName) {
        this.dbValue = dbValue;
        this.displayName = displayName;
    }
}
