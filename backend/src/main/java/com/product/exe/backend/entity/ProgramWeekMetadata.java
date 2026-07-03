package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "program_weeks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"protocol_id", "week_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramWeekMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "protocol_id", nullable = false)
    private Protocol protocol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id", nullable = false)
    private ProgramPhaseMetadata phase;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "range_text", nullable = false)
    private String rangeText;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
