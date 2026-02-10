package com.progress.api.controller;

import com.progress.api.dto.RecommendationRequest;
import com.progress.api.dto.RecommendationResponse;
import com.progress.api.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "AI-powered major and speciality recommendation endpoints")
@SecurityRequirement(name = "bearerAuth")
public class RecommendationController {

        private final RecommendationService recommendationService;

        @PostMapping("/suggest")
        @Operation(summary = "Get AI recommendations", description = """
                        Analyzes the student's academic performance (marks, current field/major)
                        and returns personalized recommendations for the next academic level.

                        The AI considers:
                        - Current grades and performance trends
                        - Available majors/specialities based on current level
                        - Optional: Student's career preferences and preferred subjects

                        Returns a list of recommendations with match scores and reasoning.
                        """)
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Recommendations generated successfully", content = @Content(schema = @Schema(implementation = RecommendationResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
                        @ApiResponse(responseCode = "500", description = "Internal server error - AI service unavailable")
        })
        public ResponseEntity<RecommendationResponse> getRecommendations(
                        Authentication authentication,
                        @RequestBody(required = false) RecommendationRequest request) {
                String uuid = (String) authentication.getPrincipal();
                String externalToken = (String) authentication.getCredentials();

                RecommendationResponse response = recommendationService.getRecommendations(
                                uuid,
                                externalToken,
                                request);

                return ResponseEntity.ok(response);
        }
}
