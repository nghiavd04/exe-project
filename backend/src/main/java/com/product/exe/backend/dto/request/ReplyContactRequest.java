package com.product.exe.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyContactRequest {
    @NotBlank(message = "Nội dung phản hồi không được để trống")
    private String replyMessage;

    private String notes;
}
