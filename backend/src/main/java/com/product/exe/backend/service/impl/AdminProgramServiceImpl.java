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

    @Override
    public AdminProgramMetadataResponse getProgramMetadata() {
        List<ProgramPhaseMetadata> phases = phaseMetadataRepository.findAll();
        List<AdminProgramMetadataResponse.PhaseDto> phaseDtos = new ArrayList<>();

        for (ProgramPhaseMetadata phase : phases) {
            List<ProgramWeekMetadata> weeks = weekMetadataRepository.findByPhasePhaseNumberOrderByWeekNumberAsc(phase.getPhaseNumber());
            List<AdminProgramMetadataResponse.WeekDto> weekDtos = new ArrayList<>();

            for (ProgramWeekMetadata week : weeks) {
                List<AdminProgramMetadataResponse.DayDto> dayDtos = new ArrayList<>();
                List<AdminProgramMetadataResponse.TaskDto> wTasks = new ArrayList<>();
                List<AdminProgramMetadataResponse.MetricDto> wMetrics = new ArrayList<>();

                if (phase.getPhaseNumber() == 1) {
                    List<ProgramDayMetadata> days = dayMetadataRepository.findByWeekWeekNumberOrderByDayNumberAsc(week.getWeekNumber());
                    for (ProgramDayMetadata day : days) {
                        List<AdminProgramMetadataResponse.TaskDto> dTasks = taskMetadataRepository.findByDayDayNumberOrderByTaskIndexAsc(day.getDayNumber()).stream()
                                .map(t -> AdminProgramMetadataResponse.TaskDto.builder()
                                        .id(t.getId())
                                        .taskIndex(t.getTaskIndex())
                                        .title(t.getTitle())
                                        .subText(t.getSubText())
                                        .badge(t.getBadge())
                                        .build())
                                .collect(Collectors.toList());

                        List<AdminProgramMetadataResponse.MetricDto> dMetrics = metricMetadataRepository.findByDayDayNumber(day.getDayNumber()).stream()
                                .map(m -> AdminProgramMetadataResponse.MetricDto.builder()
                                        .id(m.getId())
                                        .metricName(m.getMetricName())
                                        .build())
                                .collect(Collectors.toList());

                        dayDtos.add(AdminProgramMetadataResponse.DayDto.builder()
                                .num(day.getDayNumber())
                                .label(day.getLabel())
                                .tasks(dTasks)
                                .metrics(dMetrics)
                                .build());
                    }
                } else {
                    wTasks = taskMetadataRepository.findByWeekWeekNumberAndDayIsNullOrderByTaskIndexAsc(week.getWeekNumber()).stream()
                            .map(t -> AdminProgramMetadataResponse.TaskDto.builder()
                                    .id(t.getId())
                                    .taskIndex(t.getTaskIndex())
                                    .title(t.getTitle())
                                    .subText(t.getSubText())
                                    .badge(t.getBadge())
                                    .build())
                            .collect(Collectors.toList());

                    wMetrics = metricMetadataRepository.findByWeekWeekNumberAndDayIsNull(week.getWeekNumber()).stream()
                            .map(m -> AdminProgramMetadataResponse.MetricDto.builder()
                                    .id(m.getId())
                                    .metricName(m.getMetricName())
                                    .build())
                            .collect(Collectors.toList());
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
    public ProgramPhaseMetadata createPhase(AdminPhaseCreateRequest request) {
        if (phaseMetadataRepository.existsById(request.getPhaseNumber())) {
            throw new BadRequestException("Giai đoạn số " + request.getPhaseNumber() + " đã tồn tại");
        }
        ProgramPhaseMetadata phase = ProgramPhaseMetadata.builder()
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
    public void deletePhase(Integer phaseNumber) {
        ProgramPhaseMetadata phase = phaseMetadataRepository.findById(phaseNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giai đoạn thứ " + phaseNumber));
        phaseMetadataRepository.delete(phase);
        log.info("Admin deleted Phase metadata for Phase {}", phaseNumber);
    }

    @Override
    @Transactional
    public void updatePhase(Integer phaseNumber, AdminPhaseUpdateRequest request) {
        ProgramPhaseMetadata phase = phaseMetadataRepository.findById(phaseNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giai đoạn thứ " + phaseNumber));
        phase.setFocus(request.getFocus());
        phase.setScience(request.getScience());
        phaseMetadataRepository.save(phase);
        log.info("Admin updated Phase metadata for Phase {}", phaseNumber);
    }

    @Override
    @Transactional
    public void updateWeek(Integer weekNumber, AdminWeekUpdateRequest request) {
        ProgramWeekMetadata week = weekMetadataRepository.findById(weekNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tuần thứ " + weekNumber));
        week.setDescription(request.getDescription());
        weekMetadataRepository.save(week);
        log.info("Admin updated Week metadata for Week {}", weekNumber);
    }

    @Override
    @Transactional
    public ProgramTaskMetadata createTask(AdminTaskRequest request) {
        ProgramPhaseMetadata phase = phaseMetadataRepository.findById(request.getPhaseNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giai đoạn " + request.getPhaseNumber()));
        ProgramWeekMetadata week = weekMetadataRepository.findById(request.getWeekNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tuần " + request.getWeekNumber()));

        ProgramDayMetadata day = null;
        if (request.getDayNumber() != null) {
            day = dayMetadataRepository.findById(request.getDayNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ngày " + request.getDayNumber()));
        }

        ProgramTaskMetadata task = ProgramTaskMetadata.builder()
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
    public ProgramTaskMetadata updateTask(Long id, AdminTaskRequest request) {
        ProgramTaskMetadata task = taskMetadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhiệm vụ ID " + id));

        task.setTitle(request.getTitle());
        task.setSubText(request.getSubText());
        task.setBadge(request.getBadge());
        task.setTaskIndex(request.getTaskIndex());

        return taskMetadataRepository.save(task);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        ProgramTaskMetadata task = taskMetadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhiệm vụ ID " + id));
        taskMetadataRepository.delete(task);
        log.info("Admin deleted Task ID {}", id);
    }

    @Override
    @Transactional
    public ProgramMetricMetadata createMetric(AdminMetricRequest request) {
        ProgramPhaseMetadata phase = phaseMetadataRepository.findById(request.getPhaseNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giai đoạn " + request.getPhaseNumber()));
        ProgramWeekMetadata week = weekMetadataRepository.findById(request.getWeekNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tuần " + request.getWeekNumber()));

        ProgramDayMetadata day = null;
        if (request.getDayNumber() != null) {
            day = dayMetadataRepository.findById(request.getDayNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ngày " + request.getDayNumber()));
        }

        ProgramMetricMetadata metric = ProgramMetricMetadata.builder()
                .phase(phase)
                .week(week)
                .day(day)
                .metricName(request.getMetricName())
                .build();

        return metricMetadataRepository.save(metric);
    }

    @Override
    @Transactional
    public ProgramMetricMetadata updateMetric(Long id, AdminMetricRequest request) {
        ProgramMetricMetadata metric = metricMetadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chỉ số ID " + id));
        metric.setMetricName(request.getMetricName());
        return metricMetadataRepository.save(metric);
    }

    @Override
    @Transactional
    public void deleteMetric(Long id) {
        ProgramMetricMetadata metric = metricMetadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chỉ số ID " + id));
        metricMetadataRepository.delete(metric);
        log.info("Admin deleted Metric ID {}", id);
    }
}
