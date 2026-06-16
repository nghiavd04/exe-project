package com.product.exe.backend.scheduler;

import com.product.exe.backend.entity.UserProgramProgress;
import com.product.exe.backend.enums.UserProgramStatus;
import com.product.exe.backend.repository.UserProgramProgressRepository;
import com.product.exe.backend.service.ProactiveCompanionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class ProactiveCompanionScheduler {

    private final UserProgramProgressRepository userProgramProgressRepository;
    private final ProactiveCompanionService proactiveCompanionService;

    /**
     * Runs every minute to send proactive AI reminders for users whose reminder_time matches the current time.
     */
    @Scheduled(cron = "0 * * * * ?")
    public void sendProactiveReminders() {
        java.time.LocalTime now = java.time.LocalTime.now();
        int hour = now.getHour();
        int minute = now.getMinute();

        log.debug("Checking Proactive AI Reminders for time {}:{}", hour, minute);

        // 1. Fetch programs where status is ACTIVE and reminderTime matches current hour/minute
        List<UserProgramProgress> activePrograms = userProgramProgressRepository.findByStatusAndReminderTime(UserProgramStatus.ACTIVE, hour, minute);
        
        for (UserProgramProgress progress : activePrograms) {
            try {
                // 2. Evaluate and send reminder if needed
                proactiveCompanionService.evaluateAndRemindCustomer(progress.getCustomer().getId(), progress.getCurrentDay());
            } catch (Exception e) {
                log.error("Failed to send proactive reminder for customer ID: {}", progress.getCustomer().getId(), e);
            }
        }
    }
}
