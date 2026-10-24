package com.docurisk.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_summaries")
public class AnalysisSummaryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private DocumentEntity document;

    @Column(name = "executive_summary", columnDefinition = "MEDIUMTEXT", nullable = false)
    private String executiveSummary;

    @Column(name = "compliance_score", nullable = false)
    private Integer complianceScore = 0;

    @Column(name = "total_risks", nullable = false)
    private Integer totalRisks = 0;

    @Column(name = "high_risk_count", nullable = false)
    private Integer highRiskCount = 0;

    @Column(name = "medium_risk_count", nullable = false)
    private Integer mediumRiskCount = 0;

    @Column(name = "low_risk_count", nullable = false)
    private Integer lowRiskCount = 0;

    @Column(name = "actual_provider", length = 64)
    private String actualProvider;

    @Column(name = "execution_status", length = 64)
    private String executionStatus;

    @Column(name = "status_message", length = 512)
    private String statusMessage;

    @Column(name = "model_name", length = 64)
    private String modelName;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public AnalysisSummaryEntity() {
    }

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DocumentEntity getDocument() { return document; }
    public void setDocument(DocumentEntity document) { this.document = document; }

    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }

    public Integer getComplianceScore() { return complianceScore; }
    public void setComplianceScore(Integer complianceScore) { this.complianceScore = complianceScore; }

    public Integer getTotalRisks() { return totalRisks; }
    public void setTotalRisks(Integer totalRisks) { this.totalRisks = totalRisks; }

    public Integer getHighRiskCount() { return highRiskCount; }
    public void setHighRiskCount(Integer highRiskCount) { this.highRiskCount = highRiskCount; }

    public Integer getMediumRiskCount() { return mediumRiskCount; }
    public void setMediumRiskCount(Integer mediumRiskCount) { this.mediumRiskCount = mediumRiskCount; }

    public Integer getLowRiskCount() { return lowRiskCount; }
    public void setLowRiskCount(Integer lowRiskCount) { this.lowRiskCount = lowRiskCount; }

    public String getActualProvider() { return actualProvider; }
    public void setActualProvider(String actualProvider) { this.actualProvider = actualProvider; }

    public String getExecutionStatus() { return executionStatus; }
    public void setExecutionStatus(String executionStatus) { this.executionStatus = executionStatus; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
