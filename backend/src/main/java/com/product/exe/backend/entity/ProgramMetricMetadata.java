package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "program_metrics_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramMetricMetadata {

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

    @Column(name = "metric_name", nullable = false)
    private String metricName;
}
