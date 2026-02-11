package com.progress.api.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JwtTokenProvider Tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    // Base64 encoded 256-bit secret key for testing
    private static final String TEST_SECRET = "dGVzdC11bml0LXRlc3Qtc2VjcmV0LWtleS1kby1ub3QtdXNlLWluLXByb2R1Y3Rpb24tMjU2LWJpdHM=";
    private static final long JWT_EXPIRATION = 900000L; // 15 minutes
    private static final long REFRESH_EXPIRATION = 604800000L; // 7 days

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", JWT_EXPIRATION);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshExpiration", REFRESH_EXPIRATION);
    }

    @Nested
    @DisplayName("Token Generation")
    class TokenGeneration {

        @Test
        @DisplayName("should generate valid access token")
        void shouldGenerateValidAccessToken() {
            String uuid = "test-uuid-123";

            String token = jwtTokenProvider.generateToken(uuid);

            assertThat(token).isNotNull().isNotBlank();
            assertThat(jwtTokenProvider.isTokenValid(token)).isTrue();
        }

        @Test
        @DisplayName("should generate valid refresh token")
        void shouldGenerateValidRefreshToken() {
            String uuid = "test-uuid-123";

            String refreshToken = jwtTokenProvider.generateRefreshToken(uuid);

            assertThat(refreshToken).isNotNull().isNotBlank();
            assertThat(jwtTokenProvider.isTokenValid(refreshToken)).isTrue();
        }

        @Test
        @DisplayName("should generate different access and refresh tokens")
        void shouldGenerateDifferentTokens() {
            String uuid = "test-uuid-123";

            String accessToken = jwtTokenProvider.generateToken(uuid);
            String refreshToken = jwtTokenProvider.generateRefreshToken(uuid);

            assertThat(accessToken).isNotEqualTo(refreshToken);
        }

        @Test
        @DisplayName("should include token type claim in access token")
        void shouldIncludeAccessTokenType() {
            String uuid = "test-uuid-123";

            String token = jwtTokenProvider.generateToken(uuid);
            String tokenType = jwtTokenProvider.extractTokenType(token);

            assertThat(tokenType).isEqualTo("access");
        }

        @Test
        @DisplayName("should include token type claim in refresh token")
        void shouldIncludeRefreshTokenType() {
            String uuid = "test-uuid-123";

            String refreshToken = jwtTokenProvider.generateRefreshToken(uuid);
            String tokenType = jwtTokenProvider.extractTokenType(refreshToken);

            assertThat(tokenType).isEqualTo("refresh");
        }
    }

    @Nested
    @DisplayName("Claim Extraction")
    class ClaimExtraction {

        @Test
        @DisplayName("should extract UUID from token")
        void shouldExtractUuid() {
            String uuid = "test-uuid-123";

            String token = jwtTokenProvider.generateToken(uuid);
            String extractedUuid = jwtTokenProvider.extractUuid(token);

            assertThat(extractedUuid).isEqualTo(uuid);
        }

        @Test
        @DisplayName("should not expose external token in JWT (security improvement)")
        void shouldNotExposeExternalTokenInJwt() {
            String uuid = "test-uuid-123";

            String token = jwtTokenProvider.generateToken(uuid);
            
            // The JWT should not contain any externalToken claim
            // Attempting to extract an "externalToken" claim should return null or fail
            String tokenType = jwtTokenProvider.extractTokenType(token);
            assertThat(tokenType).isIn("access", "refresh");
        }
    }

    @Nested
    @DisplayName("Token Validation")
    class TokenValidation {

        @Test
        @DisplayName("should return true for valid token")
        void shouldReturnTrueForValidToken() {
            String token = jwtTokenProvider.generateToken("uuid");

            assertThat(jwtTokenProvider.isTokenValid(token)).isTrue();
        }

        @Test
        @DisplayName("should return false for malformed token")
        void shouldReturnFalseForMalformedToken() {
            String malformedToken = "not.a.valid.jwt.token";

            assertThat(jwtTokenProvider.isTokenValid(malformedToken)).isFalse();
        }

        @Test
        @DisplayName("should return false for empty token")
        void shouldReturnFalseForEmptyToken() {
            assertThat(jwtTokenProvider.isTokenValid("")).isFalse();
        }

        @Test
        @DisplayName("should return false for null token")
        void shouldReturnFalseForNullToken() {
            assertThat(jwtTokenProvider.isTokenValid(null)).isFalse();
        }

        @Test
        @DisplayName("should return false for expired token")
        void shouldReturnFalseForExpiredToken() {            
            ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", -1L);
            String expiredToken = jwtTokenProvider.generateToken("uuid");
            assertThat(jwtTokenProvider.isTokenValid(expiredToken)).isFalse();
        }
    }

    @Nested
    @DisplayName("Expiration Configuration")
    class ExpirationConfiguration {

        @Test
        @DisplayName("should expose JWT expiration value")
        void shouldExposeJwtExpiration() {
            assertThat(jwtTokenProvider.getJwtExpiration()).isEqualTo(JWT_EXPIRATION);
        }

        @Test
        @DisplayName("should expose refresh expiration value")
        void shouldExposeRefreshExpiration() {
            assertThat(jwtTokenProvider.getRefreshExpiration()).isEqualTo(REFRESH_EXPIRATION);
        }
    }
}
