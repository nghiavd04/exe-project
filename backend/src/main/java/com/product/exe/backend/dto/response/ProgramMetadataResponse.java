package com.product.exe.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ProgramMetadataResponse {
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
        private List<String> tasks;
        private List<String> metrics;
    }

    @Data
    @Builder
    public static class DayDto {
        private Integer num;
        private String label;
        private List<String> tasks;
        private List<String> metrics;
    }
}
