package com.docurisk.backend.model.dto;

import java.util.List;
import java.util.Map;

public class AnalysisSummaryDTO {
    private String executiveSummary;
    private List<String> keyObligations;
    private List<String> criticalDates;
    private Integer complianceScore;
    private Integer totalRisks;
    private Map<String, Integer> riskCounts;
    private String actualProvider;
    private String executionStatus;
    private String statusMessage;
    private String modelName;

    public AnalysisSummaryDTO() {}

    public AnalysisSummaryDTO(String executiveSummary, List<String> keyObligations,
                              List<String> criticalDates, Integer complianceScore,
                              Integer totalRisks, Map<String, Integer> riskCounts) {
        this(executiveSummary, keyObligations, criticalDates, complianceScore, totalRisks, riskCounts, null, null, null, null);
    }

    public AnalysisSummaryDTO(String executiveSummary, List<String> keyObligations,
                              List<String> criticalDates, Integer complianceScore,
                              Integer totalRisks, Map<String, Integer> riskCounts,
                              String actualProvider, String executionStatus,
                              String statusMessage, String modelName) {
        this.executiveSummary = executiveSummary;
        this.keyObligations = keyObligations;
        this.criticalDates = criticalDates;
        this.complianceScore = complianceScore;
        this.totalRisks = totalRisks;
        this.riskCounts = riskCounts;
        this.actualProvider = actualProvider;
        this.executionStatus = executionStatus;
        this.statusMessage = statusMessage;
        this.modelName = modelName;
    }

    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }

    public List<String> getKeyObligations() { return keyObligations; }
    public void setKeyObligations(List<String> keyObligations) { this.keyObligations = keyObligations; }

    public List<String> getCriticalDates() { return criticalDates; }
    public void setCriticalDates(List<String> criticalDates) { this.criticalDates = criticalDates; }

    public Integer getComplianceScore() { return complianceScore; }
    public void setComplianceScore(Integer complianceScore) { this.complianceScore = complianceScore; }

    public Integer getTotalRisks() { return totalRisks; }
    public void setTotalRisks(Integer totalRisks) { this.totalRisks = totalRisks; }

    public Map<String, Integer> getRiskCounts() { return riskCounts; }
    public void setRiskCounts(Map<String, Integer> riskCounts) { this.riskCounts = riskCounts; }

    public String getActualProvider() { return actualProvider; }
    public void setActualProvider(String actualProvider) { this.actualProvider = actualProvider; }

    public String getExecutionStatus() { return executionStatus; }
    public void setExecutionStatus(String executionStatus) { this.executionStatus = executionStatus; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
}
