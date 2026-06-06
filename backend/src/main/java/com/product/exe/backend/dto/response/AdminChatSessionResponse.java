package com.product.exe.backend.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.product.exe.backend.enums.ChatSessionType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminChatSessionResponse {
    private Long id;
    private String title;
    private UserSummary user;
    private ChatSessionType sessionType;
    private UserSummary assignedTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummary {
        private Long id;
        private String email;
    }
}
