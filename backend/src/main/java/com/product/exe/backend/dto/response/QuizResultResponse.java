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
public class QuizResultResponse {
    private Long attemptId;
    private String overallAssessment;
    private String status;
    private Integer totalScore;
    private String assessmentResult;
    private List<RecommendedProtocolDto> recommendations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendedProtocolDto {
        private Long protocolId;
        private String code;
        private String name;
        private String description;
        private Integer durationDays;
        private Double matchScore;
        private String confidenceLevel;
        private String reasonText;
        private Integer rankOrder;
    }
}
