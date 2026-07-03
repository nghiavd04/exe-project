package com.product.exe.backend.dto.request;

import lombok.Data;

@Data
public class ProgramReviewRequest {
    private Integer suitabilityRating;
    private Integer completionConfidence;
    private Integer difficultyLevel;
    private Boolean wantsToSwitch;
    private String userNotes;
    private String nextAction; // KEEP, RETAKE_QUIZ, SWITCH_PROTOCOL
    private Long switchProtocolId; // Optional, if nextAction is SWITCH_PROTOCOL
}
