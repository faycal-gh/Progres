package com.progress.api.service;

import com.progress.api.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final WebClient webClient;
    private final ExternalTokenStore externalTokenStore;
    
    private static final long CARD_CACHE_TTL = 60 * 60 * 1000L;

    public Mono<Object> getStudentData(String uuid, String externalToken) {
        return webClient.get()
                .uri("/infos/bac/{uuid}/dias", uuid)
                .header("Authorization", externalToken)
                .retrieve()
                .bodyToMono(Object.class)
                .onErrorMap(WebClientResponseException.class, e -> {
                    log.error("Failed to fetch student data: {}", e.getResponseBodyAsString());
                    return new ApiException(
                            "Failed to fetch student data: " + e.getStatusText(),
                            HttpStatus.valueOf(e.getStatusCode().value()));
                })
                .onErrorMap(e -> !(e instanceof ApiException), e -> {
                    log.error("Error fetching student data", e);
                    return new ApiException("Failed to fetch student data", HttpStatus.INTERNAL_SERVER_ERROR);
                });
    }

    public Mono<Object> getExamData(String uuid, String id, String externalToken) {
        return webClient.get()
                .uri("/infos/bac/{uuid}/dias/{id}/periode/bilans", uuid, id)
                .header("Authorization", externalToken)
                .retrieve()
                .bodyToMono(Object.class)
                .onErrorMap(WebClientResponseException.class, e -> {
                    log.error("Failed to fetch exam data: {}", e.getResponseBodyAsString());
                    return new ApiException(
                            "Failed to fetch exam data: " + e.getStatusText(),
                            HttpStatus.valueOf(e.getStatusCode().value()));
                })
                .onErrorMap(e -> !(e instanceof ApiException), e -> {
                    log.error("Error fetching exam data", e);
                    return new ApiException("Failed to fetch exam data", HttpStatus.INTERNAL_SERVER_ERROR);
                });
    }

    public Mono<Object> getStudentInfo(String uuid, String externalToken) {
        return webClient.get()
                .uri("/infos/bac/{uuid}/individu", uuid)
                .header("Authorization", externalToken)
                .retrieve()
                .bodyToMono(Object.class)
                .onErrorMap(WebClientResponseException.class, e -> {
                    log.error("Failed to fetch student info: {}", e.getResponseBodyAsString());
                    return new ApiException(
                            "Failed to fetch student info: " + e.getStatusText(),
                            HttpStatus.valueOf(e.getStatusCode().value()));
                })
                .onErrorMap(e -> !(e instanceof ApiException), e -> {
                    log.error("Error fetching student info", e);
                    return new ApiException("Failed to fetch student info", HttpStatus.INTERNAL_SERVER_ERROR);
                });
    }

    @SuppressWarnings("unchecked")
    private Mono<Void> validateCardOwnership(String uuid, String cardId, String externalToken) {        
        Optional<Set<String>> cached = externalTokenStore.getAllowedCards(uuid);
        if (cached.isPresent()) {
            if (cached.get().contains(cardId)) {
                return Mono.empty();
            }
            log.warn("SECURITY: User {} attempted to access cardId {} which doesn't belong to them",
                    uuid, cardId);
            return Mono.error(new ApiException(
                    "Access denied: You can only access your own academic records",
                    HttpStatus.FORBIDDEN));
        }

        // Cache miss: fetch student data, cache the card IDs, then validate
        return getStudentData(uuid, externalToken)
                .flatMap(studentData -> {
                    if (studentData instanceof List<?> dias) {
                        Set<String> allowedCards = ((List<Map<String, Object>>) dias).stream()
                                .map(dia -> dia.get("id"))
                                .filter(Objects::nonNull)
                                .map(String::valueOf)
                                .collect(Collectors.toSet());

                        externalTokenStore.storeAllowedCards(uuid, allowedCards, CARD_CACHE_TTL);

                        if (allowedCards.contains(cardId)) {
                            return Mono.<Void>empty();
                        }

                        log.warn("SECURITY: User {} attempted to access cardId {} which doesn't belong to them",
                                uuid, cardId);
                        return Mono.<Void>error(new ApiException(
                                "Access denied: You can only access your own academic records",
                                HttpStatus.FORBIDDEN));
                    }

                    log.warn("SECURITY: Could not validate cardId ownership for user {}", uuid);
                    return Mono.<Void>error(new ApiException(
                            "Unable to validate access permissions",
                            HttpStatus.FORBIDDEN));
                });
    }

    public Mono<Object> getCCGradesSecure(String uuid, String cardId, String externalToken) {
        return validateCardOwnership(uuid, cardId, externalToken)
                .then(webClient.get()
                        .uri("/infos/controleContinue/dia/{cardId}/notesCC", cardId)
                        .header("Authorization", externalToken)
                        .retrieve()
                        .bodyToMono(Object.class))
                .onErrorMap(WebClientResponseException.class, e -> {
                    log.error("Failed to fetch CC grades: {}", e.getResponseBodyAsString());
                    return new ApiException(
                            "Failed to fetch CC grades: " + e.getStatusText(),
                            HttpStatus.valueOf(e.getStatusCode().value()));
                })
                .onErrorMap(e -> !(e instanceof ApiException), e -> {
                    log.error("Error fetching CC grades", e);
                    return new ApiException("Failed to fetch CC grades", HttpStatus.INTERNAL_SERVER_ERROR);
                });
    }

    public Mono<Object> getExamGradesSecure(String uuid, String cardId, String externalToken) {
        return validateCardOwnership(uuid, cardId, externalToken)
                .then(webClient.get()
                        .uri("/infos/planningSession/dia/{cardId}/noteExamens", cardId)
                        .header("Authorization", externalToken)
                        .retrieve()
                        .bodyToMono(Object.class))
                .onErrorMap(WebClientResponseException.class, e -> {
                    log.error("Failed to fetch Exam grades: {}", e.getResponseBodyAsString());
                    return new ApiException(
                            "Failed to fetch Exam grades: " + e.getStatusText(),
                            HttpStatus.valueOf(e.getStatusCode().value()));
                })
                .onErrorMap(e -> !(e instanceof ApiException), e -> {
                    log.error("Error fetching Exam grades", e);
                    return new ApiException("Failed to fetch Exam grades", HttpStatus.INTERNAL_SERVER_ERROR);
                });
    }

    public Mono<Object> getStudentPhoto(String uuid, String externalToken) {
        return webClient.get()
                .uri("/infos/image/{uuid}", uuid)
                .header("Authorization", externalToken)
                .retrieve()
                .bodyToMono(String.class)
                .cast(Object.class)
                .onErrorResume(WebClientResponseException.class, e -> {
                    log.error("Failed to fetch student photo: {}", e.getResponseBodyAsString());
                    if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                        return Mono.empty();
                    }
                    return Mono.error(new ApiException(
                            "Failed to fetch student photo: " + e.getStatusText(),
                            HttpStatus.valueOf(e.getStatusCode().value())));
                })
                .onErrorMap(e -> !(e instanceof ApiException), e -> {
                    log.error("Error fetching student photo", e);
                    return new ApiException("Failed to fetch student photo", HttpStatus.INTERNAL_SERVER_ERROR);
                });
    }

    public Mono<Object> getSubjects(String offerId, String levelId, String externalToken) {
        return webClient.get()
                .uri("/infos/offreFormation/{offerId}/niveau/{levelId}/Coefficients", offerId, levelId)
                .header("Authorization", externalToken)
                .retrieve()
                .bodyToMono(Object.class)
                .onErrorMap(WebClientResponseException.class, e -> {
                    log.error("Failed to fetch subjects: {}", e.getResponseBodyAsString());
                    return new ApiException(
                            "Failed to fetch subjects: " + e.getStatusText(),
                            HttpStatus.valueOf(e.getStatusCode().value()));
                })
                .onErrorMap(e -> !(e instanceof ApiException), e -> {
                    log.error("Error fetching subjects", e);
                    return new ApiException("Failed to fetch subjects", HttpStatus.INTERNAL_SERVER_ERROR);
                });
    }
}
