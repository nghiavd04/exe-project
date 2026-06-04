package com.product.exe.backend.dto.request;

import com.product.exe.backend.enums.MediaType;
import com.product.exe.backend.enums.SubscriptionTier;
import lombok.Data;

@Data
public class ProgramMediaRequest {
    private String title;
    private String description;
    private MediaType mediaType;
    private SubscriptionTier targetTier;
    private String mediaUrl;
    private String publicId;
    private Integer dayNumber;
}
