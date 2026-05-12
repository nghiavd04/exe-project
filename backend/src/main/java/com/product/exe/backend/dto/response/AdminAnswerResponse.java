package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAnswerResponse {
    private Long id;
    private String content;
    private String value;

    private Integer orderIndex;
}
