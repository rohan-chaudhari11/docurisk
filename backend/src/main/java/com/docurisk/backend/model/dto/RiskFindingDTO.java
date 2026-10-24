package com.docurisk.backend.model.dto;

public class RiskFindingDTO {
    private String id;
    private String title;
    private String severity;
    private String category;
    private String clauseReference;
    private String explanation;
    private String evidenceSnippet;
    private String recommendation;
    private Integer pageNumber;
    private String findingSource;
    private Boolean isEvidenceVerified;
    private String evidenceStatus;

    public RiskFindingDTO() {}

    public RiskFindingDTO(String id, String title, String severity, String category,
                          String clauseReference, String explanation, String evidenceSnippet,
                          String recommendation, Integer pageNumber) {
        this(id, title, severity, category, clauseReference, explanation, evidenceSnippet, recommendation, pageNumber, null, null, null);
    }

    public RiskFindingDTO(String id, String title, String severity, String category,
                          String clauseReference, String explanation, String evidenceSnippet,
                          String recommendation, Integer pageNumber, String findingSource,
                          Boolean isEvidenceVerified, String evidenceStatus) {
        this.id = id;
        this.title = title;
        this.severity = severity;
        this.category = category;
        this.clauseReference = clauseReference;
        this.explanation = explanation;
        this.evidenceSnippet = evidenceSnippet;
        this.recommendation = recommendation;
        this.pageNumber = pageNumber;
        this.findingSource = findingSource;
        this.isEvidenceVerified = isEvidenceVerified;
        this.evidenceStatus = evidenceStatus;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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
}
