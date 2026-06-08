package com.product.exe.backend.service;

import com.product.exe.backend.dto.response.ScreenTimeUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ScreenTimeExtractionService {
    ScreenTimeUploadResponse extractScreenTime(MultipartFile file, String email);
}
