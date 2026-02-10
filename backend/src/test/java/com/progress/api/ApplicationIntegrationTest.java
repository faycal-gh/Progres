package com.progress.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Application Integration Tests")
class ApplicationIntegrationTest {

    @Test
    @DisplayName("should load application context successfully")
    void contextLoads() {
        // If this test passes, the Spring context loaded successfully
        assertThat(true).isTrue();
    }
}
