package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum ArticleCategory implements DbValueEnum {
    HEALTH("HEALTH", "Sức khỏe"),
    PSYCHOLOGY("PSYCHOLOGY", "Tâm lý học"),
    LIFESTYLE("LIFESTYLE", "Lối sống"),
    EDUCATION("EDUCATION", "Giáo dục"),
    SCIENCE("SCIENCE", "Khoa học"),
    TECHNOLOGY("TECHNOLOGY", "Công nghệ");

    private final String dbValue;
    private final String displayName;

    ArticleCategory(String dbValue, String displayName) {
        this.dbValue = dbValue;
        this.displayName = displayName;
    }
}
