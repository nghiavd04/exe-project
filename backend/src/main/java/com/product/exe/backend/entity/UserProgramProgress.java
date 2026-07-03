package com.product.exe.backend.entity;

import com.product.exe.backend.enums.UserProgramStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_program_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgramProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "protocol_id")
    private Protocol protocol;

    @Column(name = "current_day", nullable = false)
    @Builder.Default
    private Integer currentDay = 1;

    @Column(name = "streak_count", nullable = false)
    @Builder.Default
    private Integer streakCount = 0;

    @Column(name = "cycle_number", nullable = false)
    @Builder.Default
    private Integer cycleNumber = 1;

    @CreationTimestamp
    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "completion_reason", length = 100)
    private String completionReason;

    @Column(name = "last_checked_in_at")
    private LocalDateTime lastCheckedInAt;

    @Column(name = "review_due_at")
    private LocalDateTime reviewDueAt;

    @Column(name = "switch_locked_until")
    private LocalDateTime switchLockedUntil;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private UserProgramStatus status = UserProgramStatus.ACTIVE;
}
