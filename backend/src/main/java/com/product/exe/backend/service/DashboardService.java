package com.product.exe.backend.service;

import com.product.exe.backend.dto.response.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse getStats(String period);
}
