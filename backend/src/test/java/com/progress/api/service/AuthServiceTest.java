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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@DisplayName("AuthService Tests")
class AuthServiceTest {

    private MockWebServer mockWebServer;
    private AuthService authService;
    private JwtTokenProvider jwtTokenProvider;
    private ExternalTokenStore externalTokenStore;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        WebClient webClient = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .build();

        jwtTokenProvider = mock(JwtTokenProvider.class);
        when(jwtTokenProvider.generateToken(anyString()))
                .thenReturn("mock-jwt-token");
        when(jwtTokenProvider.generateRefreshToken(anyString()))
                .thenReturn("mock-refresh-token");
        when(jwtTokenProvider.getRefreshExpiration())
                .thenReturn(604800000L);

        externalTokenStore = mock(ExternalTokenStore.class);

        authService = new AuthService(webClient, jwtTokenProvider, externalTokenStore);
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

            // Verify external token was stored server-side
            verify(externalTokenStore).store(eq("student-uuid-123"), eq("external-api-token-xyz"), anyLong());
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
            
            // Verify no token was stored
            verify(externalTokenStore, never()).store(anyString(), anyString(), anyLong());
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
