package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "protocol_selections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProtocolSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id")
    private QuizRecommendation recommendation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_protocol_id", nullable = false)
    private Protocol selectedProtocol;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING_PAYMENT"; // PENDING_PAYMENT, PAID, CANCELLED, EXPIRED

    @Column(name = "selected_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime selectedAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
