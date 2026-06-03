package com.product.exe.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "program_days")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramDayMetadata {

    @Id
    @Column(name = "day_number")
    private Integer dayNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "week_number", nullable = false)
    private ProgramWeekMetadata week;

    @Column(name = "label", nullable = false)
    private String label;
}
