package com.docurisk.backend.model.dto;

public class ClauseDiffDTO {
    private String id;
    private String clauseTitle;
    private String diffType;
    private String severity;
    private String oldText;
    private String newText;
    private String riskAssessment;

    public static class RiskImpact {
        private String severity;
        private String description;

        public RiskImpact() {}
        public RiskImpact(String severity, String description) {
            this.severity = severity;
            this.description = description;
        }

        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public ClauseDiffDTO() {}

    public ClauseDiffDTO(String id, String clauseTitle, String diffType, String severity,
                         String oldText, String newText, String riskAssessment) {
        this.id = id;
        this.clauseTitle = clauseTitle;
        this.diffType = diffType;
        this.severity = severity;
        this.oldText = oldText;
        this.newText = newText;
        this.riskAssessment = riskAssessment;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClauseTitle() { return clauseTitle; }
    public void setClauseTitle(String clauseTitle) { this.clauseTitle = clauseTitle; }

    // Frontend alias
    public String getSectionTitle() { return clauseTitle; }
    public void setSectionTitle(String title) { this.clauseTitle = title; }

    public String getDiffType() { return diffType; }
    public void setDiffType(String diffType) { this.diffType = diffType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getOldText() { return oldText; }
    public void setOldText(String oldText) { this.oldText = oldText; }

    // Frontend alias
    public String getOldClause() { return oldText != null ? oldText : ""; }
    public void setOldClause(String clause) { this.oldText = clause; }

    public String getNewText() { return newText; }
    public void setNewText(String newText) { this.newText = newText; }

    // Frontend alias
    public String getNewClause() { return newText != null ? newText : ""; }
    public void setNewClause(String clause) { this.newText = clause; }

    public String getRiskAssessment() { return riskAssessment; }
    public void setRiskAssessment(String riskAssessment) { this.riskAssessment = riskAssessment; }

    // Frontend alias
    public RiskImpact getRiskImpact() {
        return new RiskImpact(severity != null ? severity : "low", riskAssessment != null ? riskAssessment : "");
    }
}
