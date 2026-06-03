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

    @Column(name = "current_day", nullable = false)
    @Builder.Default
    private Integer currentDay = 1;

    @Column(name = "streak_count", nullable = false)
    @Builder.Default
    private Integer streakCount = 0;

    @CreationTimestamp
    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "last_checked_in_at")
    private LocalDateTime lastCheckedInAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private UserProgramStatus status = UserProgramStatus.ACTIVE;
}
