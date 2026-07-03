package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "program_days", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"protocol_id", "day_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramDayMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "protocol_id", nullable = false)
    private Protocol protocol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "week_id", nullable = false)
    private ProgramWeekMetadata week;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "label", nullable = false)
    private String label;
}
