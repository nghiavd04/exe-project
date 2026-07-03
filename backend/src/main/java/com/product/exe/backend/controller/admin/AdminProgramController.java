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

    @GetMapping("/{protocolId}/metadata")
    public ResponseEntity<ApiResponse<AdminProgramMetadataResponse>> getProgramMetadata(@PathVariable Long protocolId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông tin cấu trúc phác đồ thành công",
                adminProgramService.getProgramMetadata(protocolId)
        ));
    }

    @PostMapping("/{protocolId}/phases")
    public ResponseEntity<ApiResponse<ProgramPhaseMetadata>> createPhase(
            @PathVariable Long protocolId,
            @Valid @RequestBody AdminPhaseCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Tạo giai đoạn thành công",
                adminProgramService.createPhase(protocolId, request)
        ));
    }

    @DeleteMapping("/{protocolId}/phases/{phaseNumber}")
    public ResponseEntity<ApiResponse<Void>> deletePhase(
            @PathVariable Long protocolId,
            @PathVariable Integer phaseNumber) {
        adminProgramService.deletePhase(protocolId, phaseNumber);
        return ResponseEntity.ok(ApiResponse.success("Xóa giai đoạn thành công", null));
    }

    @PutMapping("/{protocolId}/phases/{phaseNumber}")
    public ResponseEntity<ApiResponse<Void>> updatePhase(
            @PathVariable Long protocolId,
            @PathVariable Integer phaseNumber,
            @Valid @RequestBody AdminPhaseUpdateRequest request) {
        adminProgramService.updatePhase(protocolId, phaseNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin giai đoạn thành công", null));
    }

    @PutMapping("/{protocolId}/weeks/{weekNumber}")
    public ResponseEntity<ApiResponse<Void>> updateWeek(
            @PathVariable Long protocolId,
            @PathVariable Integer weekNumber,
            @Valid @RequestBody AdminWeekUpdateRequest request) {
        adminProgramService.updateWeek(protocolId, weekNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mô tả tuần thành công", null));
    }

    @PostMapping("/{protocolId}/tasks")
    public ResponseEntity<ApiResponse<ProgramTaskMetadata>> createTask(
            @PathVariable Long protocolId,
            @Valid @RequestBody AdminTaskRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Thêm nhiệm vụ thành công",
                adminProgramService.createTask(protocolId, request)
        ));
    }

    @PutMapping("/{protocolId}/tasks/{id}")
    public ResponseEntity<ApiResponse<ProgramTaskMetadata>> updateTask(
            @PathVariable Long protocolId,
            @PathVariable Long id,
            @Valid @RequestBody AdminTaskRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật nhiệm vụ thành công",
                adminProgramService.updateTask(protocolId, id, request)
        ));
    }

    @DeleteMapping("/{protocolId}/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long protocolId,
            @PathVariable Long id) {
        adminProgramService.deleteTask(protocolId, id);
        return ResponseEntity.ok(ApiResponse.success("Xóa nhiệm vụ thành công", null));
    }

    @PostMapping("/{protocolId}/metrics")
    public ResponseEntity<ApiResponse<ProgramMetricMetadata>> createMetric(
            @PathVariable Long protocolId,
            @Valid @RequestBody AdminMetricRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Thêm chỉ số thành công",
                adminProgramService.createMetric(protocolId, request)
        ));
    }

    @PutMapping("/{protocolId}/metrics/{id}")
    public ResponseEntity<ApiResponse<ProgramMetricMetadata>> updateMetric(
            @PathVariable Long protocolId,
            @PathVariable Long id,
            @Valid @RequestBody AdminMetricRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật chỉ số thành công",
                adminProgramService.updateMetric(protocolId, id, request)
        ));
    }

    @DeleteMapping("/{protocolId}/metrics/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMetric(
            @PathVariable Long protocolId,
            @PathVariable Long id) {
        adminProgramService.deleteMetric(protocolId, id);
        return ResponseEntity.ok(ApiResponse.success("Xóa chỉ số thành công", null));
    }
}
