package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.UserDailyLogRequest;
import com.product.exe.backend.dto.request.UserWeeklyLogRequest;
import com.product.exe.backend.dto.response.ProgramAnalyticsResponse;
import com.product.exe.backend.dto.response.ProgramDayDetailResponse;
import com.product.exe.backend.dto.response.ProgramProgressResponse;
import com.product.exe.backend.dto.response.ProgramWeekDetailResponse;
import com.product.exe.backend.entity.*;
import com.product.exe.backend.enums.UserProgramStatus;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.repository.*;
import com.product.exe.backend.service.ProgramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProgramServiceImpl implements ProgramService {

    private final CustomerRepository customerRepository;
    private final UserProgramProgressRepository progressRepository;
    private final ProgramPhaseMetadataRepository phaseMetadataRepository;
    private final ProgramDayMetadataRepository dayMetadataRepository;
    private final ProgramWeekMetadataRepository weekMetadataRepository;
    private final ProgramTaskMetadataRepository taskMetadataRepository;
    private final ProgramMetricMetadataRepository metricMetadataRepository;
    private final UserProgramTaskRepository userProgramTaskRepository;
    private final UserDailyLogRepository userDailyLogRepository;
    private final UserWeeklyLogRepository userWeeklyLogRepository;

    @Override
    @Transactional
    public ProgramProgressResponse enroll(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        Optional<UserProgramProgress> existing = progressRepository.findByCustomerId(customer.getId());
        if (existing.isPresent()) {
            return mapToProgressResponse(existing.get());
        }

        UserProgramProgress progress = UserProgramProgress.builder()
                .customer(customer)
                .currentDay(1)
                .streakCount(0)
                .status(UserProgramStatus.ACTIVE)
                .build();

        progress = progressRepository.save(progress);
        log.info("Customer ID {} enrolled in Dopamine Detox Program.", customer.getId());
        return mapToProgressResponse(progress);
    }

    @Override
    public ProgramProgressResponse getProgress(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        return mapToProgressResponse(progress);
    }

    @Override
    public ProgramDayDetailResponse getDayDetail(Long userId, Integer dayNumber) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        if (dayNumber > progress.getCurrentDay()) {
            throw new BadRequestException("Ngày " + dayNumber + " chưa được mở khóa. Hiện tại bạn đang ở ngày " + progress.getCurrentDay());
        }

        ProgramDayMetadata dayMeta = dayMetadataRepository.findById(dayNumber)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy dữ liệu ngày thứ " + dayNumber));

        ProgramWeekMetadata weekMeta = dayMeta.getWeek();
        ProgramPhaseMetadata phaseMeta = weekMeta.getPhase();

        // Tasks
        List<ProgramTaskMetadata> tasksMeta = taskMetadataRepository.findByDayDayNumberOrderByTaskIndexAsc(dayNumber);
        List<UserProgramTask> completedTasks = userProgramTaskRepository.findByCustomerIdAndDayNumber(customer.getId(), dayNumber);

        List<ProgramDayDetailResponse.TaskDetail> tasks = new ArrayList<>();
        for (ProgramTaskMetadata meta : tasksMeta) {
            boolean isCompleted = completedTasks.stream()
                    .filter(t -> t.getTaskIndex().equals(meta.getTaskIndex()))
                    .map(UserProgramTask::getIsCompleted)
                    .findFirst()
                    .orElse(false);

            tasks.add(ProgramDayDetailResponse.TaskDetail.builder()
                    .taskIndex(meta.getTaskIndex())
                    .title(meta.getTitle())
                    .isCompleted(isCompleted)
                    .build());
        }

        // Metrics Names
        List<String> metricsList = metricMetadataRepository.findByDayDayNumber(dayNumber).stream()
                .map(ProgramMetricMetadata::getMetricName)
                .collect(Collectors.toList());

        // Logged Daily Data
        Optional<UserDailyLog> dailyLogOpt = userDailyLogRepository.findByCustomerIdAndDayNumber(customer.getId(), dayNumber);
        ProgramDayDetailResponse.LoggedDailyData loggedData = null;
        if (dailyLogOpt.isPresent()) {
            UserDailyLog dl = dailyLogOpt.get();
            loggedData = ProgramDayDetailResponse.LoggedDailyData.builder()
                    .screenTimeMinutes(dl.getScreenTimeMinutes())
                    .unconsciousOpenCount(dl.getUnconsciousOpenCount())
                    .urgeLevel(dl.getUrgeLevel())
                    .sleepHours(dl.getSleepHours())
                    .moodScore(dl.getMoodScore())
                    .sleepScore(dl.getSleepScore())
                    .urgeScore(dl.getUrgeScore())
                    .focusScore(dl.getFocusScore())
                    .journalText(dl.getJournalText())
                    .build();
        }

        return ProgramDayDetailResponse.builder()
                .dayNumber(dayNumber)
                .dayLabel(dayMeta.getLabel())
                .weekNumber(weekMeta.getWeekNumber())
                .weekLabel(weekMeta.getLabel())
                .weekRange(weekMeta.getRangeText())
                .phaseNumber(phaseMeta.getPhaseNumber())
                .phaseLabel(phaseMeta.getLabel())
                .phaseIcon(phaseMeta.getIcon())
                .tasks(tasks)
                .metricsList(metricsList)
                .loggedData(loggedData)
                .build();
    }

    @Override
    public ProgramWeekDetailResponse getWeekDetail(Long userId, Integer weekNumber) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        // Check if week is unlocked. W is unlocked if currentDay >= (W-1)*7 + 1
        int unlockedWeek = (progress.getCurrentDay() - 1) / 7 + 1;
        if (weekNumber > unlockedWeek) {
            throw new BadRequestException("Tuần " + weekNumber + " chưa được mở khóa. Hiện tại bạn đang ở ngày " + progress.getCurrentDay());
        }

        ProgramWeekMetadata weekMeta = weekMetadataRepository.findById(weekNumber)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy dữ liệu tuần thứ " + weekNumber));

        ProgramPhaseMetadata phaseMeta = weekMeta.getPhase();

        // Tasks (weekly tasks where dayNumber is null)
        List<ProgramTaskMetadata> tasksMeta = taskMetadataRepository.findByWeekWeekNumberAndDayIsNullOrderByTaskIndexAsc(weekNumber);
        List<UserProgramTask> completedTasks = userProgramTaskRepository.findByCustomerIdAndWeekNumberAndDayNumberIsNull(customer.getId(), weekNumber);

        List<ProgramWeekDetailResponse.TaskDetail> tasks = new ArrayList<>();
        for (ProgramTaskMetadata meta : tasksMeta) {
            boolean isCompleted = completedTasks.stream()
                    .filter(t -> t.getTaskIndex().equals(meta.getTaskIndex()))
                    .map(UserProgramTask::getIsCompleted)
                    .findFirst()
                    .orElse(false);

            tasks.add(ProgramWeekDetailResponse.TaskDetail.builder()
                    .taskIndex(meta.getTaskIndex())
                    .title(meta.getTitle())
                    .isCompleted(isCompleted)
                    .build());
        }

        // Metrics Names
        List<String> metricsList = metricMetadataRepository.findByWeekWeekNumberAndDayIsNull(weekNumber).stream()
                .map(ProgramMetricMetadata::getMetricName)
                .collect(Collectors.toList());

        // Logged Weekly Data
        Optional<UserWeeklyLog> weeklyLogOpt = userWeeklyLogRepository.findByCustomerIdAndWeekNumber(customer.getId(), weekNumber);
        ProgramWeekDetailResponse.LoggedWeeklyData loggedData = null;
        if (weeklyLogOpt.isPresent()) {
            UserWeeklyLog wl = weeklyLogOpt.get();
            loggedData = ProgramWeekDetailResponse.LoggedWeeklyData.builder()
                    .screenTimeAvgMinutes(wl.getScreenTimeAvgMinutes())
                    .moodAvgScore(wl.getMoodAvgScore())
                    .deepWorkAvgMinutes(wl.getDeepWorkAvgMinutes())
                    .outputCount(wl.getOutputCount())
                    .socialMediaAvgMinutes(wl.getSocialMediaAvgMinutes())
                    .streakCount(wl.getStreakCount())
                    .relationshipSatisfaction(wl.getRelationshipSatisfaction())
                    .build();
        }

        return ProgramWeekDetailResponse.builder()
                .weekNumber(weekNumber)
                .weekLabel(weekMeta.getLabel())
                .weekRange(weekMeta.getRangeText())
                .description(weekMeta.getDescription())
                .phaseNumber(phaseMeta.getPhaseNumber())
                .phaseLabel(phaseMeta.getLabel())
                .phaseIcon(phaseMeta.getIcon())
                .tasks(tasks)
                .metricsList(metricsList)
                .loggedData(loggedData)
                .build();
    }

    @Override
    @Transactional
    public void toggleTask(Long userId, Integer dayNumber, Integer weekNumber, Integer taskIndex, Boolean isCompleted) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        // Check if unlocked
        if (dayNumber != null) {
            if (dayNumber > progress.getCurrentDay()) {
                throw new BadRequestException("Ngày này chưa được mở khóa");
            }
        } else {
            int unlockedWeek = (progress.getCurrentDay() - 1) / 7 + 1;
            if (weekNumber > unlockedWeek) {
                throw new BadRequestException("Tuần này chưa được mở khóa");
            }
        }

        Optional<UserProgramTask> taskOpt = dayNumber != null
                ? userProgramTaskRepository.findByCustomerIdAndDayNumberAndWeekNumberAndTaskIndex(customer.getId(), dayNumber, weekNumber, taskIndex)
                : userProgramTaskRepository.findByCustomerIdAndDayNumberIsNullAndWeekNumberAndTaskIndex(customer.getId(), weekNumber, taskIndex);

        UserProgramTask task;
        if (taskOpt.isPresent()) {
            task = taskOpt.get();
            task.setIsCompleted(isCompleted);
            task.setCompletedAt(isCompleted ? LocalDateTime.now() : null);
        } else {
            task = UserProgramTask.builder()
                    .customer(customer)
                    .dayNumber(dayNumber)
                    .weekNumber(weekNumber)
                    .taskIndex(taskIndex)
                    .isCompleted(isCompleted)
                    .completedAt(isCompleted ? LocalDateTime.now() : null)
                    .build();
        }

        userProgramTaskRepository.save(task);
    }

    @Override
    @Transactional
    public void saveDailyLog(Long userId, Integer dayNumber, UserDailyLogRequest request) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        if (dayNumber > progress.getCurrentDay()) {
            throw new BadRequestException("Ngày này chưa được mở khóa");
        }

        UserDailyLog logRecord = userDailyLogRepository.findByCustomerIdAndDayNumber(customer.getId(), dayNumber)
                .orElse(UserDailyLog.builder().customer(customer).dayNumber(dayNumber).build());

        logRecord.setScreenTimeMinutes(request.getScreenTimeMinutes());
        logRecord.setUnconsciousOpenCount(request.getUnconsciousOpenCount());
        logRecord.setUrgeLevel(request.getUrgeLevel());
        logRecord.setSleepHours(request.getSleepHours());
        logRecord.setMoodScore(request.getMoodScore());
        logRecord.setSleepScore(request.getSleepScore());
        logRecord.setUrgeScore(request.getUrgeScore());
        logRecord.setFocusScore(request.getFocusScore());
        logRecord.setJournalText(request.getJournalText());

        userDailyLogRepository.save(logRecord);

        if (dayNumber.equals(progress.getCurrentDay())) {
            progress.setLastCheckedInAt(LocalDateTime.now());
            progressRepository.save(progress);
        }
    }

    @Override
    @Transactional
    public void saveWeeklyLog(Long userId, Integer weekNumber, UserWeeklyLogRequest request) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        int unlockedWeek = (progress.getCurrentDay() - 1) / 7 + 1;
        if (weekNumber > unlockedWeek) {
            throw new BadRequestException("Tuần này chưa được mở khóa");
        }

        UserWeeklyLog logRecord = userWeeklyLogRepository.findByCustomerIdAndWeekNumber(customer.getId(), weekNumber)
                .orElse(UserWeeklyLog.builder().customer(customer).weekNumber(weekNumber).build());

        logRecord.setScreenTimeAvgMinutes(request.getScreenTimeAvgMinutes());
        logRecord.setMoodAvgScore(request.getMoodAvgScore());
        logRecord.setDeepWorkAvgMinutes(request.getDeepWorkAvgMinutes());
        logRecord.setOutputCount(request.getOutputCount());
        logRecord.setSocialMediaAvgMinutes(request.getSocialMediaAvgMinutes());
        logRecord.setStreakCount(request.getStreakCount());
        logRecord.setRelationshipSatisfaction(request.getRelationshipSatisfaction());

        userWeeklyLogRepository.save(logRecord);

        if (weekNumber == unlockedWeek) {
            progress.setLastCheckedInAt(LocalDateTime.now());
            progressRepository.save(progress);
        }
    }

    @Override
    public ProgramAnalyticsResponse getAnalytics(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        // Daily history
        List<UserDailyLog> dailyLogs = userDailyLogRepository.findByCustomerIdOrderByDayNumberAsc(customer.getId());
        List<ProgramAnalyticsResponse.DailyLogData> dailyLogData = dailyLogs.stream()
                .map(dl -> ProgramAnalyticsResponse.DailyLogData.builder()
                        .dayNumber(dl.getDayNumber())
                        .screenTimeMinutes(dl.getScreenTimeMinutes())
                        .moodScore(dl.getMoodScore())
                        .urgeLevel(dl.getUrgeLevel())
                        .sleepHours(dl.getSleepHours())
                        .focusScore(dl.getFocusScore())
                        .build())
                .collect(Collectors.toList());

        // Weekly history
        List<UserWeeklyLog> weeklyLogs = userWeeklyLogRepository.findByCustomerIdOrderByWeekNumberAsc(customer.getId());
        List<ProgramAnalyticsResponse.WeeklyLogData> weeklyLogData = weeklyLogs.stream()
                .map(wl -> ProgramAnalyticsResponse.WeeklyLogData.builder()
                        .weekNumber(wl.getWeekNumber())
                        .screenTimeAvgMinutes(wl.getScreenTimeAvgMinutes())
                        .moodAvgScore(wl.getMoodAvgScore())
                        .deepWorkAvgMinutes(wl.getDeepWorkAvgMinutes())
                        .relationshipSatisfaction(wl.getRelationshipSatisfaction())
                        .build())
                .collect(Collectors.toList());

        // Total tasks
        // Count completions
        int totalCompletedTasks = (int) userProgramTaskRepository.countByCustomerIdAndIsCompletedTrue(customer.getId());

        return ProgramAnalyticsResponse.builder()
                .currentDay(progress.getCurrentDay())
                .streakCount(progress.getStreakCount())
                .totalCompletedTasks(totalCompletedTasks)
                .dailyLogs(dailyLogData)
                .weeklyLogs(weeklyLogData)
                .build();
    }

    @Override
    @Transactional
    public void advanceDayForAllActivePrograms() {
        log.info("Scheduling: Running daily advance-day logic at 00:00...");
        List<UserProgramProgress> activePrograms = progressRepository.findByStatus(UserProgramStatus.ACTIVE);

        for (UserProgramProgress progress : activePrograms) {
            try {
                Long customerId = progress.getCustomer().getId();
                Integer currentDay = progress.getCurrentDay();

                boolean allCompleted = false;
                if (currentDay <= 30) {
                    // Check daily tasks count (must be 4 completed)
                    long completedCount = userProgramTaskRepository.countByCustomerIdAndDayNumberAndIsCompletedTrue(customerId, currentDay);
                    allCompleted = (completedCount >= 4);
                } else {
                    // Check weekly tasks (Week number = (currentDay - 1) / 7 + 1)
                    int currentWeek = (currentDay - 1) / 7 + 1;
                    long completedCount = userProgramTaskRepository.countByCustomerIdAndWeekNumberAndDayNumberIsNullAndIsCompletedTrue(customerId, currentWeek);
                    allCompleted = (completedCount >= 4);
                }

                if (allCompleted) {
                    // Keep or increase streak
                    progress.setStreakCount(progress.getStreakCount() + 1);
                } else {
                    // Lost streak
                    progress.setStreakCount(0);
                }

                // Advance day
                progress.setCurrentDay(currentDay + 1);
                if (progress.getCurrentDay() > getMaxProgramDays()) {
                    progress.setStatus(UserProgramStatus.COMPLETED);
                    log.info("Customer ID {} successfully completed the program!", customerId);
                }

                progressRepository.save(progress);
                log.info("Advanced Customer ID {} from day {} to {}. New Streak: {}", customerId, currentDay, progress.getCurrentDay(), progress.getStreakCount());

            } catch (Exception e) {
                log.error("Error advancing day for customer progress ID {}: ", progress.getId(), e);
            }
        }
    }

    private ProgramProgressResponse mapToProgressResponse(UserProgramProgress progress) {
        boolean isCheckedInToday = false;
        if (progress.getLastCheckedInAt() != null) {
            isCheckedInToday = progress.getLastCheckedInAt().toLocalDate().isEqual(LocalDate.now());
        }

        return ProgramProgressResponse.builder()
                .id(progress.getId())
                .currentDay(progress.getCurrentDay())
                .streakCount(progress.getStreakCount())
                .startedAt(progress.getStartedAt())
                .lastCheckedInAt(progress.getLastCheckedInAt())
                .status(progress.getStatus().name())
                .isCheckedInToday(isCheckedInToday)
                .build();
    }

    @Override
    public com.product.exe.backend.dto.response.ProgramMetadataResponse getProgramMetadata() {
        List<ProgramPhaseMetadata> phases = phaseMetadataRepository.findAll();
        List<com.product.exe.backend.dto.response.ProgramMetadataResponse.PhaseDto> phaseDtos = new ArrayList<>();

        for (ProgramPhaseMetadata phase : phases) {
            List<ProgramWeekMetadata> weeks = weekMetadataRepository.findByPhasePhaseNumberOrderByWeekNumberAsc(phase.getPhaseNumber());
            List<com.product.exe.backend.dto.response.ProgramMetadataResponse.WeekDto> weekDtos = new ArrayList<>();

            for (ProgramWeekMetadata week : weeks) {
                List<com.product.exe.backend.dto.response.ProgramMetadataResponse.DayDto> dayDtos = new ArrayList<>();
                List<String> wTasks = new ArrayList<>();
                List<String> wMetrics = new ArrayList<>();

                if (phase.getPhaseNumber() == 1) {
                    List<ProgramDayMetadata> days = dayMetadataRepository.findByWeekWeekNumberOrderByDayNumberAsc(week.getWeekNumber());
                    for (ProgramDayMetadata day : days) {
                        List<String> dTasks = taskMetadataRepository.findByDayDayNumberOrderByTaskIndexAsc(day.getDayNumber()).stream()
                                .map(ProgramTaskMetadata::getTitle)
                                .collect(Collectors.toList());
                        List<String> dMetrics = metricMetadataRepository.findByDayDayNumber(day.getDayNumber()).stream()
                                .map(ProgramMetricMetadata::getMetricName)
                                .collect(Collectors.toList());

                        dayDtos.add(com.product.exe.backend.dto.response.ProgramMetadataResponse.DayDto.builder()
                                .num(day.getDayNumber())
                                .label(day.getLabel())
                                .tasks(dTasks)
                                .metrics(dMetrics)
                                .build());
                    }
                } else {
                    wTasks = taskMetadataRepository.findByWeekWeekNumberAndDayIsNullOrderByTaskIndexAsc(week.getWeekNumber()).stream()
                            .map(ProgramTaskMetadata::getTitle)
                            .collect(Collectors.toList());
                    wMetrics = metricMetadataRepository.findByWeekWeekNumberAndDayIsNull(week.getWeekNumber()).stream()
                            .map(ProgramMetricMetadata::getMetricName)
                            .collect(Collectors.toList());
                }

                weekDtos.add(com.product.exe.backend.dto.response.ProgramMetadataResponse.WeekDto.builder()
                        .num(week.getWeekNumber())
                        .label(week.getLabel())
                        .range(week.getRangeText())
                        .description(week.getDescription())
                        .days(dayDtos)
                        .tasks(wTasks)
                        .metrics(wMetrics)
                        .build());
            }

            phaseDtos.add(com.product.exe.backend.dto.response.ProgramMetadataResponse.PhaseDto.builder()
                    .num(phase.getPhaseNumber())
                    .label(phase.getLabel())
                    .range(phase.getRangeText())
                    .icon(phase.getIcon())
                    .focus(phase.getFocus())
                    .science(phase.getScience())
                    .weeks(weekDtos)
                    .build());
        }

        return com.product.exe.backend.dto.response.ProgramMetadataResponse.builder().phases(phaseDtos).build();
    }

    @Override
    @Transactional
    public ProgramProgressResponse advanceDayForUser(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        // Restrict day advancement to once per calendar day
        LocalDate today = LocalDate.now();
        if (progress.getStartedAt() != null && progress.getStartedAt().toLocalDate().isEqual(today)) {
            throw new BadRequestException("Bạn chỉ có thể tiến sang ngày tiếp theo vào ngày mai!");
        }
        if (progress.getLastCheckedInAt() != null && progress.getLastCheckedInAt().toLocalDate().isEqual(today)) {
            throw new BadRequestException("Bạn chỉ có thể tiến sang ngày tiếp theo vào ngày mai!");
        }

        Integer currentDay = progress.getCurrentDay();

        boolean allCompleted = false;
        if (currentDay <= 30) {
            // Check daily tasks count (must be 4 completed)
            long completedCount = userProgramTaskRepository.countByCustomerIdAndDayNumberAndIsCompletedTrue(customer.getId(), currentDay);
            allCompleted = (completedCount >= 4);
        } else {
            // Check weekly tasks (Week number = (currentDay - 1) / 7 + 1)
            int currentWeek = (currentDay - 1) / 7 + 1;
            long completedCount = userProgramTaskRepository.countByCustomerIdAndWeekNumberAndDayNumberIsNullAndIsCompletedTrue(customer.getId(), currentWeek);
            allCompleted = (completedCount >= 4);
        }

        if (allCompleted) {
            // Keep or increase streak
            progress.setStreakCount(progress.getStreakCount() + 1);
        } else {
            // Lost streak
            progress.setStreakCount(0);
        }

        // Advance day
        progress.setCurrentDay(currentDay + 1);
        if (progress.getCurrentDay() > getMaxProgramDays()) {
            progress.setStatus(UserProgramStatus.COMPLETED);
        }

        progress.setLastCheckedInAt(LocalDateTime.now());
        progressRepository.save(progress);

        return mapToProgressResponse(progress);
    }

    private int getMaxProgramDays() {
        int maxDay = dayMetadataRepository.findMaxDayNumber();
        if (maxDay > 0) {
            return maxDay;
        }
        int maxWeek = weekMetadataRepository.findMaxWeekNumber();
        return maxWeek * 7;
    }
}
