package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedisQuizAttempt implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long customerId;
    private Long quizId;
    private LocalDateTime startedAt;

    @Builder.Default
    private Map<Long, List<Long>> answers = new HashMap<>();
}
