package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.SubscriptionPlanRequest;
import com.product.exe.backend.dto.response.SubscriptionPlanResponse;
import com.product.exe.backend.entity.SubscriptionPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SubscriptionPlanService {
    Page<SubscriptionPlanResponse> getAllPlans(String search, Pageable pageable);
    SubscriptionPlan createPlan(SubscriptionPlanRequest request);
    SubscriptionPlan updatePlan(Long id, SubscriptionPlanRequest request);
    void deletePlan(Long id);
    void togglePlanStatus(Long id);
}
