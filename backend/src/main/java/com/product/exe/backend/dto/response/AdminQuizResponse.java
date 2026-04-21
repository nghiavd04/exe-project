package com.product.exe.backend.dto.response;

import com.product.exe.backend.enums.QuizStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminQuizResponse {
    private Long id;
    private String title;
    private QuizStatus status;
    private Long attemptCount;
    private LocalDateTime createdAt;
}
