package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_daily_logs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "day_number"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDailyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "screen_time_minutes")
    private Integer screenTimeMinutes;

    @Column(name = "unconscious_open_count")
    private Integer unconsciousOpenCount;

    @Column(name = "urge_level")
    private Integer urgeLevel;

    @Column(name = "sleep_hours", precision = 4, scale = 2)
    private BigDecimal sleepHours;

    @Column(name = "mood_score")
    private Integer moodScore;

    @Column(name = "sleep_score")
    private Integer sleepScore;

    @Column(name = "urge_score")
    private Integer urgeScore;

    @Column(name = "focus_score")
    private Integer focusScore;

    @Column(name = "journal_text", columnDefinition = "TEXT")
    private String journalText;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
