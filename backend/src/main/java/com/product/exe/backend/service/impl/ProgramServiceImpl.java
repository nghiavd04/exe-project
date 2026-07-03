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
import com.product.exe.backend.service.SubscriptionService;
import com.product.exe.backend.enums.SubscriptionTier;
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
    private final SubscriptionService subscriptionService;
    private final ProtocolRepository protocolRepository;
    private final ProtocolSelectionRepository protocolSelectionRepository;
    private final ProgramReviewRepository programReviewRepository;

    @Override
    @Transactional
    public ProgramProgressResponse enroll(Long userId) {
        Protocol defaultProtocol = protocolRepository.findByCode("P_INTENSIVE_120")
                .orElseThrow(() -> new BadRequestException("Không tìm thấy phác đồ mặc định (P_INTENSIVE_120)"));
        return enroll(userId, defaultProtocol.getId());
    }

    @Override
    @Transactional
    public ProgramProgressResponse enroll(Long userId, Long protocolId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy phác đồ với ID: " + protocolId));

        Optional<UserProgramProgress> existing = progressRepository.findByCustomerId(customer.getId());
        if (existing.isPresent()) {
            UserProgramProgress existingProgress = existing.get();
            // Nếu phác đồ của tiến trình hiện tại khác phác đồ yêu cầu và trạng thái là ACTIVE
            // (Thường thì chỉ ghi đè nếu trước đó chưa gán phác đồ, hoặc nâng cấp từ hệ thống thanh toán)
            if (existingProgress.getProtocol() == null) {
                existingProgress.setProtocol(protocol);
                existingProgress.setSwitchLockedUntil(LocalDateTime.now().plusDays(Math.min(21, protocol.getDurationDays())));
                existingProgress.setReviewDueAt(LocalDateTime.now().plusDays(Math.min(30, protocol.getDurationDays())));
                existingProgress = progressRepository.save(existingProgress);
            }
            return mapToProgressResponse(existingProgress);
        }

        UserProgramProgress progress = UserProgramProgress.builder()
                .customer(customer)
                .protocol(protocol)
                .currentDay(1)
                .streakCount(0)
                .cycleNumber(1)
                .status(UserProgramStatus.ACTIVE)
                .switchLockedUntil(LocalDateTime.now().plusDays(Math.min(21, protocol.getDurationDays())))
                .reviewDueAt(LocalDateTime.now().plusDays(Math.min(30, protocol.getDurationDays())))
                .build();

        progress = progressRepository.save(progress);
        log.info("Customer ID {} enrolled in protocol {}.", customer.getId(), protocol.getCode());
        return mapToProgressResponse(progress);
    }

    @Override
    @Transactional
    public void selectProtocol(Long userId, Long protocolId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy phác đồ với ID: " + protocolId));

        if (!protocol.getIsActive()) {
            throw new BadRequestException("Phác đồ này hiện không hoạt động");
        }

        // Hủy các lựa chọn PENDING_PAYMENT cũ của người dùng này
        List<ProtocolSelection> oldSelections = protocolSelectionRepository.findByCustomerIdAndStatus(customer.getId(), "PENDING_PAYMENT");
        for (ProtocolSelection sel : oldSelections) {
            sel.setStatus("EXPIRED");
            protocolSelectionRepository.save(sel);
        }

        ProtocolSelection selection = ProtocolSelection.builder()
                .customer(customer)
                .selectedProtocol(protocol)
                .status("PENDING_PAYMENT")
                .build();

        protocolSelectionRepository.save(selection);
        log.info("Customer ID {} selected protocol {} (pending payment).", customer.getId(), protocol.getCode());
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

        Protocol protocol = progress.getProtocol();
        if (protocol == null) {
            protocol = protocolRepository.findByCode("P_INTENSIVE_120")
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy phác đồ mặc định"));
        }

        ProgramDayMetadata dayMeta = dayMetadataRepository.findByProtocolIdAndDayNumber(protocol.getId(), dayNumber)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy dữ liệu ngày thứ " + dayNumber + " cho phác đồ " + progress.getProtocol().getName()));

        ProgramWeekMetadata weekMeta = dayMeta.getWeek();
        ProgramPhaseMetadata phaseMeta = weekMeta.getPhase();

        // Tasks
        List<ProgramTaskMetadata> tasksMeta = taskMetadataRepository.findByProtocolIdAndDayDayNumberOrderByTaskIndexAsc(protocol.getId(), dayNumber);
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
        List<String> metricsList = metricMetadataRepository.findByProtocolIdAndDayDayNumber(protocol.getId(), dayNumber).stream()
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

        Protocol protocol = progress.getProtocol();
        if (protocol == null) {
            protocol = protocolRepository.findByCode("P_INTENSIVE_120")
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy phác đồ mặc định"));
        }

        ProgramWeekMetadata weekMeta = weekMetadataRepository.findByProtocolIdAndWeekNumber(protocol.getId(), weekNumber)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy dữ liệu tuần thứ " + weekNumber + " cho phác đồ " + progress.getProtocol().getName()));

        ProgramPhaseMetadata phaseMeta = weekMeta.getPhase();

        // Tasks (weekly tasks where dayNumber is null)
        List<ProgramTaskMetadata> tasksMeta = taskMetadataRepository.findByProtocolIdAndWeekWeekNumberAndDayIsNullOrderByTaskIndexAsc(protocol.getId(), weekNumber);
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
        List<String> metricsList = metricMetadataRepository.findByProtocolIdAndWeekWeekNumberAndDayIsNull(protocol.getId(), weekNumber).stream()
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
                Long userId = progress.getCustomer().getUser().getId();

                SubscriptionTier tier = subscriptionService.getUserHighestTier(userId);
                if (tier == null || tier == SubscriptionTier.FREE) {
                    progress.setStatus(UserProgramStatus.PAUSED);
                    progressRepository.save(progress);
                    log.info("Customer ID {} subscription expired. Paused program progress.", customerId);
                    continue;
                }

                Protocol protocol = progress.getProtocol();
                if (protocol == null) {
                    protocol = protocolRepository.findByCode("P_INTENSIVE_120").orElse(null);
                }
                Long protocolId = protocol != null ? protocol.getId() : null;

                Integer currentDay = progress.getCurrentDay();

                boolean hasDailyTasks = false;
                if (protocolId != null) {
                    hasDailyTasks = dayMetadataRepository.findByProtocolIdAndDayNumber(protocolId, currentDay).isPresent();
                }

                boolean allCompleted = false;
                if (hasDailyTasks) {
                    long completedCount = userProgramTaskRepository.countByCustomerIdAndDayNumberAndIsCompletedTrue(customerId, currentDay);
                    allCompleted = (completedCount >= 4);
                } else {
                    int currentWeek = (currentDay - 1) / 7 + 1;
                    long completedCount = userProgramTaskRepository.countByCustomerIdAndWeekNumberAndDayNumberIsNullAndIsCompletedTrue(customerId, currentWeek);
                    allCompleted = (completedCount >= 4);
                }

                if (allCompleted) {
                    progress.setStreakCount(progress.getStreakCount() + 1);
                } else {
                    progress.setStreakCount(0);
                }

                progress.setCurrentDay(currentDay + 1);
                int maxDays = protocol != null ? protocol.getDurationDays() : 120;
                if (progress.getCurrentDay() > maxDays) {
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

    @Override
    @Transactional
    public ProgramProgressResponse advanceDayForUser(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        LocalDate today = LocalDate.now();
        if (progress.getStartedAt() != null && progress.getStartedAt().toLocalDate().isEqual(today)) {
            throw new BadRequestException("Bạn chỉ có thể tiến sang ngày tiếp theo vào ngày mai!");
        }
        if (progress.getLastCheckedInAt() != null && progress.getLastCheckedInAt().toLocalDate().isEqual(today)) {
            throw new BadRequestException("Bạn chỉ có thể tiến sang ngày tiếp theo vào ngày mai!");
        }

        Protocol protocol = progress.getProtocol();
        if (protocol == null) {
            protocol = protocolRepository.findByCode("P_INTENSIVE_120")
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy phác đồ mặc định"));
        }
        Long protocolId = protocol.getId();
        Integer currentDay = progress.getCurrentDay();

        boolean hasDailyTasks = dayMetadataRepository.findByProtocolIdAndDayNumber(protocolId, currentDay).isPresent();

        boolean allCompleted = false;
        if (hasDailyTasks) {
            long completedCount = userProgramTaskRepository.countByCustomerIdAndDayNumberAndIsCompletedTrue(customer.getId(), currentDay);
            allCompleted = (completedCount >= 4);
        } else {
            int currentWeek = (currentDay - 1) / 7 + 1;
            long completedCount = userProgramTaskRepository.countByCustomerIdAndWeekNumberAndDayNumberIsNullAndIsCompletedTrue(customer.getId(), currentWeek);
            allCompleted = (completedCount >= 4);
        }

        if (allCompleted) {
            progress.setStreakCount(progress.getStreakCount() + 1);
        } else {
            progress.setStreakCount(0);
        }

        progress.setCurrentDay(currentDay + 1);
        int maxDays = protocol.getDurationDays();
        if (progress.getCurrentDay() > maxDays) {
            progress.setStatus(UserProgramStatus.COMPLETED);
        }

        progress.setLastCheckedInAt(LocalDateTime.now());
        progress = progressRepository.save(progress);
        return mapToProgressResponse(progress);
    }

    private ProgramProgressResponse mapToProgressResponse(UserProgramProgress progress) {
        boolean isCheckedInToday = false;
        if (progress.getLastCheckedInAt() != null) {
            isCheckedInToday = progress.getLastCheckedInAt().toLocalDate().isEqual(LocalDate.now());
        }

        ProgramProgressResponse.ProgramProgressResponseBuilder builder = ProgramProgressResponse.builder()
                .id(progress.getId())
                .currentDay(progress.getCurrentDay())
                .streakCount(progress.getStreakCount())
                .startedAt(progress.getStartedAt())
                .lastCheckedInAt(progress.getLastCheckedInAt())
                .status(progress.getStatus().name())
                .isCheckedInToday(isCheckedInToday);

        if (progress.getProtocol() != null) {
            builder.protocolId(progress.getProtocol().getId())
                   .protocolCode(progress.getProtocol().getCode())
                   .protocolName(progress.getProtocol().getName())
                   .durationDays(progress.getProtocol().getDurationDays())
                   .cycleNumber(progress.getCycleNumber())
                   .reviewDueAt(progress.getReviewDueAt())
                   .switchLockedUntil(progress.getSwitchLockedUntil());
        }

        return builder.build();
    }

    @Override
    public com.product.exe.backend.dto.response.ProgramMetadataResponse getProgramMetadata() {
        Protocol defaultProtocol = protocolRepository.findByCode("P_INTENSIVE_120")
                .orElseThrow(() -> new BadRequestException("Không tìm thấy phác đồ mặc định (P_INTENSIVE_120)"));
        return getProgramMetadata(defaultProtocol.getId());
    }

    @Override
    public com.product.exe.backend.dto.response.ProgramMetadataResponse getProgramMetadataForUser(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        Optional<UserProgramProgress> progressOpt = progressRepository.findByCustomerId(customer.getId());
        if (progressOpt.isPresent() && progressOpt.get().getProtocol() != null) {
            return getProgramMetadata(progressOpt.get().getProtocol().getId());
        }

        return getProgramMetadata();
    }

    @Override
    public com.product.exe.backend.dto.response.ProgramMetadataResponse getProgramMetadata(Long protocolId) {
        List<ProgramPhaseMetadata> phases = phaseMetadataRepository.findByProtocolIdOrderByPhaseNumberAsc(protocolId);
        List<com.product.exe.backend.dto.response.ProgramMetadataResponse.PhaseDto> phaseDtos = new ArrayList<>();

        for (ProgramPhaseMetadata phase : phases) {
            List<ProgramWeekMetadata> weeks = weekMetadataRepository.findByProtocolIdAndPhasePhaseNumberOrderByWeekNumberAsc(protocolId, phase.getPhaseNumber());
            List<com.product.exe.backend.dto.response.ProgramMetadataResponse.WeekDto> weekDtos = new ArrayList<>();

            for (ProgramWeekMetadata week : weeks) {
                List<com.product.exe.backend.dto.response.ProgramMetadataResponse.DayDto> dayDtos = new ArrayList<>();
                List<String> wTasks = new ArrayList<>();
                List<String> wMetrics = new ArrayList<>();

                List<ProgramDayMetadata> days = dayMetadataRepository.findByProtocolIdAndWeekWeekNumberOrderByDayNumberAsc(protocolId, week.getWeekNumber());
                if (!days.isEmpty()) {
                    for (ProgramDayMetadata day : days) {
                        List<String> dTasks = taskMetadataRepository.findByProtocolIdAndDayDayNumberOrderByTaskIndexAsc(protocolId, day.getDayNumber()).stream()
                                .map(ProgramTaskMetadata::getTitle)
                                .collect(Collectors.toList());
                        List<String> dMetrics = metricMetadataRepository.findByProtocolIdAndDayDayNumber(protocolId, day.getDayNumber()).stream()
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
                    wTasks = taskMetadataRepository.findByProtocolIdAndWeekWeekNumberAndDayIsNullOrderByTaskIndexAsc(protocolId, week.getWeekNumber()).stream()
                            .map(ProgramTaskMetadata::getTitle)
                            .collect(Collectors.toList());
                    wMetrics = metricMetadataRepository.findByProtocolIdAndWeekWeekNumberAndDayIsNull(protocolId, week.getWeekNumber()).stream()
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

    private int getMaxProgramDays(Long protocolId) {
        int maxDay = dayMetadataRepository.findMaxDayNumber(protocolId);
        if (maxDay > 0) {
            return maxDay;
        }
        int maxWeek = weekMetadataRepository.findMaxWeekNumber(protocolId);
        return maxWeek * 7;
    }

    @Override
    @Transactional
    public ProgramProgressResponse resumeProgram(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        if (progress.getStatus() != UserProgramStatus.PAUSED) {
            throw new BadRequestException("Lộ trình của bạn không ở trạng thái tạm dừng");
        }

        progress.setStatus(UserProgramStatus.ACTIVE);
        progressRepository.save(progress);
        log.info("Customer ID {} resumed program progress.", customer.getId());

        return mapToProgressResponse(progress);
    }

    @Override
    @Transactional
    public ProgramProgressResponse restartProgram(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        // Delete all tasks, daily logs, and weekly logs for this customer
        userProgramTaskRepository.deleteByCustomerId(customer.getId());
        userDailyLogRepository.deleteByCustomerId(customer.getId());
        userWeeklyLogRepository.deleteByCustomerId(customer.getId());

        // Since startedAt is marked updatable = false, delete and recreate UserProgramProgress
        progressRepository.delete(progress);
        progressRepository.flush();

        Protocol currentProtocol = progress.getProtocol();

        UserProgramProgress newProgress = UserProgramProgress.builder()
                .customer(customer)
                .protocol(currentProtocol)
                .currentDay(1)
                .streakCount(0)
                .cycleNumber(progress.getCycleNumber())
                .status(UserProgramStatus.ACTIVE)
                .switchLockedUntil(LocalDateTime.now().plusDays(Math.min(21, currentProtocol != null ? currentProtocol.getDurationDays() : 120)))
                .reviewDueAt(LocalDateTime.now().plusDays(Math.min(30, currentProtocol != null ? currentProtocol.getDurationDays() : 120)))
                .build();
        newProgress = progressRepository.save(newProgress);
        log.info("Customer ID {} restarted program progress.", customer.getId());

        return mapToProgressResponse(newProgress);
    }

    @Override
    @Transactional
    public ProgramProgressResponse submitReview(Long userId, com.product.exe.backend.dto.request.ProgramReviewRequest request) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin khách hàng"));

        UserProgramProgress progress = progressRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Bạn chưa tham gia lộ trình phác đồ"));

        ProgramReview review = ProgramReview.builder()
                .userProgramProgress(progress)
                .reviewCycleNumber(progress.getCycleNumber())
                .suitabilityRating(request.getSuitabilityRating())
                .completionConfidence(request.getCompletionConfidence())
                .difficultyLevel(request.getDifficultyLevel())
                .wantsToSwitch(request.getWantsToSwitch() != null ? request.getWantsToSwitch() : false)
                .userNotes(request.getUserNotes())
                .nextAction(request.getNextAction())
                .createdAt(LocalDateTime.now())
                .build();
        programReviewRepository.save(review);

        if ("SWITCH_PROTOCOL".equalsIgnoreCase(request.getNextAction()) && request.getSwitchProtocolId() != null) {
            Protocol newProtocol = protocolRepository.findById(request.getSwitchProtocolId())
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy phác đồ mới để chuyển đổi"));

            // Clear previous tasks/logs so the user starts fresh on the new protocol
            userProgramTaskRepository.deleteByCustomerId(customer.getId());
            userDailyLogRepository.deleteByCustomerId(customer.getId());
            userWeeklyLogRepository.deleteByCustomerId(customer.getId());

            progress.setProtocol(newProtocol);
            progress.setCurrentDay(1);
            progress.setStreakCount(0);
            progress.setCycleNumber(progress.getCycleNumber() + 1);
            progress.setStartedAt(LocalDateTime.now());
            progress.setLastCheckedInAt(null);
            progress.setSwitchLockedUntil(LocalDateTime.now().plusDays(Math.min(21, newProtocol.getDurationDays())));
            progress.setReviewDueAt(LocalDateTime.now().plusDays(Math.min(30, newProtocol.getDurationDays())));
            progress.setStatus(UserProgramStatus.ACTIVE);
            
            log.info("Customer ID {} switched to protocol {} at cycle {}.", customer.getId(), newProtocol.getCode(), progress.getCycleNumber());
        } else {
            // Keep current protocol: just extend the review due date and increment cycle
            progress.setCycleNumber(progress.getCycleNumber() + 1);
            Protocol currentProtocol = progress.getProtocol();
            int duration = currentProtocol != null ? currentProtocol.getDurationDays() : 120;
            progress.setReviewDueAt(LocalDateTime.now().plusDays(Math.min(30, duration)));
            
            log.info("Customer ID {} kept current protocol. Set cycle to {}.", customer.getId(), progress.getCycleNumber());
        }

        progress = progressRepository.save(progress);
        return mapToProgressResponse(progress);
    }
}
