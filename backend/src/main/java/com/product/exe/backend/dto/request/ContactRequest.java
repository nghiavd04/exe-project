package com.product.exe.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactRequest {
    @NotBlank(message = "Nội dung lời nhắn không được để trống")
    @Size(max = 2000, message = "Nội dung lời nhắn không quá 2000 ký tự")
    private String message;
}
