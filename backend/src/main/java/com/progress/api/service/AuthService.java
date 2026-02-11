package com.progress.api.service;

import com.progress.api.dto.ExternalAuthResponse;
import com.progress.api.dto.LoginRequest;
import com.progress.api.dto.LoginResponse;
import com.progress.api.exception.ApiException;
import com.progress.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final WebClient webClient;
    private final JwtTokenProvider jwtTokenProvider;
    private final ExternalTokenStore externalTokenStore;

    public Mono<LoginResponse> authenticate(LoginRequest request) {
        return webClient.post()
                .uri("/authentication/v1/")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ExternalAuthResponse.class)
                .switchIfEmpty(Mono.error(new ApiException(
                        "Authentication failed: Invalid response from server", HttpStatus.UNAUTHORIZED)))
                .flatMap(externalResponse -> {
                    if (externalResponse == null || externalResponse.getToken() == null) {
                        return Mono.error(new ApiException(
                                "Authentication failed: Invalid response from server", HttpStatus.UNAUTHORIZED));
                    }

                    String uuid = externalResponse.getUuid();
                    String externalToken = externalResponse.getToken();

                    externalTokenStore.store(uuid, externalToken, jwtTokenProvider.getRefreshExpiration());

                    String jwtToken = jwtTokenProvider.generateToken(uuid);
                    String refreshToken = jwtTokenProvider.generateRefreshToken(uuid);

                    log.info("User authenticated successfully: {}", uuid);

                    return Mono.just(LoginResponse.builder()
                            .token(jwtToken)
                            .refreshToken(refreshToken)
                            .uuid(uuid)
                            .message("Authentication successful")
                            .build());
                })
                .onErrorMap(WebClientResponseException.class, e -> {
                    log.error("External API error: {}", e.getResponseBodyAsString());
                    if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                        return new ApiException(
                                "اسم المستخدم أو كلمة المرور غير صحيحة", HttpStatus.UNAUTHORIZED);
                    }
                    return new ApiException(
                            "Authentication failed: " + e.getStatusText(),
                            HttpStatus.valueOf(e.getStatusCode().value()));
                })
                .onErrorMap(WebClientRequestException.class, e -> {
                    log.error("Cannot reach external auth service: {}", e.getMessage(), e);
                    return new ApiException(
                            "خدمة المصادقة غير متوفرة حاليًا. يرجى المحاولة لاحقًا.",
                            HttpStatus.SERVICE_UNAVAILABLE);
                })
                .onErrorMap(e -> !(e instanceof ApiException), e -> {
                    log.error("Authentication error: [{}] {}", e.getClass().getSimpleName(), e.getMessage(), e);
                    String detail = e.getMessage();
                    if (detail == null || detail.isBlank()) {
                        detail = e.getClass().getSimpleName();
                    }
                    return new ApiException("Authentication failed: " + detail, HttpStatus.INTERNAL_SERVER_ERROR);
                });
    }

    public void removeExternalToken(String uuid) {
        externalTokenStore.remove(uuid);
        log.debug("Removed external token for user: {}", uuid);
    }
}
