package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "program_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_program_progress_id", nullable = false)
    private UserProgramProgress userProgramProgress;

    @Column(name = "review_cycle_number", nullable = false)
    private Integer reviewCycleNumber;

    @Column(name = "suitability_rating", nullable = false)
    private Integer suitabilityRating;

    @Column(name = "completion_confidence", nullable = false)
    private Integer completionConfidence;

    @Column(name = "difficulty_level", nullable = false)
    private Integer difficultyLevel;

    @Column(name = "wants_to_switch", nullable = false)
    @Builder.Default
    private Boolean wantsToSwitch = false;

    @Column(name = "user_notes", columnDefinition = "TEXT")
    private String userNotes;

    @Column(name = "next_action", nullable = false, length = 50)
    private String nextAction; // KEEP, RETAKE_QUIZ, SWITCH_PROTOCOL

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
