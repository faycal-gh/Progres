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

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@Tag(name = "Student", description = "Student data endpoints")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/data")
    @Operation(summary = "Get student data", description = "Get authenticated student's academic data")
    public ResponseEntity<Object> getStudentData(Authentication authentication) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();

        Object data = studentService.getStudentData(uuid, externalToken);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/exams/{id}")
    @Operation(summary = "Get exam data", description = "Get exam results for a specific academic period")
    public ResponseEntity<Object> getExamData(
            Authentication authentication,
            @PathVariable String id) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();

        Object data = studentService.getExamData(uuid, id, externalToken);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/info")
    @Operation(summary = "Get personal info", description = "Get student's personal information")
    public ResponseEntity<Object> getStudentInfo(Authentication authentication) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();

        Object data = studentService.getStudentInfo(uuid, externalToken);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/cc-grades/{cardId}")
    @Operation(summary = "Get CC grades", description = "Get continuous assessment (CC/TD/TP) grades for a student card")
    public ResponseEntity<Object> getCCGrades(
            Authentication authentication,
            @PathVariable String cardId) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();
        Object data = studentService.getCCGradesSecure(uuid, cardId, externalToken);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/exam-grades/{cardId}")
    @Operation(summary = "Get Exam grades", description = "Get exam grades for a student card")
    public ResponseEntity<Object> getExamGrades(
            Authentication authentication,
            @PathVariable String cardId) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();
        Object data = studentService.getExamGradesSecure(uuid, cardId, externalToken);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/photo")
    @Operation(summary = "Get student photo", description = "Get student's photo as base64 string")
    public ResponseEntity<Object> getStudentPhoto(Authentication authentication) {
        String uuid = (String) authentication.getPrincipal();
        String externalToken = (String) authentication.getCredentials();

        Object data = studentService.getStudentPhoto(uuid, externalToken);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/subjects/{offerId}/{levelId}")
    @Operation(summary = "Get Subjects", description = "Get subjects and coefficients for a specific offer and level")
    public ResponseEntity<Object> getSubjects(
            Authentication authentication,
            @PathVariable String offerId,
            @PathVariable String levelId) {
        String externalToken = (String) authentication.getCredentials();
        Object data = studentService.getSubjects(offerId, levelId, externalToken);
        return ResponseEntity.ok(data);
    }
}
