package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.request.ProtocolRequest;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.entity.Protocol;
import com.product.exe.backend.service.ProtocolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/protocols")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProtocolController {

    private final ProtocolService protocolService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Protocol>>> getAllProtocols() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phác đồ thành công", protocolService.getAllProtocols()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Protocol>> getProtocolById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết phác đồ thành công", protocolService.getProtocolById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Protocol>> createProtocol(@Valid @RequestBody ProtocolRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tạo phác đồ thành công", protocolService.createProtocol(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Protocol>> updateProtocol(
            @PathVariable Long id,
            @Valid @RequestBody ProtocolRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phác đồ thành công", protocolService.updateProtocol(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProtocol(@PathVariable Long id) {
        protocolService.deleteProtocol(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phác đồ thành công", null));
    }
}
