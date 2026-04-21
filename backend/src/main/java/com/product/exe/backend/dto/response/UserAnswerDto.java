package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAnswerDto {
    private Long questionId;
    private String questionContent;
    private Long selectedAnswerId;
    private String selectedAnswerContent;
    private Double numericValue;
    private String feedbackShown;
}
