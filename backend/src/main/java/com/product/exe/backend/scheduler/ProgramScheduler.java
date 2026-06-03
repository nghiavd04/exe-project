package com.product.exe.backend.scheduler;

import com.product.exe.backend.service.ProgramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProgramScheduler {

    private final ProgramService programService;

    // Run every day at midnight (00:00:00)
    @Scheduled(cron = "0 0 0 * * ?")
    public void runDailyAdvanceProgram() {
        log.info("Cron: Running daily Dopamine Reset Program day-advancement scheduler...");
        try {
            programService.advanceDayForAllActivePrograms();
            log.info("Cron: Dopamine Reset Program day-advancement completed successfully.");
        } catch (Exception e) {
            log.error("Cron: Failed to execute daily program day-advancement: ", e);
        }
    }
}
