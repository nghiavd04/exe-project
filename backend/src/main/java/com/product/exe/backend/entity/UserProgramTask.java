package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_program_tasks",
    uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "day_number", "week_number", "task_index"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgramTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "day_number")
    private Integer dayNumber; // Can be null for weekly tasks

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "task_index", nullable = false)
    private Integer taskIndex;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
