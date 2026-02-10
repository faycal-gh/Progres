package com.progress.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.progress.api.dto.LoginRequest;
import com.progress.api.dto.LoginResponse;
import com.progress.api.exception.ApiException;
import com.progress.api.security.JwtTokenProvider;
import com.progress.api.service.AuthService;
import com.progress.api.service.TokenBlacklistService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for unit testing
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @Nested
    @DisplayName("POST /api/auth/login")
    class Login {

        @Test
        @DisplayName("should return 200 and token on valid credentials")
        void shouldReturnTokenOnValidCredentials() throws Exception {
            // Arrange
            LoginRequest request = new LoginRequest("testuser", "testpass");
            LoginResponse response = LoginResponse.builder()
                    .token("jwt-token")
                    .refreshToken("refresh-token")
                    .uuid("user-uuid")
                    .message("Authentication successful")
                    .build();

            when(authService.authenticate(any(LoginRequest.class))).thenReturn(response);

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").value("jwt-token"))
                    .andExpect(jsonPath("$.refreshToken").doesNotExist())
                    .andExpect(jsonPath("$.uuid").value("user-uuid"))
                    .andExpect(jsonPath("$.message").value("Authentication successful"))
                    .andExpect(cookie().value("refresh_token", "refresh-token"))
                    .andExpect(cookie().httpOnly("refresh_token", true))
                    .andExpect(cookie().secure("refresh_token", true));
        }

        @Test
        @DisplayName("should return 401 on invalid credentials")
        void shouldReturn401OnInvalidCredentials() throws Exception {
            // Arrange
            LoginRequest request = new LoginRequest("wronguser", "wrongpass");

            when(authService.authenticate(any(LoginRequest.class)))
                    .thenThrow(new ApiException("Authentication failed", HttpStatus.UNAUTHORIZED));

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 400 on blank username")
        void shouldReturn400OnBlankUsername() throws Exception {
            // Arrange
            String requestBody = """
                    {
                        "username": "",
                        "password": "testpass"
                    }
                    """;

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 on blank password")
        void shouldReturn400OnBlankPassword() throws Exception {
            // Arrange
            String requestBody = """
                    {
                        "username": "testuser",
                        "password": ""
                    }
                    """;

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 on missing request body")
        void shouldReturn400OnMissingBody() throws Exception {
            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }
    }
}
