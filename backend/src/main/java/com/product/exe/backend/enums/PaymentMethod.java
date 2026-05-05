package com.product.exe.backend.enums;

import lombok.Getter;

@Getter
public enum PaymentMethod implements DbValueEnum {
    VNPAY("VNPAY", "VNPay"),
    MOMO("MOMO", "MoMo"),
    ZALOPAY("ZALOPAY", "ZaloPay"),
    BANK_TRANSFER("BANK_TRANSFER", "Chuyển khoản ngân hàng");

    private final String dbValue;
    private final String displayName;

    PaymentMethod(String dbValue, String displayName) {
        this.dbValue = dbValue;
        this.displayName = displayName;
    }
}
