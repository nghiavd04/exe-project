package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.SubscriptionPlanRequest;
import com.product.exe.backend.dto.response.SubscriptionPlanResponse;
import com.product.exe.backend.entity.SubscriptionPlan;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.SubscriptionPlanRepository;
import com.product.exe.backend.repository.UserSubscriptionRepository;
import com.product.exe.backend.service.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    @Override
    public Page<SubscriptionPlanResponse> getAllPlans(String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return subscriptionPlanRepository.findAllByNameContainingIgnoreCase(search, pageable)
                    .map(this::mapToResponse);
        }
        return subscriptionPlanRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public SubscriptionPlan createPlan(SubscriptionPlanRequest request) {
        if (com.product.exe.backend.enums.SubscriptionTier.FREE.equals(request.getTier())) {
            throw new BadRequestException("Không thể tạo thêm gói mặc định (FREE).");
        }
        SubscriptionPlan plan = SubscriptionPlan.builder()
                .name(request.getName())
                .price(request.getPrice())
                .durationDays(request.getDurationDays())
                .tier(request.getTier())
                .description(request.getDescription())
                .features(request.getFeatures())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return subscriptionPlanRepository.save(plan);
    }

    @Override
    @Transactional
    public SubscriptionPlan updatePlan(Long id, SubscriptionPlanRequest request) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói dịch vụ"));
        
        if (Boolean.TRUE.equals(plan.getIsActive())) {
            throw new BadRequestException("Không thể chỉnh sửa gói đang ở trạng thái kích hoạt. Vui lòng ngừng kích hoạt trước.");
        }

        plan.setName(request.getName());
        plan.setPrice(request.getPrice());
        plan.setDurationDays(request.getDurationDays());
        plan.setTier(request.getTier());
        plan.setDescription(request.getDescription());
        plan.setFeatures(request.getFeatures());
        if (request.getIsActive() != null) {
            plan.setIsActive(request.getIsActive());
        }
        
        return subscriptionPlanRepository.save(plan);
    }

    @Override
    @Transactional
    public void deletePlan(Long id) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói dịch vụ"));
        
        if (com.product.exe.backend.enums.SubscriptionTier.FREE.equals(plan.getTier())) {
            throw new BadRequestException("Không thể xóa gói mặc định (FREE).");
        }

        if (Boolean.TRUE.equals(plan.getIsActive())) {
            throw new BadRequestException("Không thể xóa gói đang ở trạng thái kích hoạt. Vui lòng ngừng kích hoạt trước.");
        }
        
        subscriptionPlanRepository.delete(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> getActivePlans() {
        return subscriptionPlanRepository.findAllByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public void togglePlanStatus(Long id) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói dịch vụ"));
        boolean currentStatus = plan.getIsActive() != null ? plan.getIsActive() : false;
        plan.setIsActive(!currentStatus);
        subscriptionPlanRepository.save(plan);
    }

    private SubscriptionPlanResponse mapToResponse(SubscriptionPlan plan) {
        long subscriberCount = userSubscriptionRepository.countByPlanIdAndStatus(plan.getId(), com.product.exe.backend.enums.SubscriptionStatus.ACTIVE);
        
        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .price(plan.getPrice())
                .durationDays(plan.getDurationDays())
                .tier(plan.getTier())
                .tierDisplayName(plan.getTier() != null ? plan.getTier().getDisplayName() : null)
                .description(plan.getDescription())
                .features(plan.getFeatures())
                .isActive(plan.getIsActive())
                .subscriberCount(subscriberCount)
                .createdAt(plan.getCreatedAt())
                .build();
    }
}
