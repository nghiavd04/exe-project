package com.product.exe.backend.repository;

import com.product.exe.backend.entity.SubscriptionPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    List<SubscriptionPlan> findAllByIsActiveTrue();
    Page<SubscriptionPlan> findAllByNameContainingIgnoreCase(String name, Pageable pageable);
}
