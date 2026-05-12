package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quiz_assessment_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAssessmentRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @ToString.Exclude
    private Quiz quiz;

    @Column(name = "min_score", nullable = false)
    private Integer minScore;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(name = "result_text", nullable = false, columnDefinition = "TEXT")
    private String resultText;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
