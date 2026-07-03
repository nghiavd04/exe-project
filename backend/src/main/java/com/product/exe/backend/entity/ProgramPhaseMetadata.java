package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "program_phases", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"protocol_id", "phase_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramPhaseMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "protocol_id", nullable = false)
    private Protocol protocol;

    @Column(name = "phase_number", nullable = false)
    private Integer phaseNumber;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "range_text", nullable = false)
    private String rangeText;

    @Column(name = "icon", nullable = false, length = 50)
    private String icon;

    @Column(name = "focus", nullable = false, columnDefinition = "TEXT")
    private String focus;

    @Column(name = "science", nullable = false, columnDefinition = "TEXT")
    private String science;
}
