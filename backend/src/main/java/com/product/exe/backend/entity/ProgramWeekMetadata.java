package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "program_weeks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramWeekMetadata {

    @Id
    @Column(name = "week_number")
    private Integer weekNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_number", nullable = false)
    private ProgramPhaseMetadata phase;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "range_text", nullable = false)
    private String rangeText;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
