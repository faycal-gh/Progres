package com.progress.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.progress.api.dto.RecommendationRequest;
import com.progress.api.dto.RecommendationResponse;
import com.progress.api.dto.RecommendationResponse.CurrentStatus;
import com.progress.api.dto.RecommendationResponse.Recommendation;
import com.progress.api.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

record UniversityLookupResult(JsonNode structure, boolean isSupported, String fallbackName) {
}

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final StudentService studentService;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            You are an expert academic advisor for the Algerian university system (LMD format).
            Your role is to analyze student academic performance and recommend the best majors/specialities.

            You will receive:
            1. Student's current academic information (field, major, level, grades)
            2. Available options for the next academic level (with exact names)
            3. Optional: Student's preferences and career interests

            CRITICAL RULES:
            - You may ONLY recommend options that are explicitly listed in the "Available Options" section
            - Do NOT create, invent, or suggest options not in the provided list
            - If availableOptions is empty but there's a "note", explain the situation to the student
            - If the student is in their final year (M2), congratulate them on upcoming graduation

            Based on this information, provide personalized recommendations with:
            - Match scores (0-100) based on the student's strengths
            - Clear reasoning for each recommendation
            - Key subjects they'll study
            - Potential career outcomes

            Always respond in valid JSON format matching this structure:
            {
              "recommendations": [
                {
                  "code": "option_code",
                  "name": "French name",
                  "type": "major|speciality|master_speciality",
                  "matchScore": 85,
                  "reasoning": "Explanation of why this option suits the student",
                  "keySubjects": ["subject1", "subject2"],
                  "careerOutcomes": ["career1", "career2"],
                  "furtherOptions": ["future_option_code"]
                }
              ],
              "summary": "Overall analysis summary in 2-3 sentences"
            }

            If no options are available (e.g., final year student), return empty recommendations with an appropriate summary.
            Prioritize options where the student has shown strong performance in related subjects.
            Be encouraging but realistic. Give honest assessments.
            """;

    /**
     * Generate recommendations for a student based on their academic data.
     *
     * @param uuid          Student's UUID
     * @param externalToken Token for accessing PROGRES API
     * @param request       Optional preferences from the student
     * @return AI-generated recommendations
     */
    public RecommendationResponse getRecommendations(
            String uuid,
            String externalToken,
            RecommendationRequest request) {
        try {
            Object studentDataRaw = studentService.getStudentData(uuid, externalToken);
            JsonNode studentData = objectMapper.valueToTree(studentDataRaw);

            CurrentStatus currentStatus = extractCurrentStatus(studentData);

            String universityName = null;
            if (studentData.isArray() && !studentData.isEmpty()) {
                universityName = getTextOrNull(studentData.get(0), "llEtablissementLatin");
            }

            UniversityLookupResult lookupResult = loadAcademicStructure(universityName);

            if (!lookupResult.isSupported()) {
                log.info("University '{}' not supported, returning early without AI recommendations", universityName);
                return RecommendationResponse.builder()
                        .currentStatus(currentStatus)
                        .recommendations(java.util.Collections.emptyList())
                        .summary(null)
                        .model(null)
                        .universitySupported(false)
                        .fallbackUniversity(lookupResult.fallbackName())
                        .build();
            }

            JsonNode academicStructure = lookupResult.structure();

            String[] universityInfo = getUniversityInfo(academicStructure);
            currentStatus.setUniversity(universityInfo[0]);
            currentStatus.setUniversityAr(universityInfo[1]);

            JsonNode availableOptions = findAvailableOptions(
                    academicStructure,
                    currentStatus.getField(),
                    currentStatus.getLevel(),
                    currentStatus.getMajor(),
                    currentStatus.getSpeciality());

            if (availableOptions == null) {
                log.info("Field '{}' not supported for university '{}', returning early without AI recommendations",
                        currentStatus.getField(), universityName);
                return RecommendationResponse.builder()
                        .currentStatus(currentStatus)
                        .recommendations(java.util.Collections.emptyList())
                        .summary(null)
                        .model(null)
                        .universitySupported(true)
                        .fieldSupported(false)
                        .unsupportedReason("تشكيلة تخصصكم (" +
                                (currentStatus.getFieldAr() != null ? currentStatus.getFieldAr()
                                        : currentStatus.getField())
                                +
                                ") غير متوفرة بعد في نظام التوصيات")
                        .build();
            }

            String examData = fetchExamDataSafe(uuid, studentData, externalToken);

            String userPrompt = buildUserPrompt(currentStatus, availableOptions, examData, request);

            String aiResponse = groqClient.chat(SYSTEM_PROMPT, userPrompt);

            RecommendationResponse response = parseAiResponse(aiResponse, currentStatus);
            response.setUniversitySupported(true);
            response.setFieldSupported(true);
            return response;

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error generating recommendations", e);
            throw new ApiException(
                    "Failed to generate recommendations: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private CurrentStatus extractCurrentStatus(JsonNode studentData) {
        if (studentData.isArray() && !studentData.isEmpty()) {
            JsonNode latestRegistration = studentData.get(0);

            return CurrentStatus.builder()
                    .field(getTextOrNull(latestRegistration, "llFiliere", "ofLlFiliere"))
                    .fieldAr(getTextOrNull(latestRegistration, "llFiliereArabe", "ofLlFiliereArabe"))
                    .major(getTextOrNull(latestRegistration, "ofLlFiliere"))
                    .majorAr(getTextOrNull(latestRegistration, "ofLlFiliereArabe"))
                    .speciality(getTextOrNull(latestRegistration, "ofLlSpecialite"))
                    .specialityAr(getTextOrNull(latestRegistration, "ofLlSpecialiteArabe"))
                    .level(getTextOrNull(latestRegistration, "refLibelleNiveau"))
                    .levelAr(getTextOrNull(latestRegistration, "refLibelleNiveauArabe"))
                    .currentAverage(
                            latestRegistration.has("lastMoyenne") ? latestRegistration.get("lastMoyenne").asDouble()
                                    : null)
                    .academicYear(getTextOrNull(latestRegistration, "anneeAcademiqueCode"))
                    .build();
        }

        throw new ApiException("No academic registration found for student", HttpStatus.NOT_FOUND);
    }

    private String getTextOrNull(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            if (node.has(fieldName) && !node.get(fieldName).isNull()) {
                String text = node.get(fieldName).asText();
                if (!text.isBlank()) {
                    return text;
                }
            }
        }
        return null;
    }

    private String normalizeUniversityName(String name) {
        if (name == null || name.isBlank())
            return null;
        return name.toLowerCase()
                .replaceAll("[àáâãäå]", "a")
                .replaceAll("[èéêë]", "e")
                .replaceAll("[ìíîï]", "i")
                .replaceAll("[òóôõö]", "o")
                .replaceAll("[ùúûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "_");
    }

    private UniversityLookupResult loadAcademicStructure(String universityName) throws IOException {
        ClassPathResource resource = new ClassPathResource("data/academic-structure.json");
        try (InputStream is = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            JsonNode universities = root.path("universities");

            if (universityName == null || universityName.isBlank()) {
                Map.Entry<String, JsonNode> first = universities.fields().next();
                String fallbackName = first.getValue().path("name").asText();
                log.info("No university specified, using default: {}", fallbackName);
                return new UniversityLookupResult(first.getValue(), false, fallbackName);
            }

            String normalizedKey = normalizeUniversityName(universityName);
            log.info("Looking for university with key: {}", normalizedKey);

            JsonNode university = universities.path(normalizedKey);
            if (!university.isMissingNode()) {
                log.info("Found exact match for university: {}", university.path("name").asText());
                return new UniversityLookupResult(university, true, null);
            }

            Iterator<Map.Entry<String, JsonNode>> fields = universities.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String key = entry.getKey();

                if (key.contains(normalizedKey) || normalizedKey.contains(key)) {
                    log.info("Found partial match for university: {}", entry.getValue().path("name").asText());
                    return new UniversityLookupResult(entry.getValue(), true, null);
                }
            }

            Map.Entry<String, JsonNode> first = universities.fields().next();
            String fallbackName = first.getValue().path("name").asText();
            log.warn("No match found for '{}', using fallback: {}", universityName, fallbackName);
            return new UniversityLookupResult(first.getValue(), false, fallbackName);
        }
    }

    private String[] getUniversityInfo(JsonNode structure) {
        return new String[] {
                structure.path("name").asText("Unknown University"),
                structure.path("nameAr").asText("")
        };
    }

    private JsonNode findAvailableOptions(JsonNode structure, String currentField, String currentLevel,
            String currentMajor, String currentSpeciality) {
        JsonNode fields = structure.path("fields");
        if (!fields.isArray() || currentField == null) {
            return null; // Field not supported
        }

        String normalizedCurrentField = normalizeFieldName(currentField);
        JsonNode matchedField = null;

        // Find matching field
        for (JsonNode field : fields) {
            String fieldName = field.path("name").asText();
            String fieldNameAr = field.path("nameAr").asText("");
            String normalizedFieldName = normalizeFieldName(fieldName);

            if (normalizedCurrentField.equals(normalizedFieldName) ||
                    normalizedCurrentField.contains(normalizedFieldName) ||
                    normalizedFieldName.contains(normalizedCurrentField) ||
                    currentField.contains(fieldNameAr) ||
                    fieldNameAr.contains(currentField)) {
                log.info("Found field match: {} -> {}", currentField, fieldName);
                matchedField = field;
                break;
            }
        }

        if (matchedField == null) {
            log.warn("Field '{}' not found in academic structure", currentField);
            return null; // Field not supported
        }

        String levelCode = extractLevelCode(currentLevel);
        log.info("Extracted level code: {} from '{}'", levelCode, currentLevel);
        return extractNextOptions(matchedField.path("levels"), levelCode, currentMajor, currentSpeciality);
    }

    private String extractLevelCode(String levelName) {
        if (levelName == null)
            return "L1";

        String lowerLevel = levelName.toLowerCase();

        // ===== ENGINEERING / CLASSIC SYSTEM =====

        // CPI - Cycle Préparatoire Intégré (prep years 1-2)
        if (lowerLevel.contains("cpi") || lowerLevel.contains("préparatoire intégré") ||
                lowerLevel.contains("classe préparatoire")) {
            if (lowerLevel.contains("1") || lowerLevel.contains("première") || lowerLevel.contains("أولى")) {
                return "1CPI";
            } else if (lowerLevel.contains("2") || lowerLevel.contains("deuxième") || lowerLevel.contains("ثانية")) {
                return "2CPI";
            }
            return "1CPI";
        }

        // CS - Cycle Supérieur (engineering years 3-5)
        if (lowerLevel.contains("cycle supérieur") || lowerLevel.contains("cs")) {
            if (lowerLevel.contains("1") || lowerLevel.contains("première") || lowerLevel.contains("أولى")) {
                return "1CS";
            } else if (lowerLevel.contains("2") || lowerLevel.contains("deuxième") || lowerLevel.contains("ثانية")) {
                return "2CS";
            } else if (lowerLevel.contains("3") || lowerLevel.contains("troisième") || lowerLevel.contains("ثالثة")) {
                return "3CS";
            }
            return "1CS";
        }

        // Generic engineering year detection (e.g., "3ème année ingénieur")
        if (lowerLevel.contains("ingénieur") || lowerLevel.contains("مهندس")) {
            if (lowerLevel.contains("1") || lowerLevel.contains("première")) {
                return "1CPI"; // Year 1 = 1st prep
            } else if (lowerLevel.contains("2") || lowerLevel.contains("deuxième")) {
                return "2CPI"; // Year 2 = 2nd prep
            } else if (lowerLevel.contains("3") || lowerLevel.contains("troisième")) {
                return "1CS"; // Year 3 = 1st senior
            } else if (lowerLevel.contains("4") || lowerLevel.contains("quatrième")) {
                return "2CS"; // Year 4 = 2nd senior
            } else if (lowerLevel.contains("5") || lowerLevel.contains("cinquième")) {
                return "3CS"; // Year 5 = 3rd senior (final)
            }
        }

        if (lowerLevel.contains("master") || lowerLevel.contains("ماستر")) {
            if (lowerLevel.contains("1") || lowerLevel.contains("أولى") || lowerLevel.contains("première")) {
                return "M1";
            } else if (lowerLevel.contains("2") || lowerLevel.contains("ثانية") || lowerLevel.contains("deuxième")) {
                return "M2";
            }
            return "M1";
        }

        if (lowerLevel.contains("licence") || lowerLevel.contains("ليسانس")) {
            if (lowerLevel.contains("1") || lowerLevel.contains("أولى") || lowerLevel.contains("première")) {
                return "L1";
            } else if (lowerLevel.contains("2") || lowerLevel.contains("ثانية") || lowerLevel.contains("deuxième")) {
                return "L2";
            } else if (lowerLevel.contains("3") || lowerLevel.contains("ثالثة") || lowerLevel.contains("troisième")) {
                return "L3";
            }
        }

        if (lowerLevel.contains("1") || lowerLevel.contains("أولى") || lowerLevel.contains("première")) {
            return "L1";
        } else if (lowerLevel.contains("2") || lowerLevel.contains("ثانية") || lowerLevel.contains("deuxième")) {
            return "L2";
        } else if (lowerLevel.contains("3") || lowerLevel.contains("ثالثة") || lowerLevel.contains("troisième")) {
            return "L3";
        }

        return "L1"; 
    }

    private JsonNode extractNextOptions(JsonNode levels, String currentLevelCode, String currentMajor,
            String currentSpeciality) {
        var result = objectMapper.createObjectNode();
        var optionsList = objectMapper.createArrayNode();

        String normMajor = normalizeFieldName(currentMajor);
        String normSpeciality = normalizeFieldName(currentSpeciality);

        switch (currentLevelCode) {
            case "L1":
                JsonNode l1 = levels.path("L1");
                JsonNode l1NextOptions = l1.path("nextOptions");
                if (l1NextOptions.isArray()) {
                    JsonNode l2Majors = levels.path("L2").path("majors");
                    for (JsonNode optionCode : l1NextOptions) {
                        JsonNode major = findByCode(l2Majors, optionCode.asText());
                        if (major != null) {
                            var opt = objectMapper.createObjectNode();
                            opt.put("code", optionCode.asText());
                            opt.put("name", major.path("name").asText());
                            opt.put("type", "major");
                            optionsList.add(opt);
                        }
                    }
                }
                result.put("nextLevel", "L2 (2ème année Licence)");
                break;

            case "L2":
                result.put("nextLevel", "L3 (3ème année Licence)");

                String currentMajorCode = null;
                JsonNode l2Majors = levels.path("L2").path("majors");
                if (l2Majors.isArray()) {
                    for (JsonNode major : l2Majors) {
                        if (isMatch(major.path("name").asText(), major.path("nameAr").asText(), normMajor)) {
                            currentMajorCode = major.path("code").asText();
                            break;
                        }
                    }
                }

                JsonNode l3Specs = levels.path("L3").path("specialities");
                if (l3Specs.isArray()) {
                    for (JsonNode spec : l3Specs) {
                        String parentMajor = spec.path("parentMajor").asText();
                        if (currentMajorCode == null || parentMajor.equals(currentMajorCode)) {
                            var opt = objectMapper.createObjectNode();
                            opt.put("code", spec.path("code").asText());
                            opt.put("name", spec.path("name").asText());
                            opt.put("type", "speciality");
                            opt.put("parentMajor", parentMajor);
                            optionsList.add(opt);
                        }
                    }
                }
                break;

            case "L3":
                result.put("nextLevel", "M1 (1ère année Master)");

                String currentL3Code = null;
                JsonNode l3Specialities = levels.path("L3").path("specialities");
                if (l3Specialities.isArray()) {
                    for (JsonNode spec : l3Specialities) {
                        if (isMatch(spec.path("name").asText(), spec.path("nameAr").asText(), normSpeciality)) {
                            currentL3Code = spec.path("code").asText();
                            break;
                        }
                    }
                }

                JsonNode masterSpecs = levels.path("Master").path("specialities");
                if (masterSpecs.isArray()) {
                    for (JsonNode spec : masterSpecs) {
                        String parentL3 = spec.path("parentL3").asText();
                        if (currentL3Code == null || parentL3.equals(currentL3Code)) {
                            var opt = objectMapper.createObjectNode();
                            opt.put("code", spec.path("code").asText());
                            opt.put("name", spec.path("name").asText());
                            opt.put("type", "master_speciality");
                            opt.put("parentL3", parentL3);
                            optionsList.add(opt);
                        }
                    }
                }
                break;

            case "M1":                    
                result.put("nextLevel", "M2 (2ème année Master)");
                result.put("note", "You will continue in the same Master speciality for M2.");
                break;

            case "M2":                
                result.put("nextLevel", "Graduation");
                result.put("note", "You are in your final year! No more academic levels after this.");
                break;

            case "1CPI":                
                result.put("nextLevel", "2CPI (2ème année Cycle Préparatoire)");
                result.put("note",
                        "Continue to 2nd year of preparatory cycle. No specialization choices at this stage.");
                break;

            case "2CPI":
                result.put("nextLevel", "1CS (1ère année Cycle Supérieur)");
                JsonNode seniorSpecs = levels.path("CS").path("specialities");
                if (seniorSpecs.isArray()) {
                    for (JsonNode spec : seniorSpecs) {
                        var opt = objectMapper.createObjectNode();
                        opt.put("code", spec.path("code").asText());
                        opt.put("name", spec.path("name").asText());
                        opt.put("type", "engineering_speciality");
                        optionsList.add(opt);
                    }
                }
                if (optionsList.isEmpty()) {
                    result.put("note",
                            "Specializations available at 3CS (final year). Continue with common curriculum for now.");
                }
                break;

            case "1CS":                
                result.put("nextLevel", "2CS (2ème année Cycle Supérieur)");
                result.put("note", "Continue to 2nd year of senior cycle. Main specialization often chosen at 3CS.");
                break;

            case "2CS":
                result.put("nextLevel", "3CS (3ème année Cycle Supérieur - Final Year)");
                JsonNode finalSpecs = levels.path("3CS").path("specialities");
                if (!finalSpecs.isArray()) {
                    finalSpecs = levels.path("CS").path("specialities"); // fallback
                }
                if (finalSpecs.isArray()) {
                    for (JsonNode spec : finalSpecs) {
                        var opt = objectMapper.createObjectNode();
                        opt.put("code", spec.path("code").asText());
                        opt.put("name", spec.path("name").asText());
                        opt.put("type", "final_year_speciality");
                        optionsList.add(opt);
                    }
                }
                if (optionsList.isEmpty()) {
                    result.put("note",
                            "Final year specialization choices will be based on your performance and available spots.");
                }
                break;

            case "3CS":
                result.put("nextLevel", "Graduation - Diploma of State Engineer (Diplôme d'Ingénieur d'État)");
                result.put("note",
                        "Congratulations! You are in your final year. Focus on your PFE (Projet de Fin d'Études) and prepare for your engineering career!");
                break;

            default:
                result.put("note", "Unable to determine next level options for level code: " + currentLevelCode);
        }

        result.set("availableOptions", optionsList);

        if (optionsList.isEmpty() && !result.has("note")) {
            result.put("note", "No specific options found for your current level/major in the system.");
        }

        return result;
    }

    private boolean isMatch(String name, String nameAr, String normalizedSearch) {
        if (normalizedSearch == null || normalizedSearch.isEmpty())
            return false;
        String normName = normalizeFieldName(name);
        return normName.contains(normalizedSearch) || normalizedSearch.contains(normName) ||
                (nameAr != null && nameAr.contains(normalizedSearch)); // loose match for arabic if passed
    }

    private JsonNode findByCode(JsonNode array, String code) {
        if (!array.isArray())
            return null;
        for (JsonNode item : array) {
            if (code.equals(item.path("code").asText())) {
                return item;
            }
        }
        return null;
    }

    private String normalizeFieldName(String name) {
        if (name == null)
            return "";
        return name.toLowerCase()
                .replaceAll("[àâäãå]", "a")
                .replaceAll("[éèêë]", "e")
                .replaceAll("[îï]", "i")
                .replaceAll("[ôöõ]", "o")
                .replaceAll("[ùûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9]", "");
    }

    private String fetchExamDataSafe(String uuid, JsonNode studentData, String externalToken) {
        try {
            if (studentData.isArray() && !studentData.isEmpty()) {
                long diaId = studentData.get(0).path("id").asLong();
                if (diaId > 0) {
                    Object examData = studentService.getExamData(uuid, String.valueOf(diaId), externalToken);
                    return objectMapper.writeValueAsString(examData);
                }
            }
        } catch (Exception e) {
            log.debug("Could not fetch exam data: {}", e.getMessage());
        }
        return "No detailed exam data available";
    }

    private String buildUserPrompt(
            CurrentStatus status,
            JsonNode availableOptions,
            String examData,
            RecommendationRequest request) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("## Student's Current Academic Status\n");
        prompt.append("- Field: ").append(status.getField()).append("\n");
        prompt.append("- Level: ").append(status.getLevel()).append("\n");
        if (status.getMajor() != null) {
            prompt.append("- Major: ").append(status.getMajor()).append("\n");
        }
        if (status.getSpeciality() != null) {
            prompt.append("- Speciality: ").append(status.getSpeciality()).append("\n");
        }
        if (status.getCurrentAverage() != null) {
            prompt.append("- Current Average: ").append(status.getCurrentAverage()).append("/20\n");
        }
        prompt.append("- Academic Year: ").append(status.getAcademicYear()).append("\n\n");

        prompt.append("## Available Options for Next Level\n");
        prompt.append(availableOptions.toPrettyString()).append("\n\n");

        prompt.append("## Exam Data and Grades\n");
        prompt.append(examData).append("\n\n");

        if (request != null) {
            if (request.getCareerPreference() != null) {
                prompt.append("## Student's Career Preference\n");
                prompt.append(request.getCareerPreference()).append("\n\n");
            }
            if (request.getPreferredSubjects() != null && !request.getPreferredSubjects().isEmpty()) {
                prompt.append("## Preferred Subjects\n");
                prompt.append(String.join(", ", request.getPreferredSubjects())).append("\n\n");
            }
            if (request.getAdditionalContext() != null) {
                prompt.append("## Additional Context\n");
                prompt.append(request.getAdditionalContext()).append("\n\n");
            }
        }

        prompt.append(
                "Based on this information, provide 3-5 personalized recommendations for the student's next academic step.");

        return prompt.toString();
    }

    private RecommendationResponse parseAiResponse(String aiResponse, CurrentStatus currentStatus) {
        try {
            JsonNode responseJson = objectMapper.readTree(aiResponse);

            List<Recommendation> recommendations = new ArrayList<>();
            JsonNode recsNode = responseJson.path("recommendations");

            if (recsNode.isArray()) {
                for (JsonNode rec : recsNode) {
                    recommendations.add(Recommendation.builder()
                            .code(rec.path("code").asText())
                            .name(rec.path("name").asText())
                            .type(rec.path("type").asText("speciality"))
                            .matchScore(rec.path("matchScore").asInt(0))
                            .reasoning(rec.path("reasoning").asText())
                            .keySubjects(jsonArrayToList(rec.path("keySubjects")))
                            .careerOutcomes(jsonArrayToList(rec.path("careerOutcomes")))
                            .furtherOptions(jsonArrayToList(rec.path("furtherOptions")))
                            .build());
                }
            }

            // Sort by matchScore descending, then by name ascending for stability
            recommendations.sort((a, b) -> {
                int scoreCompare = Integer.compare(b.getMatchScore(), a.getMatchScore());
                if (scoreCompare != 0) {
                    return scoreCompare;
                }
                return a.getName().compareToIgnoreCase(b.getName());
            });

            return RecommendationResponse.builder()
                    .currentStatus(currentStatus)
                    .recommendations(recommendations)
                    .summary(responseJson.path("summary").asText(""))
                    .model(groqClient.getModel())
                    .build();

        } catch (Exception e) {
            log.error("Error parsing AI response: {}", aiResponse, e);
            throw new ApiException("Failed to parse AI recommendation", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private List<String> jsonArrayToList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        if (arrayNode.isArray()) {
            for (JsonNode item : arrayNode) {
                list.add(item.asText());
            }
        }
        return list;
    }
}
