package com.product.exe.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String message;
    private Boolean isRead;
    private String replyMessage;
    private LocalDateTime repliedAt;
    private String repliedByName;
    private String notes;
    private LocalDateTime createdAt;
}
