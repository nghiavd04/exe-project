package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.*;
import com.product.exe.backend.dto.response.AdminProgramMetadataResponse;
import com.product.exe.backend.entity.ProgramMetricMetadata;
import com.product.exe.backend.entity.ProgramPhaseMetadata;
import com.product.exe.backend.entity.ProgramTaskMetadata;

public interface AdminProgramService {
    AdminProgramMetadataResponse getProgramMetadata(Long protocolId);
    
    ProgramPhaseMetadata createPhase(Long protocolId, AdminPhaseCreateRequest request);
    void updatePhase(Long protocolId, Integer phaseNumber, AdminPhaseUpdateRequest request);
    void deletePhase(Long protocolId, Integer phaseNumber);
    
    void updateWeek(Long protocolId, Integer weekNumber, AdminWeekUpdateRequest request);
    
    ProgramTaskMetadata createTask(Long protocolId, AdminTaskRequest request);
    ProgramTaskMetadata updateTask(Long protocolId, Long id, AdminTaskRequest request);
    void deleteTask(Long protocolId, Long id);
    
    ProgramMetricMetadata createMetric(Long protocolId, AdminMetricRequest request);
    ProgramMetricMetadata updateMetric(Long protocolId, Long id, AdminMetricRequest request);
    void deleteMetric(Long protocolId, Long id);
}
