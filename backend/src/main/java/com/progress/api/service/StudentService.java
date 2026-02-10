package com.progress.api.service;

import com.progress.api.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final WebClient webClient;

    public Object getStudentData(String uuid, String externalToken) {
        try {
            return webClient.get()
                    .uri("/infos/bac/{uuid}/dias", uuid)
                    .header("Authorization", externalToken)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch student data: {}", e.getResponseBodyAsString());
            throw new ApiException(
                    "Failed to fetch student data: " + e.getStatusText(),
                    HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            log.error("Error fetching student data", e);
            throw new ApiException("Failed to fetch student data", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public Object getExamData(String uuid, String id, String externalToken) {
        try {
            return webClient.get()
                    .uri("/infos/bac/{uuid}/dias/{id}/periode/bilans", uuid, id)
                    .header("Authorization", externalToken)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch exam data: {}", e.getResponseBodyAsString());
            throw new ApiException(
                    "Failed to fetch exam data: " + e.getStatusText(),
                    HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            log.error("Error fetching exam data", e);
            throw new ApiException("Failed to fetch exam data", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public Object getStudentInfo(String uuid, String externalToken) {
        try {
            return webClient.get()
                    .uri("/infos/bac/{uuid}/individu", uuid)
                    .header("Authorization", externalToken)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch student info: {}", e.getResponseBodyAsString());
            throw new ApiException(
                    "Failed to fetch student info: " + e.getStatusText(),
                    HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            log.error("Error fetching student info", e);
            throw new ApiException("Failed to fetch student info", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @SuppressWarnings("unchecked")
    private void validateCardOwnership(String uuid, String cardId, String externalToken) {
        Object studentData = getStudentData(uuid, externalToken);

        if (studentData instanceof java.util.List) {
            java.util.List<java.util.Map<String, Object>> dias = (java.util.List<java.util.Map<String, Object>>) studentData;

            boolean cardBelongsToUser = dias.stream()
                    .anyMatch(dia -> {
                        Object id = dia.get("id");
                        return id != null && String.valueOf(id).equals(cardId);
                    });

            if (!cardBelongsToUser) {
                log.warn("SECURITY: User {} attempted to access cardId {} which doesn't belong to them",
                        uuid, cardId);
                throw new ApiException(
                        "Access denied: You can only access your own academic records",
                        HttpStatus.FORBIDDEN);
            }
        } else {
            log.warn("SECURITY: Could not validate cardId ownership for user {}", uuid);
            throw new ApiException(
                    "Unable to validate access permissions",
                    HttpStatus.FORBIDDEN);
        }
    }

    public Object getCCGradesSecure(String uuid, String cardId, String externalToken) {
        try {
            validateCardOwnership(uuid, cardId, externalToken);

            return webClient.get()
                    .uri("/infos/controleContinue/dia/{cardId}/notesCC", cardId)
                    .header("Authorization", externalToken)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();

        } catch (ApiException e) {
            throw e;
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch CC grades: {}", e.getResponseBodyAsString());
            throw new ApiException(
                    "Failed to fetch CC grades: " + e.getStatusText(),
                    HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            log.error("Error fetching CC grades", e);
            throw new ApiException("Failed to fetch CC grades", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public Object getExamGradesSecure(String uuid, String cardId, String externalToken) {
        try {
            validateCardOwnership(uuid, cardId, externalToken);

            return webClient.get()
                    .uri("/infos/planningSession/dia/{cardId}/noteExamens", cardId)
                    .header("Authorization", externalToken)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();

        } catch (ApiException e) {
            throw e;
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch Exam grades: {}", e.getResponseBodyAsString());
            throw new ApiException(
                    "Failed to fetch Exam grades: " + e.getStatusText(),
                    HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            log.error("Error fetching Exam grades", e);
            throw new ApiException("Failed to fetch Exam grades", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public Object getStudentPhoto(String uuid, String externalToken) {
        try {
            return webClient.get()
                    .uri("/infos/image/{uuid}", uuid)
                    .header("Authorization", externalToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch student photo: {}", e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null;
            }
            throw new ApiException(
                    "Failed to fetch student photo: " + e.getStatusText(),
                    HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            log.error("Error fetching student photo", e);
            throw new ApiException("Failed to fetch student photo", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public Object getSubjects(String offerId, String levelId, String externalToken) {
        try {
            return webClient.get()
                    .uri("/infos/offreFormation/{offerId}/niveau/{levelId}/Coefficients", offerId, levelId)
                    .header("Authorization", externalToken)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch subjects: {}", e.getResponseBodyAsString());
            throw new ApiException(
                    "Failed to fetch subjects: " + e.getStatusText(),
                    HttpStatus.valueOf(e.getStatusCode().value()));
        } catch (Exception e) {
            log.error("Error fetching subjects", e);
            throw new ApiException("Failed to fetch subjects", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
