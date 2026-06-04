package com.product.exe.backend.entity;

import com.product.exe.backend.enums.MediaType;
import com.product.exe.backend.enums.SubscriptionTier;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "program_medias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private MediaType mediaType;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_tier", nullable = false)
    private SubscriptionTier targetTier;

    @Column(name = "media_url", columnDefinition = "TEXT")
    private String mediaUrl;

    @Column(name = "public_id", length = 255)
    private String publicId;

    @Column(name = "day_number")
    private Integer dayNumber;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
