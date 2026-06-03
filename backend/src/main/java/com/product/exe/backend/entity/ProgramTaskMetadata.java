package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "program_tasks_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramTaskMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_number", nullable = false)
    private ProgramPhaseMetadata phase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "week_number", nullable = false)
    private ProgramWeekMetadata week;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_number")
    private ProgramDayMetadata day;

    @Column(name = "task_index", nullable = false)
    private Integer taskIndex;

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "sub_text", columnDefinition = "TEXT")
    private String subText;

    @Column(name = "badge", length = 50)
    private String badge;
}
