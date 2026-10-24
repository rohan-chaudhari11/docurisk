package com.docurisk.backend.model.dto;

import java.util.List;

public class VersionComparisonDTO {
    private String id;
    private String title;
    private String baseDocumentId;
    private String targetDocumentId;
    private String baseVersionLabel;
    private String targetVersionLabel;
    private List<ClauseDiffDTO> diffs;

    public static class VersionMeta {
        private String versionNumber;
        private String uploadedDate;
        private String fileName;

        public VersionMeta() {}
        public VersionMeta(String versionNumber, String uploadedDate, String fileName) {
            this.versionNumber = versionNumber;
            this.uploadedDate = uploadedDate;
            this.fileName = fileName;
        }

        public String getVersionNumber() { return versionNumber; }
        public void setVersionNumber(String versionNumber) { this.versionNumber = versionNumber; }

        public String getUploadedDate() { return uploadedDate; }
        public void setUploadedDate(String uploadedDate) { this.uploadedDate = uploadedDate; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
    }

    public VersionComparisonDTO() {}

    public VersionComparisonDTO(String id, String title, String baseDocumentId,
                                String targetDocumentId, String baseVersionLabel,
                                String targetVersionLabel, List<ClauseDiffDTO> diffs) {
        this.id = id;
        this.title = title;
        this.baseDocumentId = baseDocumentId;
        this.targetDocumentId = targetDocumentId;
        this.baseVersionLabel = baseVersionLabel;
        this.targetVersionLabel = targetVersionLabel;
        this.diffs = diffs;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    // Frontend alias
    public String getDocumentTitle() { return title; }
    public void setDocumentTitle(String docTitle) { this.title = docTitle; }

    public String getBaseDocumentId() { return baseDocumentId; }
    public void setBaseDocumentId(String baseDocumentId) { this.baseDocumentId = baseDocumentId; }

    public String getTargetDocumentId() { return targetDocumentId; }
    public void setTargetDocumentId(String targetDocumentId) { this.targetDocumentId = targetDocumentId; }

    public String getBaseVersionLabel() { return baseVersionLabel; }
    public void setBaseVersionLabel(String baseVersionLabel) { this.baseVersionLabel = baseVersionLabel; }

    public String getTargetVersionLabel() { return targetVersionLabel; }
    public void setTargetVersionLabel(String targetVersionLabel) { this.targetVersionLabel = targetVersionLabel; }

    public List<ClauseDiffDTO> getDiffs() { return diffs; }
    public void setDiffs(List<ClauseDiffDTO> diffs) { this.diffs = diffs; }

    // Frontend alias
    public List<ClauseDiffDTO> getClauses() { return diffs; }
    public void setClauses(List<ClauseDiffDTO> clauses) { this.diffs = clauses; }

    // Frontend aliases for version metadata
    public VersionMeta getVersionA() {
        return new VersionMeta(baseVersionLabel != null ? baseVersionLabel : "v1.0", "Original", baseDocumentId != null ? baseDocumentId : "base.pdf");
    }

    public VersionMeta getVersionB() {
        return new VersionMeta(targetVersionLabel != null ? targetVersionLabel : "v2.0", "Modified", targetDocumentId != null ? targetDocumentId : "target.pdf");
    }

    public String getOverallImpact() {
        if (diffs == null || diffs.isEmpty()) {
            return "No substantive risk deltas identified.";
        }
        long highCount = diffs.stream().filter(d -> "high".equalsIgnoreCase(d.getSeverity())).count();
        if (highCount > 0) {
            return "High Exposure: " + highCount + " critical clause revision(s) shifting liabilities significantly.";
        }
        return "Moderate Exposure: Contract amendments feature manageable operational and administrative updates.";
    }
}
