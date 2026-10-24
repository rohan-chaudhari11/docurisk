package com.docurisk.backend.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "clause_diffs")
public class ClauseDiffEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comparison_id", nullable = false)
    private DocumentComparisonEntity comparison;

    @Column(name = "clause_title", nullable = false)
    private String clauseTitle;

    @Column(name = "diff_type", nullable = false)
    private String diffType;

    @Column(name = "severity", nullable = false)
    private String severity;

    @Column(name = "old_text", columnDefinition = "MEDIUMTEXT")
    private String oldText;

    @Column(name = "new_text", columnDefinition = "MEDIUMTEXT")
    private String newText;

    @Column(name = "risk_assessment", columnDefinition = "TEXT", nullable = false)
    private String riskAssessment;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    public ClauseDiffEntity() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public DocumentComparisonEntity getComparison() { return comparison; }
    public void setComparison(DocumentComparisonEntity comparison) { this.comparison = comparison; }

    public String getClauseTitle() { return clauseTitle; }
    public void setClauseTitle(String clauseTitle) { this.clauseTitle = clauseTitle; }

    public String getDiffType() { return diffType; }
    public void setDiffType(String diffType) { this.diffType = diffType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getOldText() { return oldText; }
    public void setOldText(String oldText) { this.oldText = oldText; }

    public String getNewText() { return newText; }
    public void setNewText(String newText) { this.newText = newText; }

    public String getRiskAssessment() { return riskAssessment; }
    public void setRiskAssessment(String riskAssessment) { this.riskAssessment = riskAssessment; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
