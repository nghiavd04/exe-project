package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum PaymentMethod implements DbValueEnum {
    VNPAY("VNPAY"),
    MOMO("MOMO"),
    ZALOPAY("ZALOPAY"),
    BANK_TRANSFER("BANK_TRANSFER");

    private final String dbValue;

    PaymentMethod(String dbValue) {
        this.dbValue = dbValue;
    }
}
