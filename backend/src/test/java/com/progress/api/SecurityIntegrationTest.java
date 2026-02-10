package com.progress.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.progress.api.dto.LoginRequest;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlMatching;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Security Integration Tests")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static WireMockServer wireMockServer;

    @BeforeAll
    static void setupWireMock() {
        wireMockServer = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());
        wireMockServer.start();
    }

    @AfterAll
    static void teardownWireMock() {
        if (wireMockServer != null) {
            wireMockServer.stop();
        }
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("external-api.base-url", () -> wireMockServer.baseUrl());
    }

    @BeforeEach
    void resetWireMock() {
        wireMockServer.resetAll();
    }

    @Nested
    @DisplayName("Authentication Flow")
    class AuthenticationFlow {

        @Test
        @DisplayName("should complete full authentication flow")
        void shouldCompleteFullAuthenticationFlow() throws Exception {
            // Mock external authentication API
            wireMockServer.stubFor(com.github.tomakehurst.wiremock.client.WireMock.post(urlEqualTo("/authentication/v1/"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                {
                                    "token": "external-api-token",
                                    "uuid": "student-uuid-123"
                                }
                                """)));

            // Perform login
            LoginRequest loginRequest = new LoginRequest("testuser", "testpass");

            MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists())
                    .andExpect(jsonPath("$.uuid").value("student-uuid-123"))
                    .andReturn();

            // Extract JWT token
            String responseBody = loginResult.getResponse().getContentAsString();
            String jwtToken = objectMapper.readTree(responseBody).get("token").asText();

            assertThat(jwtToken).isNotBlank();
        }

        @Test
        @DisplayName("should reject access to protected endpoints without token")
        void shouldRejectAccessWithoutToken() throws Exception {
            mockMvc.perform(get("/api/student/data"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should reject access with invalid token")
        void shouldRejectAccessWithInvalidToken() throws Exception {
            mockMvc.perform(get("/api/student/data")
                            .header("Authorization", "Bearer invalid-token"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should allow access to public endpoints")
        void shouldAllowPublicEndpoints() throws Exception {
            mockMvc.perform(get("/actuator/health"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Protected Resources")
    class ProtectedResources {

        @Test
        @DisplayName("should access protected resource with valid token")
        void shouldAccessProtectedResourceWithValidToken() throws Exception {
            // First, login to get a token
            wireMockServer.stubFor(com.github.tomakehurst.wiremock.client.WireMock.post(urlEqualTo("/authentication/v1/"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                {
                                    "token": "external-api-token",
                                    "uuid": "student-uuid-123"
                                }
                                """)));

            LoginRequest loginRequest = new LoginRequest("testuser", "testpass");
            MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andReturn();

            String jwtToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                    .get("token").asText();

            // Mock student data endpoint
            wireMockServer.stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlMatching("/infos/bac/.*/dias"))
                    .willReturn(aResponse()
                            .withStatus(200)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""
                                {
                                    "id": 1,
                                    "name": "Test Student",
                                    "faculty": "Computer Science"
                                }
                                """)));

            // Access protected resource
            mockMvc.perform(get("/api/student/data")
                            .header("Authorization", "Bearer " + jwtToken))
                    .andExpect(status().isOk());
        }
    }
}
