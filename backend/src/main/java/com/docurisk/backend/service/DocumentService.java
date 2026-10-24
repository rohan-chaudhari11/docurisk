package com.docurisk.backend.service;

import com.docurisk.backend.model.dto.*;
import com.docurisk.backend.model.entity.*;
import com.docurisk.backend.repository.DocumentRepository;
import com.docurisk.backend.repository.RiskFindingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final RiskFindingRepository riskFindingRepository;
    private final AiIntegrationService aiIntegrationService;

    @Autowired
    public DocumentService(DocumentRepository documentRepository,
                           RiskFindingRepository riskFindingRepository,
                           AiIntegrationService aiIntegrationService) {
        this.documentRepository = documentRepository;
        this.riskFindingRepository = riskFindingRepository;
        this.aiIntegrationService = aiIntegrationService;
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> getAllDocuments() {
        return documentRepository.findAllByOrderByUploadedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<DocumentDTO> getDocumentById(String id) {
        return documentRepository.findById(id).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long totalDocs = documentRepository.count();
        long highCount = riskFindingRepository.countBySeverity("high");
        long medCount = riskFindingRepository.countBySeverity("medium");
        long lowCount = riskFindingRepository.countBySeverity("low");
        Double avgCompliance = documentRepository.findAverageComplianceScore();
        long analyzedCount = documentRepository.countByStatus("analyzed");

        Map<String, Integer> categoryMap = new LinkedHashMap<>();
        List<DashboardStatsDTO.RiskDistributionItem> distributionList = new ArrayList<>();

        List<Object[]> grouped = riskFindingRepository.countGroupedByCategory();
        for (Object[] row : grouped) {
            String category = (String) row[0];
            Long count = (Long) row[1];
            categoryMap.put(category, count.intValue());

            // Determine predominant severity for category distribution
            String severity = "medium";
            if ("Legal Liability".equalsIgnoreCase(category) || "Commercial Risk".equalsIgnoreCase(category) || "Financial".equalsIgnoreCase(category)) {
                severity = "high";
            } else if ("Data Privacy".equalsIgnoreCase(category) || "Compliance".equalsIgnoreCase(category)) {
                severity = "medium";
            } else {
                severity = "low";
            }

            distributionList.add(new DashboardStatsDTO.RiskDistributionItem(category, count.intValue(), severity));
        }

        return new DashboardStatsDTO(
                (int) totalDocs,
                (int) highCount,
                (int) medCount,
                (int) lowCount,
                avgCompliance != null ? avgCompliance.intValue() : 78,
                (int) analyzedCount,
                distributionList,
                categoryMap
        );
    }

    @Transactional
    public DocumentDTO uploadAndProcessDocument(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded document file cannot be empty.");
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().trim() : "document.pdf";
        String lowerFilename = filename.toLowerCase();

        String fileType;
        if (lowerFilename.endsWith(".pdf")) {
            fileType = "pdf";
        } else if (lowerFilename.endsWith(".docx")) {
            fileType = "docx";
        } else if (lowerFilename.endsWith(".txt")) {
            fileType = "txt";
        } else {
            throw new IllegalArgumentException("Unsupported file format for '" + filename + "'. Allowed formats: .pdf, .docx, .txt");
        }

        String docId = "doc-" + UUID.randomUUID().toString().substring(0, 8);
        byte[] bytes = file.getBytes();

        DocumentEntity entity = new DocumentEntity();
        entity.setId(docId);
        entity.setName(filename);
        entity.setFileType(fileType);
        entity.setFileSizeBytes(file.getSize());
        entity.setUploadedAt(LocalDateTime.now());
        entity.setStatus("analyzing");

        // Attempt live AI integration call
        Map<String, Object> aiResult = aiIntegrationService.analyzeDocumentFile(filename, bytes);

        if (aiResult != null && aiResult.containsKey("summary")) {
            entity.setStatus("analyzed");
            @SuppressWarnings("unchecked")
            Map<String, Object> summaryMap = (Map<String, Object>) aiResult.get("summary");
            entity.setOverallRiskLevel(String.valueOf(aiResult.getOrDefault("overall_risk_level", "medium")));
            Number compScore = (Number) summaryMap.getOrDefault("compliance_score", 75);
            entity.setComplianceScore(compScore.intValue());

            // 1. Executive Summary & Provider Status Tracking
            AnalysisSummaryEntity summaryEntity = new AnalysisSummaryEntity();
            summaryEntity.setDocument(entity);
            summaryEntity.setExecutiveSummary(String.valueOf(summaryMap.get("executive_summary")));
            summaryEntity.setComplianceScore(compScore.intValue());

            String actualProv = summaryMap.get("actual_provider") != null ? String.valueOf(summaryMap.get("actual_provider")) : "rule";
            String execStatus = summaryMap.get("execution_status") != null ? String.valueOf(summaryMap.get("execution_status")) : "rule_only";
            String statusMsg = summaryMap.get("status_message") != null ? String.valueOf(summaryMap.get("status_message")) : null;
            String modelNm = summaryMap.get("model_name") != null ? String.valueOf(summaryMap.get("model_name")) : null;

            summaryEntity.setActualProvider(actualProv);
            summaryEntity.setExecutionStatus(execStatus);
            summaryEntity.setStatusMessage(statusMsg);
            summaryEntity.setModelName(modelNm);

            @SuppressWarnings("unchecked")
            Map<String, Object> counts = (Map<String, Object>) summaryMap.get("risk_counts");
            if (counts != null) {
                summaryEntity.setHighRiskCount(((Number) counts.getOrDefault("high", 0)).intValue());
                summaryEntity.setMediumRiskCount(((Number) counts.getOrDefault("medium", 0)).intValue());
                summaryEntity.setLowRiskCount(((Number) counts.getOrDefault("low", 0)).intValue());
                summaryEntity.setTotalRisks(summaryEntity.getHighRiskCount() + summaryEntity.getMediumRiskCount() + summaryEntity.getLowRiskCount());
            }
            summaryEntity.setCreatedAt(LocalDateTime.now());
            entity.setSummary(summaryEntity);

            // 2. Key Obligations
            @SuppressWarnings("unchecked")
            List<String> obligations = (List<String>) summaryMap.get("key_obligations");
            if (obligations != null) {
                List<KeyObligationEntity> obligationEntities = new ArrayList<>();
                for (int i = 0; i < obligations.size(); i++) {
                    obligationEntities.add(new KeyObligationEntity(entity, obligations.get(i), i + 1));
                }
                entity.setObligations(obligationEntities);
            }

            // 3. Critical Dates
            @SuppressWarnings("unchecked")
            List<String> dates = (List<String>) summaryMap.get("critical_dates");
            if (dates != null) {
                List<CriticalDateEntity> dateEntities = new ArrayList<>();
                for (int i = 0; i < dates.size(); i++) {
                    String d = dates.get(i);
                    String desc = d;
                    String val = null;
                    if (d.contains(":")) {
                        String[] parts = d.split(":", 2);
                        desc = parts[0].trim();
                        val = parts[1].trim();
                    }
                    dateEntities.add(new CriticalDateEntity(entity, desc, val, i + 1));
                }
                entity.setCriticalDates(dateEntities);
            }

            // 4. Evidence-backed Risk Findings
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> findingsRaw = (List<Map<String, Object>>) aiResult.get("findings");
            if (findingsRaw != null) {
                List<RiskFindingEntity> findingEntities = new ArrayList<>();
                for (Map<String, Object> fMap : findingsRaw) {
                    RiskFindingEntity finding = new RiskFindingEntity();
                    finding.setId(fMap.get("id") != null ? String.valueOf(fMap.get("id")) : "find-" + UUID.randomUUID().toString().substring(0, 8));
                    finding.setDocument(entity);
                    finding.setTitle(String.valueOf(fMap.getOrDefault("title", "Risk Finding")));
                    finding.setSeverity(String.valueOf(fMap.getOrDefault("severity", "medium")));
                    finding.setCategory(String.valueOf(fMap.getOrDefault("category", "General")));
                    finding.setClauseReference(String.valueOf(fMap.getOrDefault("clause_reference", "General Terms")));
                    finding.setExplanation(String.valueOf(fMap.getOrDefault("explanation", "")));
                    finding.setEvidenceSnippet(String.valueOf(fMap.getOrDefault("evidence_snippet", "")));
                    finding.setRecommendation(String.valueOf(fMap.getOrDefault("recommendation", "")));
                    Number pageNum = (Number) fMap.getOrDefault("page_number", 1);
                    finding.setPageNumber(pageNum != null ? pageNum.intValue() : 1);
                    finding.setFindingSource(fMap.get("finding_source") != null ? String.valueOf(fMap.get("finding_source")) : "rule");
                    Object isVerified = fMap.get("is_evidence_verified");
                    finding.setIsEvidenceVerified(isVerified instanceof Boolean ? (Boolean) isVerified : Boolean.TRUE);
                    finding.setEvidenceStatus(fMap.get("evidence_status") != null ? String.valueOf(fMap.get("evidence_status")) : "verified");
                    finding.setCreatedAt(LocalDateTime.now());
                    findingEntities.add(finding);
                }
                entity.setFindings(findingEntities);
            }
        } else {
            // Real failure handling: mark as failed without mock replacement
            entity.setStatus("failed");
            entity.setOverallRiskLevel("medium");
            entity.setComplianceScore(0);

            AnalysisSummaryEntity summaryEntity = new AnalysisSummaryEntity();
            summaryEntity.setDocument(entity);
            summaryEntity.setExecutiveSummary("Document metadata recorded, but text extraction or risk analysis failed because the AI service is offline or unreachable.");
            summaryEntity.setComplianceScore(0);
            summaryEntity.setTotalRisks(0);
            summaryEntity.setHighRiskCount(0);
            summaryEntity.setMediumRiskCount(0);
            summaryEntity.setLowRiskCount(0);
            summaryEntity.setActualProvider("none");
            summaryEntity.setExecutionStatus("failed");
            summaryEntity.setStatusMessage("AI service unreachable or returned HTTP error.");
            summaryEntity.setModelName(null);
            summaryEntity.setCreatedAt(LocalDateTime.now());
            entity.setSummary(summaryEntity);
        }

        DocumentEntity saved = documentRepository.save(entity);
        return mapToDTO(saved);
    }

    private DocumentDTO mapToDTO(DocumentEntity entity) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setFileType(entity.getFileType());
        dto.setFileSizeBytes(entity.getFileSizeBytes());
        dto.setStatus(entity.getStatus());
        dto.setOverallRiskLevel(entity.getOverallRiskLevel());
        dto.setUploadedAt(entity.getUploadedAt() != null ? entity.getUploadedAt().format(DateTimeFormatter.ISO_DATE_TIME) : "");

        if (entity.getSummary() != null) {
            AnalysisSummaryEntity s = entity.getSummary();
            Map<String, Integer> counts = new HashMap<>();
            counts.put("high", s.getHighRiskCount());
            counts.put("medium", s.getMediumRiskCount());
            counts.put("low", s.getLowRiskCount());

            List<String> obligations = entity.getObligations() != null ? entity.getObligations().stream()
                    .map(KeyObligationEntity::getObligationText)
                    .collect(Collectors.toList()) : new ArrayList<>();

            List<String> dates = entity.getCriticalDates() != null ? entity.getCriticalDates().stream()
                    .map(d -> d.getDateDescription() + (d.getDateValue() != null ? ": " + d.getDateValue() : ""))
                    .collect(Collectors.toList()) : new ArrayList<>();

            String actualProv = s.getActualProvider();
            String execStatus = s.getExecutionStatus();
            String statusMsg = s.getStatusMessage();
            String modelNm = s.getModelName();

            // For legacy records that pre-date provider tracking, return explicit legacy status
            if (execStatus == null) {
                execStatus = "legacy";
                if ("failed".equalsIgnoreCase(entity.getStatus())) {
                    statusMsg = "Provider status unknown — legacy record (document processing failed during historical ingestion)";
                } else {
                    statusMsg = "Provider status unknown — legacy analysis";
                }
            }

            dto.setSummary(new AnalysisSummaryDTO(
                    s.getExecutiveSummary(),
                    obligations,
                    dates,
                    s.getComplianceScore(),
                    s.getTotalRisks(),
                    counts,
                    actualProv,
                    execStatus,
                    statusMsg,
                    modelNm
            ));
        }

        if (entity.getFindings() != null) {
            dto.setFindings(entity.getFindings().stream()
                    .map(f -> new RiskFindingDTO(
                            f.getId(),
                            f.getTitle(),
                            f.getSeverity(),
                            f.getCategory(),
                            f.getClauseReference(),
                            f.getExplanation(),
                            f.getEvidenceSnippet(),
                            f.getRecommendation(),
                            f.getPageNumber(),
                            f.getFindingSource() != null ? f.getFindingSource() : "unknown",
                            f.getIsEvidenceVerified(),
                            f.getEvidenceStatus() != null ? f.getEvidenceStatus() : "unknown"
                    ))
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
