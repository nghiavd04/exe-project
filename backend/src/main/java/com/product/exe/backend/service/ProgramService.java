package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.UserDailyLogRequest;
import com.product.exe.backend.dto.request.UserWeeklyLogRequest;
import com.product.exe.backend.dto.response.ProgramAnalyticsResponse;
import com.product.exe.backend.dto.response.ProgramDayDetailResponse;
import com.product.exe.backend.dto.response.ProgramProgressResponse;
import com.product.exe.backend.dto.response.ProgramWeekDetailResponse;
import com.product.exe.backend.dto.response.ProgramMetadataResponse;

public interface ProgramService {
    ProgramProgressResponse enroll(Long userId);
    ProgramProgressResponse enroll(Long userId, Long protocolId);
    void selectProtocol(Long userId, Long protocolId);
    ProgramProgressResponse getProgress(Long userId);
    ProgramDayDetailResponse getDayDetail(Long userId, Integer dayNumber);
    ProgramWeekDetailResponse getWeekDetail(Long userId, Integer weekNumber);
    void toggleTask(Long userId, Integer dayNumber, Integer weekNumber, Integer taskIndex, Boolean isCompleted);
    void saveDailyLog(Long userId, Integer dayNumber, UserDailyLogRequest request);
    void saveWeeklyLog(Long userId, Integer weekNumber, UserWeeklyLogRequest request);
    ProgramAnalyticsResponse getAnalytics(Long userId);
    void advanceDayForAllActivePrograms();
    ProgramProgressResponse advanceDayForUser(Long userId);
    ProgramMetadataResponse getProgramMetadata();
    ProgramMetadataResponse getProgramMetadata(Long protocolId);
    ProgramMetadataResponse getProgramMetadataForUser(Long userId);
    ProgramProgressResponse resumeProgram(Long userId);
    ProgramProgressResponse restartProgram(Long userId);
    ProgramProgressResponse submitReview(Long userId, com.product.exe.backend.dto.request.ProgramReviewRequest request);
}
