package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.request.*;
import com.product.exe.backend.dto.response.AdminProgramMetadataResponse;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.entity.ProgramMetricMetadata;
import com.product.exe.backend.entity.ProgramPhaseMetadata;
import com.product.exe.backend.entity.ProgramTaskMetadata;
import com.product.exe.backend.service.AdminProgramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/program")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProgramController {

    private final AdminProgramService adminProgramService;

    @GetMapping("/metadata")
    public ResponseEntity<ApiResponse<AdminProgramMetadataResponse>> getProgramMetadata() {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông tin cấu trúc phác đồ thành công",
                adminProgramService.getProgramMetadata()
        ));
    }

    @PostMapping("/phases")
    public ResponseEntity<ApiResponse<ProgramPhaseMetadata>> createPhase(
            @Valid @RequestBody AdminPhaseCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Tạo giai đoạn thành công",
                adminProgramService.createPhase(request)
        ));
    }

    @DeleteMapping("/phases/{phaseNumber}")
    public ResponseEntity<ApiResponse<Void>> deletePhase(@PathVariable Integer phaseNumber) {
        adminProgramService.deletePhase(phaseNumber);
        return ResponseEntity.ok(ApiResponse.success("Xóa giai đoạn thành công", null));
    }

    @PutMapping("/phases/{phaseNumber}")
    public ResponseEntity<ApiResponse<Void>> updatePhase(
            @PathVariable Integer phaseNumber,
            @Valid @RequestBody AdminPhaseUpdateRequest request) {
        adminProgramService.updatePhase(phaseNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin giai đoạn thành công", null));
    }

    @PutMapping("/weeks/{weekNumber}")
    public ResponseEntity<ApiResponse<Void>> updateWeek(
            @PathVariable Integer weekNumber,
            @Valid @RequestBody AdminWeekUpdateRequest request) {
        adminProgramService.updateWeek(weekNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mô tả tuần thành công", null));
    }

    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<ProgramTaskMetadata>> createTask(
            @Valid @RequestBody AdminTaskRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Thêm nhiệm vụ thành công",
                adminProgramService.createTask(request)
        ));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<ProgramTaskMetadata>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody AdminTaskRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật nhiệm vụ thành công",
                adminProgramService.updateTask(id, request)
        ));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        adminProgramService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa nhiệm vụ thành công", null));
    }

    @PostMapping("/metrics")
    public ResponseEntity<ApiResponse<ProgramMetricMetadata>> createMetric(
            @Valid @RequestBody AdminMetricRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Thêm chỉ số thành công",
                adminProgramService.createMetric(request)
        ));
    }

    @PutMapping("/metrics/{id}")
    public ResponseEntity<ApiResponse<ProgramMetricMetadata>> updateMetric(
            @PathVariable Long id,
            @Valid @RequestBody AdminMetricRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật chỉ số thành công",
                adminProgramService.updateMetric(id, request)
        ));
    }

    @DeleteMapping("/metrics/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMetric(@PathVariable Long id) {
        adminProgramService.deleteMetric(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa chỉ số thành công", null));
    }
}
