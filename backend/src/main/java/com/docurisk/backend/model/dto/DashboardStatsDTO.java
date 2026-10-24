package com.docurisk.backend.model.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {
    private Integer totalDocuments;
    private Integer highRiskCount;
    private Integer mediumRiskCount;
    private Integer lowRiskCount;
    private Integer avgComplianceScore;
    private Integer analyzedCount;
    private List<RiskDistributionItem> riskDistribution = new ArrayList<>();
    private Map<String, Integer> risksByCategory;

    public static class RiskDistributionItem {
        private String category;
        private Integer count;
        private String severity;

        public RiskDistributionItem() {}

        public RiskDistributionItem(String category, Integer count, String severity) {
            this.category = category;
            this.count = count;
            this.severity = severity;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public Integer getCount() { return count; }
        public void setCount(Integer count) { this.count = count; }

        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
    }

    public DashboardStatsDTO() {}

    public DashboardStatsDTO(Integer totalDocuments, Integer highRiskCount, Integer mediumRiskCount,
                             Integer lowRiskCount, Integer avgComplianceScore,
                             Integer analyzedCount, List<RiskDistributionItem> riskDistribution,
                             Map<String, Integer> risksByCategory) {
        this.totalDocuments = totalDocuments;
        this.highRiskCount = highRiskCount;
        this.mediumRiskCount = mediumRiskCount;
        this.lowRiskCount = lowRiskCount;
        this.avgComplianceScore = avgComplianceScore;
        this.analyzedCount = analyzedCount;
        this.riskDistribution = riskDistribution;
        this.risksByCategory = risksByCategory;
    }

    public Integer getTotalDocuments() { return totalDocuments; }
    public void setTotalDocuments(Integer totalDocuments) { this.totalDocuments = totalDocuments; }

    public Integer getHighRiskCount() { return highRiskCount; }
    public void setHighRiskCount(Integer highRiskCount) { this.highRiskCount = highRiskCount; }

    public Integer getHighRisksCount() { return highRiskCount; }
    public void setHighRisksCount(Integer count) { this.highRiskCount = count; }

    public Integer getMediumRiskCount() { return mediumRiskCount; }
    public void setMediumRiskCount(Integer mediumRiskCount) { this.mediumRiskCount = mediumRiskCount; }

    public Integer getMediumRisksCount() { return mediumRiskCount; }
    public void setMediumRisksCount(Integer count) { this.mediumRiskCount = count; }

    public Integer getLowRiskCount() { return lowRiskCount; }
    public void setLowRiskCount(Integer lowRiskCount) { this.lowRiskCount = lowRiskCount; }

    public Integer getLowRisksCount() { return lowRiskCount; }
    public void setLowRisksCount(Integer count) { this.lowRiskCount = count; }

    public Integer getAvgComplianceScore() { return avgComplianceScore; }
    public void setAvgComplianceScore(Integer avgComplianceScore) { this.avgComplianceScore = avgComplianceScore; }

    public Integer getAverageComplianceScore() { return avgComplianceScore; }
    public void setAverageComplianceScore(Integer score) { this.avgComplianceScore = score; }

    public Integer getAnalyzedCount() { return analyzedCount; }
    public void setAnalyzedCount(Integer analyzedCount) { this.analyzedCount = analyzedCount; }

    public List<RiskDistributionItem> getRiskDistribution() { return riskDistribution; }
    public void setRiskDistribution(List<RiskDistributionItem> riskDistribution) { this.riskDistribution = riskDistribution; }

    public Map<String, Integer> getRisksByCategory() { return risksByCategory; }
    public void setRisksByCategory(Map<String, Integer> risksByCategory) { this.risksByCategory = risksByCategory; }
}
