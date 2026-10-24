export type RiskSeverity = 'low' | 'medium' | 'high';

export type RiskCategory =
  | 'Financial'
  | 'Compliance'
  | 'Legal Liability'
  | 'Termination'
  | 'Intellectual Property'
  | 'Data Privacy'
  | 'Operational';

export type DocumentStatus = 'analyzed' | 'processing' | 'failed';

export type ProviderExecutionStatus = 'completed' | 'fallback' | 'rule_only' | 'partial' | 'legacy' | 'failed';

export interface RiskFinding {
  id: string;
  title: string;
  severity: RiskSeverity;
  category: RiskCategory;
  clauseReference: string;
  explanation: string;
  evidenceSnippet: string;
  recommendation?: string;
  pageNumber?: number;
  findingSource?: 'rule' | 'llm' | 'hybrid' | 'unknown';
  isEvidenceVerified?: boolean;
  evidenceStatus?: 'verified' | 'unverified' | 'rejected' | 'unknown';
}

export interface AnalysisSummary {
  executiveSummary: string;
  keyObligations: string[];
  criticalDates: string[];
  totalRisks: number;
  complianceScore: number; // 0 - 100%
  riskCounts: {
    high: number;
    medium: number;
    low: number;
  };
  actualProvider?: string;
  executionStatus?: ProviderExecutionStatus;
  statusMessage?: string;
  modelName?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  fileType: 'pdf' | 'docx';
  fileSizeBytes: number;
  uploadedAt: string;
  status: DocumentStatus;
  overallRiskLevel: RiskSeverity;
  summary?: AnalysisSummary;
  findings?: RiskFinding[];
}

export interface DashboardStats {
  totalDocuments: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  avgComplianceScore: number;
  riskDistribution: {
    category: RiskCategory;
    count: number;
    severity: RiskSeverity;
  }[];
}

export interface ClauseDiff {
  id: string;
  sectionTitle: string;
  oldClause: string;
  newClause: string;
  diffType: 'modified' | 'added' | 'removed';
  riskImpact: {
    severity: RiskSeverity;
    description: string;
  };
}

export interface VersionComparisonData {
  id: string;
  documentTitle: string;
  versionA: {
    versionNumber: string;
    uploadedDate: string;
    fileName: string;
  };
  versionB: {
    versionNumber: string;
    uploadedDate: string;
    fileName: string;
  };
  overallImpact: string;
  clauses: ClauseDiff[];
}
