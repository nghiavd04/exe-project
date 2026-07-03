package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_attempt_id", nullable = false)
    private QuizAttempt quizAttempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "protocol_id", nullable = false)
    private Protocol protocol;

    @Column(name = "rank_order", nullable = false)
    private Integer rankOrder;

    @Column(name = "match_score", nullable = false)
    private Double matchScore;

    @Column(name = "confidence_level", nullable = false, length = 50)
    private String confidenceLevel; // HIGH, MEDIUM, LOW

    @Column(name = "reason_text", columnDefinition = "TEXT")
    private String reasonText;

    @Column(name = "dimension_snapshot_json", columnDefinition = "TEXT")
    private String dimensionSnapshotJson;

    @Column(name = "rule_version", nullable = false)
    @Builder.Default
    private Integer ruleVersion = 1;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, SUPERSEDED, EXPIRED

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
