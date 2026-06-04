package com.product.exe.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AdminProgramMetadataResponse {
    private List<PhaseDto> phases;

    @Data
    @Builder
    public static class PhaseDto {
        private Integer num;
        private String label;
        private String range;
        private String icon;
        private String focus;
        private String science;
        private List<WeekDto> weeks;
    }

    @Data
    @Builder
    public static class WeekDto {
        private Integer num;
        private String label;
        private String range;
        private String description;
        private List<DayDto> days;
        private List<TaskDto> tasks;
        private List<MetricDto> metrics;
    }

    @Data
    @Builder
    public static class DayDto {
        private Integer num;
        private String label;
        private List<TaskDto> tasks;
        private List<MetricDto> metrics;
    }

    @Data
    @Builder
    public static class TaskDto {
        private Long id;
        private Integer taskIndex;
        private String title;
        private String subText;
        private String badge;
    }

    @Data
    @Builder
    public static class MetricDto {
        private Long id;
        private String metricName;
    }
}
