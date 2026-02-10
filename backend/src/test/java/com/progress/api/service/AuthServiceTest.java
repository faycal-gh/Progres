package com.progress.api.service;

import com.progress.api.dto.ExternalAuthResponse;
import com.progress.api.dto.LoginRequest;
import com.progress.api.dto.LoginResponse;
import com.progress.api.exception.ApiException;
import com.progress.api.security.JwtTokenProvider;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

import static org.assertj.core.api.Assertions.*;

@DisplayName("AuthService Tests")
class AuthServiceTest {

    private MockWebServer mockWebServer;
    private AuthService authService;
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        WebClient webClient = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .build();

        jwtTokenProvider = org.mockito.Mockito.mock(JwtTokenProvider.class);
        org.mockito.Mockito.when(jwtTokenProvider.generateToken(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("mock-jwt-token");
        org.mockito.Mockito.when(jwtTokenProvider.generateRefreshToken(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("mock-refresh-token");

        authService = new AuthService(webClient, jwtTokenProvider);
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Nested
    @DisplayName("Authentication")
    class Authentication {

        @Test
        @DisplayName("should authenticate successfully with valid credentials")
        void shouldAuthenticateSuccessfully() {
            // Arrange
            String responseBody = """
                {
                    "token": "external-api-token-xyz",
                    "uuid": "student-uuid-123"
                }
                """;

            mockWebServer.enqueue(new MockResponse()
                    .setBody(responseBody)
                    .addHeader("Content-Type", "application/json"));

            LoginRequest request = new LoginRequest("testuser", "testpass");

            // Act
            LoginResponse response = authService.authenticate(request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo("mock-jwt-token");
            assertThat(response.getRefreshToken()).isEqualTo("mock-refresh-token");
            assertThat(response.getUuid()).isEqualTo("student-uuid-123");
            assertThat(response.getMessage()).isEqualTo("Authentication successful");
        }

        @Test
        @DisplayName("should throw ApiException on invalid credentials (401)")
        void shouldThrowExceptionOnInvalidCredentials() {
            // Arrange
            mockWebServer.enqueue(new MockResponse()
                    .setResponseCode(401)
                    .setBody("{\"error\": \"Invalid credentials\"}")
                    .addHeader("Content-Type", "application/json"));

            LoginRequest request = new LoginRequest("wronguser", "wrongpass");

            // Act & Assert
            assertThatThrownBy(() -> authService.authenticate(request))
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    });
        }

        @Test
        @DisplayName("should throw ApiException on server error (500)")
        void shouldThrowExceptionOnServerError() {
            // Arrange
            mockWebServer.enqueue(new MockResponse()
                    .setResponseCode(500)
                    .setBody("{\"error\": \"Internal server error\"}"));

            LoginRequest request = new LoginRequest("testuser", "testpass");

            // Act & Assert
            assertThatThrownBy(() -> authService.authenticate(request))
                    .isInstanceOf(ApiException.class);
        }

        @Test
        @DisplayName("should throw ApiException when response is null")
        void shouldThrowExceptionOnNullResponse() {
            // Arrange
            mockWebServer.enqueue(new MockResponse()
                    .setBody("null")
                    .addHeader("Content-Type", "application/json"));

            LoginRequest request = new LoginRequest("testuser", "testpass");

            // Act & Assert
            assertThatThrownBy(() -> authService.authenticate(request))
                    .isInstanceOf(ApiException.class);
        }
    }
}
