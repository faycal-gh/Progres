package com.progress.api.controller;

import com.progress.api.security.JwtTokenProvider;
import com.progress.api.service.StudentService;
import com.progress.api.service.TokenBlacklistService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudentController.class)
@DisplayName("StudentController Tests")
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StudentService studentService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    // Create authentication with String principal/credentials as the controller expects
    private UsernamePasswordAuthenticationToken createMockAuthentication() {
        return new UsernamePasswordAuthenticationToken(
                "test-uuid",           // principal (String)
                "external-token",      // credentials (String) 
                Collections.emptyList()
        );
    }

    @Nested
    @DisplayName("GET /api/student/data")
    class GetStudentData {

        @Test
        @DisplayName("should return 200 with student data when authenticated")
        void shouldReturnStudentDataWhenAuthenticated() throws Exception {
            // Arrange
            Map<String, Object> studentData = Map.of(
                    "id", 1,
                    "name", "John Doe",
                    "faculty", "Computer Science"
            );

            when(studentService.getStudentData(anyString(), anyString())).thenReturn(studentData);

            // Act & Assert
            mockMvc.perform(get("/api/student/data")
                            .with(authentication(createMockAuthentication())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("John Doe"));
        }
    }

    @Nested
    @DisplayName("GET /api/student/exams/{id}")
    class GetExamData {

        @Test
        @DisplayName("should return 200 with exam data when authenticated")
        void shouldReturnExamDataWhenAuthenticated() throws Exception {
            // Arrange
            Map<String, Object> examData = Map.of(
                    "examId", "exam-123",
                    "subjects", java.util.List.of(
                            Map.of("name", "Math", "score", 85),
                            Map.of("name", "Physics", "score", 90)
                    )
            );

            when(studentService.getExamData(anyString(), anyString(), anyString())).thenReturn(examData);

            // Act & Assert
            mockMvc.perform(get("/api/student/exams/exam-123")
                            .with(authentication(createMockAuthentication())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.examId").value("exam-123"));
        }
    }
}
