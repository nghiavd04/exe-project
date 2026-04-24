package com.product.exe.backend.dto.request;

import com.product.exe.backend.enums.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionCreateRequest {
    @NotBlank(message = "Question content is required")
    private String content;

    @NotNull(message = "Question type is required")
    private QuestionType type;

    @NotNull(message = "Order index is required")
    private Integer orderIndex;

    @NotEmpty(message = "Question must have at least one answer")
    private List<AnswerCreateRequest> answers;
}
