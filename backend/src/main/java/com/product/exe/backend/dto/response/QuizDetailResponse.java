package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizDetailResponse {
    private Long id;
    private Long attemptId; // Optional, for when quiz is started
    private String title;
    private String description;
    private List<QuestionDto> questions;
}
