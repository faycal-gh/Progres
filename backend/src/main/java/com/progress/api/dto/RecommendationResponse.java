package com.progress.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    private CurrentStatus currentStatus;

    private List<Recommendation> recommendations;

    private String summary;

    private String model;

    private boolean universitySupported;

    private String fallbackUniversity;

    private boolean fieldSupported;

    private String unsupportedReason;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentStatus {
        private String university;
        private String universityAr;
        private String field;
        private String fieldAr;
        private String major;
        private String majorAr;
        private String speciality;
        private String specialityAr;
        private String level;
        private String levelAr;
        private Double currentAverage;
        private String academicYear;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recommendation {
        private String code;
        private String name;
        private String type;
        private int matchScore;
        private String reasoning;
        private List<String> keySubjects;
        private List<String> careerOutcomes;
        private List<String> furtherOptions;
    }
}
