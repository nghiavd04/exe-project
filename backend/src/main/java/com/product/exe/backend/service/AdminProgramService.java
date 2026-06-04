package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.*;
import com.product.exe.backend.dto.response.AdminProgramMetadataResponse;
import com.product.exe.backend.entity.ProgramMetricMetadata;
import com.product.exe.backend.entity.ProgramPhaseMetadata;
import com.product.exe.backend.entity.ProgramTaskMetadata;

public interface AdminProgramService {
    AdminProgramMetadataResponse getProgramMetadata();
    
    ProgramPhaseMetadata createPhase(AdminPhaseCreateRequest request);
    void updatePhase(Integer phaseNumber, AdminPhaseUpdateRequest request);
    void deletePhase(Integer phaseNumber);
    
    void updateWeek(Integer weekNumber, AdminWeekUpdateRequest request);
    
    ProgramTaskMetadata createTask(AdminTaskRequest request);
    ProgramTaskMetadata updateTask(Long id, AdminTaskRequest request);
    void deleteTask(Long id);
    
    ProgramMetricMetadata createMetric(AdminMetricRequest request);
    ProgramMetricMetadata updateMetric(Long id, AdminMetricRequest request);
    void deleteMetric(Long id);
}
