package com.product.exe.backend.dto.response;

import com.product.exe.backend.enums.MediaType;
import com.product.exe.backend.enums.SubscriptionTier;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CustomerProgramMediaResponse {
    private Long id;
    private String title;
    private String description;
    private MediaType mediaType;
    private SubscriptionTier targetTier;
    private String mediaUrl; // Sẽ là null nếu bị locked = true
    private Integer dayNumber;
    private boolean locked;
    private LocalDateTime createdAt;
}
