package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "protocols")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Protocol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false, length = 100)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "selection_policy", nullable = false, length = 50)
    @Builder.Default
    private String selectionPolicy = "USER_SELECT"; // AUTO_ONLY, USER_SELECT, CLINICIAN_REVIEW

    @Column(name = "min_tier_required", nullable = false, length = 50)
    @Builder.Default
    private String minTierRequired = "BASIC"; // BASIC, PREMIUM, ELITE

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "weights_json", columnDefinition = "TEXT")
    private String weightsJson;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
