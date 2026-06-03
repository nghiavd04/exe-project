package com.product.exe.backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UserDailyLogRequest {
    private Integer screenTimeMinutes;
    private Integer unconsciousOpenCount;
    private Integer urgeLevel;
    private BigDecimal sleepHours;
    private Integer moodScore;
    private Integer sleepScore;
    private Integer urgeScore;
    private Integer focusScore;
    private String journalText;
}
