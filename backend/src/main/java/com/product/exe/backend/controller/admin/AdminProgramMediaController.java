package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.request.ProgramMediaRequest;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.entity.ProgramMedia;
import com.product.exe.backend.service.CloudinaryService;
import com.product.exe.backend.service.ProgramMediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.product.exe.backend.enums.MediaType;
import com.product.exe.backend.enums.SubscriptionTier;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/medias")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProgramMediaController {

    private final ProgramMediaService programMediaService;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProgramMedia>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) MediaType type,
            @RequestParam(required = false) SubscriptionTier tier,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        PageRequest pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(programMediaService.getAllForAdmin(search, type, tier, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProgramMedia>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(programMediaService.getByIdForAdmin(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProgramMedia>> create(@RequestBody ProgramMediaRequest request) {
        return ResponseEntity.ok(ApiResponse.success(programMediaService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProgramMedia>> update(@PathVariable Long id, @RequestBody ProgramMediaRequest request) {
        return ResponseEntity.ok(ApiResponse.success(programMediaService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        programMediaService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tài nguyên đa phương tiện thành công"));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMedia(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng chọn một file để upload."));
        }

        // Kiểm định MIME type: Chỉ cho phép file audio hoặc video
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("audio/") && !contentType.startsWith("video/"))) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Định dạng file không hợp lệ. Chỉ chấp nhận các file Audio (MP3, WAV...) hoặc Video (MP4, MOV...)."));
        }

        try {
            // Upload lên thư mục "program_medias" trên Cloudin
            Map<?, ?> result = cloudinaryService.upload(file, "program_medias");
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi upload file lên Cloudinary: " + e.getMessage()));
        }
    }
}
