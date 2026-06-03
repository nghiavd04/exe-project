package com.product.exe.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ProgramProgressResponse {
    private Long id;
    private Integer currentDay;
    private Integer streakCount;
    private LocalDateTime startedAt;
    private LocalDateTime lastCheckedInAt;
    private String status;
    private Boolean isCheckedInToday;
}
