package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum PaymentTransactionType implements DbValueEnum {
    DEPOSIT("DEPOSIT"),
    PAYMENT("PAYMENT"),
    REFUND("REFUND"),
    ADJUSTMENT("ADJUSTMENT");

    private final String dbValue;

    PaymentTransactionType(String dbValue) {
        this.dbValue = dbValue;
    }
}
