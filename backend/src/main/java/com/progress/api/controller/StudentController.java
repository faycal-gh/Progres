package com.progress.api.controller;

import com.progress.api.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@Tag(name = "Student", description = "Student data endpoints")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/data")
    @Operation(summary = "Get student data", description = "Get authenticated student's academic data")
    public Mono<ResponseEntity<Object>> getStudentData(Authentication authentication) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();

        return studentService.getStudentData(uuid, externalToken)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/exams/{id}")
    @Operation(summary = "Get exam data", description = "Get exam results for a specific academic period")
    public Mono<ResponseEntity<Object>> getExamData(
            Authentication authentication,
            @PathVariable String id) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();

        return studentService.getExamData(uuid, id, externalToken)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/info")
    @Operation(summary = "Get personal info", description = "Get student's personal information")
    public Mono<ResponseEntity<Object>> getStudentInfo(Authentication authentication) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();

        return studentService.getStudentInfo(uuid, externalToken)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/cc-grades/{cardId}")
    @Operation(summary = "Get CC grades", description = "Get continuous assessment (CC/TD/TP) grades for a student card")
    public Mono<ResponseEntity<Object>> getCCGrades(
            Authentication authentication,
            @PathVariable String cardId) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();
        return studentService.getCCGradesSecure(uuid, cardId, externalToken)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/exam-grades/{cardId}")
    @Operation(summary = "Get Exam grades", description = "Get exam grades for a student card")
    public Mono<ResponseEntity<Object>> getExamGrades(
            Authentication authentication,
            @PathVariable String cardId) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();
        return studentService.getExamGradesSecure(uuid, cardId, externalToken)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/photo")
    @Operation(summary = "Get student photo", description = "Get student's photo as base64 string")
    public Mono<ResponseEntity<Object>> getStudentPhoto(Authentication authentication) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();

        return studentService.getStudentPhoto(uuid, externalToken)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.ok(null));
    }

    @GetMapping("/subjects/{offerId}/{levelId}")
    @Operation(summary = "Get Subjects", description = "Get subjects and coefficients for a specific offer and level")
    public Mono<ResponseEntity<Object>> getSubjects(
            Authentication authentication,
            @PathVariable String offerId,
            @PathVariable String levelId) {
        String externalToken = (String) authentication.getCredentials();
        return studentService.getSubjects(offerId, levelId, externalToken)
                .map(ResponseEntity::ok);
    }
}
