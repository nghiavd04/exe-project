package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_weekly_logs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "week_number"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserWeeklyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "screen_time_avg_minutes")
    private Integer screenTimeAvgMinutes;

    @Column(name = "mood_avg_score")
    private Integer moodAvgScore;

    @Column(name = "deep_work_avg_minutes")
    private Integer deepWorkAvgMinutes;

    @Column(name = "output_count")
    private Integer outputCount;

    @Column(name = "social_media_avg_minutes")
    private Integer socialMediaAvgMinutes;

    @Column(name = "streak_count")
    private Integer streakCount;

    @Column(name = "relationship_satisfaction")
    private Integer relationshipSatisfaction;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
