package com.docurisk.backend.model.dto;

import java.util.List;

public class DocumentDTO {
    private String id;
    private String name;
    private String fileType;
    private Long fileSizeBytes;
    private String uploadedAt;
    private String status;
    private String overallRiskLevel;
    private AnalysisSummaryDTO summary;
    private List<RiskFindingDTO> findings;

    public DocumentDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(String uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOverallRiskLevel() { return overallRiskLevel; }
    public void setOverallRiskLevel(String overallRiskLevel) { this.overallRiskLevel = overallRiskLevel; }

    public AnalysisSummaryDTO getSummary() { return summary; }
    public void setSummary(AnalysisSummaryDTO summary) { this.summary = summary; }

    public List<RiskFindingDTO> getFindings() { return findings; }
    public void setFindings(List<RiskFindingDTO> findings) { this.findings = findings; }
}
