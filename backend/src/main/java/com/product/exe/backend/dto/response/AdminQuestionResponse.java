package com.product.exe.backend.dto.response;

import com.product.exe.backend.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminQuestionResponse {
    private Long id;
    private String content;
    private QuestionType type;
    private Integer orderIndex;
    private List<AdminAnswerResponse> answers;
}
