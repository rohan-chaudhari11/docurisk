package com.docurisk.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_findings")
public class RiskFindingEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private DocumentEntity document;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "severity", nullable = false)
    private String severity;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "clause_reference", nullable = false)
    private String clauseReference;

    @Column(name = "explanation", columnDefinition = "TEXT", nullable = false)
    private String explanation;

    @Column(name = "evidence_snippet", columnDefinition = "MEDIUMTEXT", nullable = false)
    private String evidenceSnippet;

    @Column(name = "recommendation", columnDefinition = "TEXT", nullable = false)
    private String recommendation;

    @Column(name = "page_number", nullable = false)
    private Integer pageNumber = 1;

    @Column(name = "finding_source", length = 32)
    private String findingSource;

    @Column(name = "is_evidence_verified")
    private Boolean isEvidenceVerified;

    @Column(name = "evidence_status", length = 32)
    private String evidenceStatus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public RiskFindingEntity() {
    }

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public DocumentEntity getDocument() { return document; }
    public void setDocument(DocumentEntity document) { this.document = document; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getClauseReference() { return clauseReference; }
    public void setClauseReference(String clauseReference) { this.clauseReference = clauseReference; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getEvidenceSnippet() { return evidenceSnippet; }
    public void setEvidenceSnippet(String evidenceSnippet) { this.evidenceSnippet = evidenceSnippet; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }

    public String getFindingSource() { return findingSource; }
    public void setFindingSource(String findingSource) { this.findingSource = findingSource; }

    public Boolean getIsEvidenceVerified() { return isEvidenceVerified; }
    public void setIsEvidenceVerified(Boolean isEvidenceVerified) { this.isEvidenceVerified = isEvidenceVerified; }

    public String getEvidenceStatus() { return evidenceStatus; }
    public void setEvidenceStatus(String evidenceStatus) { this.evidenceStatus = evidenceStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
