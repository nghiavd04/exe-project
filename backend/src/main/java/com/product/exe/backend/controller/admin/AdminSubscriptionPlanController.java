package com.product.exe.backend.controller.admin;

import com.product.exe.backend.dto.request.SubscriptionPlanRequest;
import com.product.exe.backend.dto.response.ApiResponse;
import com.product.exe.backend.dto.response.SubscriptionPlanResponse;
import com.product.exe.backend.entity.SubscriptionPlan;
import com.product.exe.backend.service.SubscriptionPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/subscription-plans")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SubscriptionPlanResponse>>> getAllPlans(
            @RequestParam(required = false) String search,
            @org.springframework.data.web.PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(subscriptionPlanService.getAllPlans(search, pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionPlan>> createPlan(@Valid @RequestBody SubscriptionPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.success(subscriptionPlanService.createPlan(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPlan>> updatePlan(@PathVariable Long id, @Valid @RequestBody SubscriptionPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.success(subscriptionPlanService.updatePlan(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        subscriptionPlanService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> togglePlanStatus(@PathVariable Long id) {
        subscriptionPlanService.togglePlanStatus(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
