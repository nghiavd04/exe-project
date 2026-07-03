package com.product.exe.backend.dto.request;

import lombok.Data;

@Data
public class ProtocolRequest {
    private String code;
    private String name;
    private String description;
    private String selectionPolicy;
    private String minTierRequired;
    private Integer durationDays;
    private String weightsJson;
}
