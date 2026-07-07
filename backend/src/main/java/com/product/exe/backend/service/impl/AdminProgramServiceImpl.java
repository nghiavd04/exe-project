package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.*;
import com.product.exe.backend.dto.response.AdminProgramMetadataResponse;
import com.product.exe.backend.entity.*;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.*;
import com.product.exe.backend.service.AdminProgramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminProgramServiceImpl implements AdminProgramService {

    private final ProgramPhaseMetadataRepository phaseMetadataRepository;
    private final ProgramWeekMetadataRepository weekMetadataRepository;
    private final ProgramDayMetadataRepository dayMetadataRepository;
    private final ProgramTaskMetadataRepository taskMetadataRepository;
    private final ProgramMetricMetadataRepository metricMetadataRepository;
    private final ProtocolRepository protocolRepository;

    @Override
    public AdminProgramMetadataResponse getProgramMetadata(Long protocolId) {
        List<ProgramPhaseMetadata> phases = phaseMetadataRepository.findByProtocolIdOrderByPhaseNumberAsc(protocolId);
        List<AdminProgramMetadataResponse.PhaseDto> phaseDtos = new ArrayList<>();

        for (ProgramPhaseMetadata phase : phases) {
            List<ProgramWeekMetadata> weeks = weekMetadataRepository.findByProtocolIdAndPhasePhaseNumberOrderByWeekNumberAsc(protocolId, phase.getPhaseNumber());
            List<AdminProgramMetadataResponse.WeekDto> weekDtos = new ArrayList<>();

            for (ProgramWeekMetadata week : weeks) {
                List<AdminProgramMetadataResponse.DayDto> dayDtos = new ArrayList<>();

                List<AdminProgramMetadataResponse.TaskDto> wTasks = taskMetadataRepository.findByWeekIdAndDayIsNullOrderByTaskIndexAsc(week.getId()).stream()
                        .map(t -> AdminProgramMetadataResponse.TaskDto.builder()
                                .id(t.getId())
                                .taskIndex(t.getTaskIndex())
                                .title(t.getTitle())
                                .subText(t.getSubText())
                                .badge(t.getBadge())
                                .build())
                        .collect(Collectors.toList());

                List<AdminProgramMetadataResponse.MetricDto> wMetrics = metricMetadataRepository.findByWeekIdAndDayIsNull(week.getId()).stream()
                        .map(m -> AdminProgramMetadataResponse.MetricDto.builder()
                                .id(m.getId())
                                .metricName(m.getMetricName())
                                .build())
                        .collect(Collectors.toList());

                List<ProgramDayMetadata> days = dayMetadataRepository.findByWeekIdOrderByDayNumberAsc(week.getId());
                if (!days.isEmpty()) {
                    for (ProgramDayMetadata day : days) {
                        List<AdminProgramMetadataResponse.TaskDto> dTasks = taskMetadataRepository.findByDayIdOrderByTaskIndexAsc(day.getId()).stream()
                                .map(t -> AdminProgramMetadataResponse.TaskDto.builder()
                                        .id(t.getId())
                                        .taskIndex(t.getTaskIndex())
                                        .title(t.getTitle())
                                        .subText(t.getSubText())
                                        .badge(t.getBadge())
                                        .build())
                                .collect(Collectors.toList());
                        if (dTasks.isEmpty()) {
                            dTasks = taskMetadataRepository.findByWeekIdAndDayIsNullOrderByTaskIndexAsc(week.getId()).stream()
                                    .map(t -> AdminProgramMetadataResponse.TaskDto.builder()
                                            .id(t.getId())
                                            .taskIndex(t.getTaskIndex())
                                            .title(t.getTitle())
                                            .subText(t.getSubText())
                                            .badge(t.getBadge() != null ? t.getBadge() : "Hàng tuần")
                                            .build())
                                    .collect(Collectors.toList());
                        }

                        List<AdminProgramMetadataResponse.MetricDto> dMetrics = metricMetadataRepository.findByDayId(day.getId()).stream()
                                .map(m -> AdminProgramMetadataResponse.MetricDto.builder()
                                        .id(m.getId())
                                        .metricName(m.getMetricName())
                                        .build())
                                .collect(Collectors.toList());
                        if (dMetrics.isEmpty()) {
                            dMetrics = metricMetadataRepository.findByWeekIdAndDayIsNull(week.getId()).stream()
                                    .map(m -> AdminProgramMetadataResponse.MetricDto.builder()
                                            .id(m.getId())
                                            .metricName(m.getMetricName())
                                            .build())
                                    .collect(Collectors.toList());
                        }

                        dayDtos.add(AdminProgramMetadataResponse.DayDto.builder()
                                .num(day.getDayNumber())
                                .label(day.getLabel())
                                .tasks(dTasks)
                                .metrics(dMetrics)
                                .build());
                    }
                }

                weekDtos.add(AdminProgramMetadataResponse.WeekDto.builder()
                                .num(week.getWeekNumber())
                                .label(week.getLabel())
                                .range(week.getRangeText())
                                .description(week.getDescription())
                                .days(dayDtos)
                                .tasks(wTasks)
                                .metrics(wMetrics)
                                .build());
            }

            phaseDtos.add(AdminProgramMetadataResponse.PhaseDto.builder()
                    .num(phase.getPhaseNumber())
                    .label(phase.getLabel())
                    .range(phase.getRangeText())
                    .icon(phase.getIcon())
                    .focus(phase.getFocus())
                    .science(phase.getScience())
                    .weeks(weekDtos)
                    .build());
        }

        return AdminProgramMetadataResponse.builder().phases(phaseDtos).build();
    }

    @Override
    @Transactional
    public ProgramPhaseMetadata createPhase(Long protocolId, AdminPhaseCreateRequest request) {
        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phác đồ với ID: " + protocolId));

        if (phaseMetadataRepository.findByProtocolIdAndPhaseNumber(protocolId, request.getPhaseNumber()).isPresent()) {
            throw new BadRequestException("Giai đoạn số " + request.getPhaseNumber() + " đã tồn tại cho phác đồ này");
        }

        ProgramPhaseMetadata phase = ProgramPhaseMetadata.builder()
                .protocol(protocol)
                .phaseNumber(request.getPhaseNumber())
                .label(request.getLabel())
                .rangeText(request.getRangeText())
                .icon(request.getIcon())
                .focus(request.getFocus())
                .science(request.getScience())
                .build();
        return phaseMetadataRepository.save(phase);
    }

    @Override
    @Transactional
    public void deletePhase(Long protocolId, Integer phaseNumber) {
        ProgramPhaseMetadata phase = phaseMetadataRepository.findByProtocolIdAndPhaseNumber(protocolId, phaseNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giai đoạn thứ " + phaseNumber));
        phaseMetadataRepository.delete(phase);
        log.info("Admin deleted Phase metadata for Protocol {} Phase {}", protocolId, phaseNumber);
    }

    @Override
    @Transactional
    public void updatePhase(Long protocolId, Integer phaseNumber, AdminPhaseUpdateRequest request) {
        ProgramPhaseMetadata phase = phaseMetadataRepository.findByProtocolIdAndPhaseNumber(protocolId, phaseNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giai đoạn thứ " + phaseNumber));
        phase.setFocus(request.getFocus());
        phase.setScience(request.getScience());
        phaseMetadataRepository.save(phase);
        log.info("Admin updated Phase metadata for Protocol {} Phase {}", protocolId, phaseNumber);
    }

    @Override
    @Transactional
    public void updateWeek(Long protocolId, Integer weekNumber, AdminWeekUpdateRequest request) {
        ProgramWeekMetadata week = weekMetadataRepository.findByProtocolIdAndWeekNumber(protocolId, weekNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tuần thứ " + weekNumber));
        week.setDescription(request.getDescription());
        weekMetadataRepository.save(week);
        log.info("Admin updated Week metadata for Protocol {} Week {}", protocolId, weekNumber);
    }

    @Override
    @Transactional
    public ProgramTaskMetadata createTask(Long protocolId, AdminTaskRequest request) {
        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phác đồ với ID: " + protocolId));

        ProgramPhaseMetadata phase = phaseMetadataRepository.findByProtocolIdAndPhaseNumber(protocolId, request.getPhaseNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giai đoạn " + request.getPhaseNumber()));
        ProgramWeekMetadata week = weekMetadataRepository.findByPhaseIdAndWeekNumber(phase.getId(), request.getWeekNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tuần " + request.getWeekNumber() + " trong giai đoạn " + request.getPhaseNumber()));

        ProgramDayMetadata day = null;
        if (request.getDayNumber() != null) {
            day = dayMetadataRepository.findByWeekIdAndDayNumber(week.getId(), request.getDayNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ngày " + request.getDayNumber() + " trong tuần " + request.getWeekNumber()));
        }

        ProgramTaskMetadata task = ProgramTaskMetadata.builder()
                .protocol(protocol)
                .phase(phase)
                .week(week)
                .day(day)
                .taskIndex(request.getTaskIndex())
                .title(request.getTitle())
                .subText(request.getSubText())
                .badge(request.getBadge())
                .build();

        return taskMetadataRepository.save(task);
    }

    @Override
    @Transactional
    public ProgramTaskMetadata updateTask(Long protocolId, Long id, AdminTaskRequest request) {
        ProgramTaskMetadata task = taskMetadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhiệm vụ ID " + id));

        if (!task.getProtocol().getId().equals(protocolId)) {
            throw new BadRequestException("Nhiệm vụ không thuộc về phác đồ này");
        }

        task.setTitle(request.getTitle());
        task.setSubText(request.getSubText());
        task.setBadge(request.getBadge());
        task.setTaskIndex(request.getTaskIndex());

        return taskMetadataRepository.save(task);
    }

    @Override
    @Transactional
    public void deleteTask(Long protocolId, Long id) {
        ProgramTaskMetadata task = taskMetadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhiệm vụ ID " + id));

        if (!task.getProtocol().getId().equals(protocolId)) {
            throw new BadRequestException("Nhiệm vụ không thuộc về phác đồ này");
        }

        taskMetadataRepository.delete(task);
        log.info("Admin deleted Task ID {} from Protocol {}", id, protocolId);
    }

    @Override
    @Transactional
    public ProgramMetricMetadata createMetric(Long protocolId, AdminMetricRequest request) {
        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phác đồ với ID: " + protocolId));

        ProgramPhaseMetadata phase = phaseMetadataRepository.findByProtocolIdAndPhaseNumber(protocolId, request.getPhaseNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giai đoạn " + request.getPhaseNumber()));
        ProgramWeekMetadata week = weekMetadataRepository.findByPhaseIdAndWeekNumber(phase.getId(), request.getWeekNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tuần " + request.getWeekNumber() + " trong giai đoạn " + request.getPhaseNumber()));

        ProgramDayMetadata day = null;
        if (request.getDayNumber() != null) {
            day = dayMetadataRepository.findByWeekIdAndDayNumber(week.getId(), request.getDayNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ngày " + request.getDayNumber() + " trong tuần " + request.getWeekNumber()));
        }

        ProgramMetricMetadata metric = ProgramMetricMetadata.builder()
                .protocol(protocol)
                .phase(phase)
                .week(week)
                .day(day)
                .metricName(request.getMetricName())
                .build();

        return metricMetadataRepository.save(metric);
    }

    @Override
    @Transactional
    public ProgramMetricMetadata updateMetric(Long protocolId, Long id, AdminMetricRequest request) {
        ProgramMetricMetadata metric = metricMetadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chỉ số ID " + id));

        if (!metric.getProtocol().getId().equals(protocolId)) {
            throw new BadRequestException("Chỉ số không thuộc về phác đồ này");
        }

        metric.setMetricName(request.getMetricName());
        return metricMetadataRepository.save(metric);
    }

    @Override
    @Transactional
    public void deleteMetric(Long protocolId, Long id) {
        ProgramMetricMetadata metric = metricMetadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chỉ số ID " + id));

        if (!metric.getProtocol().getId().equals(protocolId)) {
            throw new BadRequestException("Chỉ số không thuộc về phác đồ này");
        }

        metricMetadataRepository.delete(metric);
        log.info("Admin deleted Metric ID {} from Protocol {}", id, protocolId);
    }
}
