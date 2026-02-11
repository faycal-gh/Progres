package com.progress.api.service;

import com.progress.api.exception.ApiException;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.mock;

@DisplayName("StudentService Tests")
class StudentServiceTest {

    private MockWebServer mockWebServer;
    private StudentService studentService;
    private ExternalTokenStore externalTokenStore;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        WebClient webClient = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .build();

        externalTokenStore = mock(ExternalTokenStore.class);
        studentService = new StudentService(webClient, externalTokenStore);
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Nested
    @DisplayName("Get Student Data")
    class GetStudentData {

        @Test
        @DisplayName("should return student data successfully")
        void shouldReturnStudentDataSuccessfully() {
            // Arrange
            String responseBody = """
                {
                    "id": 1,
                    "name": "John Doe",
                    "faculty": "Computer Science"
                }
                """;

            mockWebServer.enqueue(new MockResponse()
                    .setBody(responseBody)
                    .addHeader("Content-Type", "application/json"));

            // Act
            Object result = studentService.getStudentData("test-uuid", "Bearer external-token").block();

            // Assert
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("should throw ApiException on 401 unauthorized")
        void shouldThrowExceptionOnUnauthorized() {
            // Arrange
            mockWebServer.enqueue(new MockResponse()
                    .setResponseCode(401)
                    .setBody("{\"error\": \"Unauthorized\"}")
                    .addHeader("Content-Type", "application/json"));

            // Act & Assert
            assertThatThrownBy(() -> studentService.getStudentData("test-uuid", "invalid-token").block())
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    });
        }

        @Test
        @DisplayName("should throw ApiException on 404 not found")
        void shouldThrowExceptionOnNotFound() {
            // Arrange
            mockWebServer.enqueue(new MockResponse()
                    .setResponseCode(404)
                    .setBody("{\"error\": \"Student not found\"}"));

            // Act & Assert
            assertThatThrownBy(() -> studentService.getStudentData("unknown-uuid", "Bearer token").block())
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    });
        }

        @Test
        @DisplayName("should throw ApiException on 500 server error")
        void shouldThrowExceptionOnServerError() {
            // Arrange
            mockWebServer.enqueue(new MockResponse()
                    .setResponseCode(500)
                    .setBody("{\"error\": \"Internal server error\"}"));

            // Act & Assert
            assertThatThrownBy(() -> studentService.getStudentData("test-uuid", "Bearer token").block())
                    .isInstanceOf(ApiException.class);
        }
    }

    @Nested
    @DisplayName("Get Exam Data")
    class GetExamData {

        @Test
        @DisplayName("should return exam data successfully")
        void shouldReturnExamDataSuccessfully() {
            // Arrange
            String responseBody = """
                {
                    "exams": [
                        {"subject": "Math", "score": 85},
                        {"subject": "Physics", "score": 90}
                    ]
                }
                """;

            mockWebServer.enqueue(new MockResponse()
                    .setBody(responseBody)
                    .addHeader("Content-Type", "application/json"));

            // Act
            Object result = studentService.getExamData("test-uuid", "exam-id-1", "Bearer external-token").block();

            // Assert
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("should throw ApiException on 401 unauthorized")
        void shouldThrowExceptionOnUnauthorized() {
            // Arrange
            mockWebServer.enqueue(new MockResponse()
                    .setResponseCode(401)
                    .setBody("{\"error\": \"Unauthorized\"}"));

            // Act & Assert
            assertThatThrownBy(() -> studentService.getExamData("test-uuid", "exam-id", "invalid-token").block())
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    });
        }

        @Test
        @DisplayName("should throw ApiException on 404 not found")
        void shouldThrowExceptionOnNotFound() {
            // Arrange
            mockWebServer.enqueue(new MockResponse()
                    .setResponseCode(404)
                    .setBody("{\"error\": \"Exam not found\"}"));

            // Act & Assert
            assertThatThrownBy(() -> studentService.getExamData("uuid", "unknown-exam", "Bearer token").block())
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    });
        }
    }
}
