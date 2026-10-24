import { DocumentItem, DashboardStats, VersionComparisonData, RiskSeverity, RiskCategory } from '@/types/document';

export const mockDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Master Services Agreement (MSA) - CloudScale Inc.pdf',
    fileType: 'pdf',
    fileSizeBytes: 2450000,
    uploadedAt: '2026-10-10T14:32:00Z',
    status: 'analyzed',
    overallRiskLevel: 'high',
    summary: {
      executiveSummary:
        'A comprehensive enterprise services agreement outlining cloud infrastructure services, deployment terms, warranties, and multi-year billing schedules between CloudScale Systems and Global Retail Corp.',
      keyObligations: [
        'Client must provide 90-day written notice prior to terminating any auto-renewing statement of work.',
        'Vendor commits to 99.9% monthly uptime, calculated excluding scheduled weekend maintenance windows.',
        'All disputes are subject to binding arbitration under Delaware state jurisdiction with mutual fee-splitting.',
        'Client data must be deleted within 30 days of contract expiration upon written request.'
      ],
      criticalDates: [
        'Contract Effective Date: November 1, 2026',
        'Initial Term Expiration: October 31, 2029 (3-Year Term)',
        'Next Auto-Renewal Opt-Out Deadline: August 2, 2029'
      ],
      totalRisks: 4,
      complianceScore: 68,
      riskCounts: {
        high: 2,
        medium: 1,
        low: 1,
      },
    },
    findings: [
      {
        id: 'find-101',
        title: 'Uncapped Indemnification for Third-Party Claims',
        severity: 'high',
        category: 'Legal Liability',
        clauseReference: 'Section 14.2 (Indemnification Scope & Limits)',
        explanation:
          'The agreement waives standard liability caps for indemnification claims arising from unspecified third-party operational losses, exposing the client to unbounded financial exposure.',
        evidenceSnippet:
          'Notwithstanding any other provision herein, Client shall indemnify and hold harmless Vendor against all third-party claims, liabilities, and legal expenses without limitation as to aggregate dollar amount.',
        recommendation:
          'Cap indemnification liability to 12 months of fees paid under the applicable Statement of Work.',
        pageNumber: 12,
      },
      {
        id: 'find-102',
        title: 'Unilateral Price Escalation upon Auto-Renewal',
        severity: 'high',
        category: 'Financial',
        clauseReference: 'Section 8.4 (Fee Adjustments on Renewal)',
        explanation:
          'Vendor reserves the right to increase annual subscription fees by up to 18% per renewal period without prior performance benchmark or CPI indexing.',
        evidenceSnippet:
          'Fees for subsequent renewal periods may be increased at Vendor sole discretion by an amount not exceeding eighteen percent (18%) of the preceding term rates upon thirty (30) days notice.',
        recommendation:
          'Tie any renewal fee increases to the Consumer Price Index (CPI-U) with a strict annual cap of 3%.',
        pageNumber: 7,
      },
      {
        id: 'find-103',
        title: 'Ambiguous Data Breach Notification Window',
        severity: 'medium',
        category: 'Data Privacy',
        clauseReference: 'Section 18.1 (Security Incidents & Breaches)',
        explanation:
          'The vendor promises notification "as soon as commercially feasible," which fails GDPR and state-level statutory deadlines requiring notification within 72 hours.',
        evidenceSnippet:
          'Vendor shall notify Client of any confirmed security compromise involving Customer Personal Data as soon as commercially practicable under the prevailing circumstances.',
        recommendation:
          'Update language to mandate notice in writing within 48 to 72 hours of incident confirmation.',
        pageNumber: 16,
      },
      {
        id: 'find-104',
        title: 'Restricted Audit Window & Non-Disclosure of Logs',
        severity: 'low',
        category: 'Compliance',
        clauseReference: 'Section 19.3 (Audit Rights & Verification)',
        explanation:
          'Customer audit rights are restricted to once every two years with 45 days advance notice, and excludes inspection of shared cloud host telemetry.',
        evidenceSnippet:
          'Client may perform a remote compliance inspection no more than once every twenty-four (24) months, provided that Vendor may redact multi-tenant infrastructure logs.',
        recommendation:
          'Request SOC2 Type II report access annually in lieu of physical or manual audits.',
        pageNumber: 18,
      },
    ],
  },
  {
    id: 'doc-2',
    name: 'Enterprise SaaS Non-Disclosure Agreement (NDA).docx',
    fileType: 'docx',
    fileSizeBytes: 840000,
    uploadedAt: '2026-10-11T09:15:00Z',
    status: 'analyzed',
    overallRiskLevel: 'low',
    summary: {
      executiveSummary:
        'Standard bilateral non-disclosure agreement governing pre-merger confidential discussions and technical due diligence evaluations between Meridian Partners and Apex Technologies.',
      keyObligations: [
        'Confidential Information must be maintained with at least the standard of care used for recipient own proprietary data.',
        'Confidentiality duration extends for three (3) years post-disclosure.',
        'Permitted disclosure allowed to legal and financial advisors subject to equivalent confidentiality terms.'
      ],
      criticalDates: [
        'Execution Date: October 15, 2026',
        'Term Duration: 3 Years from date of last disclosure'
      ],
      totalRisks: 2,
      complianceScore: 92,
      riskCounts: {
        high: 0,
        medium: 1,
        low: 1,
      },
    },
    findings: [
      {
        id: 'find-201',
        title: 'Trade Secret Protection Lacks Perpetual Survival Clause',
        severity: 'medium',
        category: 'Intellectual Property',
        clauseReference: 'Section 4.1 (Term and Survival)',
        explanation:
          'Confidentiality terminates strictly after 3 years, failing to preserve trade secret protection for proprietary source code algorithms indefinitely.',
        evidenceSnippet:
          'The obligations of non-disclosure and non-use shall expire precisely thirty-six (36) months from the initial date of disclosure regardless of information type.',
        recommendation:
          'Include a carve-out ensuring trade secrets remain protected until they no longer qualify as such under applicable trade secret laws.',
        pageNumber: 3,
      },
      {
        id: 'find-202',
        title: 'Dispute Resolution Exclusive to Non-Local Jurisdiction',
        severity: 'low',
        category: 'Legal Liability',
        clauseReference: 'Section 9.2 (Governing Law and Forum)',
        explanation:
          'All disputes must be brought in the courts of New York County, NY, which may increase logistical costs in the event of minor breach litigation.',
        evidenceSnippet:
          'This Agreement shall be governed by the laws of the State of New York, and parties consent to the exclusive jurisdiction of the state courts located in New York County.',
        recommendation: 'Evaluate mutual agreement on neutral arbitration venue or home jurisdiction.',
        pageNumber: 5,
      },
    ],
  },
  {
    id: 'doc-3',
    name: 'Commercial Lease Agreement - Suite 400.pdf',
    fileType: 'pdf',
    fileSizeBytes: 3950000,
    uploadedAt: '2026-10-08T16:20:00Z',
    status: 'analyzed',
    overallRiskLevel: 'medium',
    summary: {
      executiveSummary:
        'Commercial office space lease covering 8,500 square feet at 500 Market Street for a five-year term, detailing triple-net (NNN) operating cost pass-throughs, buildout credits, and restoration covenants.',
      keyObligations: [
        'Tenant pays proportionate share (14.2%) of building real estate taxes, hazard insurance, and common area maintenance (CAM).',
        'Base monthly rent of $32,000 escalating 3.5% annually on each anniversary date.',
        'Tenant must surrender premises in broom-clean condition with all alterations removed unless Landlord agrees in writing.'
      ],
      criticalDates: [
        'Lease Commencement: January 1, 2027',
        'Lease Expiration: December 31, 2031',
        'Security Deposit Return: Within 45 days after surrender'
      ],
      totalRisks: 3,
      complianceScore: 78,
      riskCounts: {
        high: 1,
        medium: 2,
        low: 0,
      },
    },
    findings: [
      {
        id: 'find-301',
        title: 'Uncapped Common Area Maintenance (CAM) Expense Pass-Through',
        severity: 'high',
        category: 'Financial',
        clauseReference: 'Section 7.3 (Operating Cost Allocations)',
        explanation:
          'Operating costs passed to tenant include capital improvements and building structural retrofits without an annual controllable expense cap.',
        evidenceSnippet:
          'Tenant shall reimburse Landlord for all costs of building operation, administration, structural upgrades, and exterior improvements without limitation or annual expense ceiling.',
        recommendation:
          'Demand an annual controllable CAM cost cap of 5% and exclude structural capital repairs.',
        pageNumber: 8,
      },
      {
        id: 'find-302',
        title: 'Broad Restoration Mandate upon Lease Termination',
        severity: 'medium',
        category: 'Operational',
        clauseReference: 'Section 15.2 (Surrender & Restoration of Premises)',
        explanation:
          'Tenant is obligated to restore premises to original shell condition, including removal of approved cabling and conference room glass walls at tenant expense.',
        evidenceSnippet:
          'Tenant must restore the Leased Premises to the condition existing prior to all tenant alterations, including complete removal of all low-voltage wiring and partition assemblies.',
        recommendation:
          'Specify that tenant need not remove ordinary office alterations pre-approved by landlord.',
        pageNumber: 14,
      },
      {
        id: 'find-303',
        title: 'Landlord Relocation Right Without Equivalent Space Guarantee',
        severity: 'medium',
        category: 'Operational',
        clauseReference: 'Section 21.1 (Substitution of Premises)',
        explanation:
          'Landlord retains the unilateral right to relocate tenant to another floor on 60 days notice if floor dimensions are within 10% tolerance.',
        evidenceSnippet:
          'Landlord may, upon sixty (60) days written notice, relocate Tenant to comparable space within the Building, provided rentable square footage does not decrease by more than 10%.',
        recommendation:
          'Require landlord to pay 100% of moving, telecom, and architectural setup expenses in case of relocation.',
        pageNumber: 22,
      },
    ],
  },
  {
    id: 'doc-4',
    name: 'Data Processing Addendum (DPA) - GDPR Compliant.pdf',
    fileType: 'pdf',
    fileSizeBytes: 1220000,
    uploadedAt: '2026-10-09T11:40:00Z',
    status: 'analyzed',
    overallRiskLevel: 'low',
    summary: {
      executiveSummary:
        'Standard GDPR and CCPA data processing agreement for third-party cloud hosting services, including standard contractual clauses (SCCs) and sub-processor management schedules.',
      keyObligations: [
        'Processor must process personal data solely on documented instructions from the Controller.',
        'Adequate technical and organizational measures (TOMs) must be maintained to safeguard personal data.',
        'Controller will be notified of any proposed changes to sub-processors.'
      ],
      criticalDates: [
        'Effective Date: Concurrent with Main Services Agreement',
        'Sub-processor Objection Period: 14 Calendar Days'
      ],
      totalRisks: 1,
      complianceScore: 94,
      riskCounts: {
        high: 0,
        medium: 0,
        low: 1,
      },
    },
    findings: [
      {
        id: 'find-401',
        title: 'Tight 14-Day Objection Window for Sub-processor Additions',
        severity: 'low',
        category: 'Data Privacy',
        clauseReference: 'Section 5.2 (Sub-processor Engagement)',
        explanation:
          'The customer has only 14 calendar days to evaluate and lodge objections when the vendor introduces a new sub-processor before consent is deemed granted.',
        evidenceSnippet:
          'If Customer does not object in writing within fourteen (14) days of publication of a new Sub-processor, Customer is deemed to have accepted the engagement.',
        recommendation: 'Extend the objection window to 30 calendar days for adequate risk review.',
        pageNumber: 4,
      },
    ],
  },
  {
    id: 'doc-5',
    name: 'Vendor Software License & Maintenance Contract.docx',
    fileType: 'docx',
    fileSizeBytes: 1780000,
    uploadedAt: '2026-10-07T18:05:00Z',
    status: 'analyzed',
    overallRiskLevel: 'high',
    summary: {
      executiveSummary:
        'On-premise enterprise software license agreement covering perpetual runtime rights, annual maintenance tiers, update frequencies, and stringent compliance audits.',
      keyObligations: [
        'Licensee must run automated audit discovery scripts annually and submit logs to licensor.',
        'Maintenance fees equal to 22% of initial perpetual license cost billed annually.',
        'Prohibition on reverse-engineering, benchmarking, or publishing competitive performance tests.'
      ],
      criticalDates: [
        'License Grant Date: September 1, 2026',
        'First Annual Maintenance Renewal: August 31, 2027',
        'Audit Certification Due: Every December 15'
      ],
      totalRisks: 4,
      complianceScore: 61,
      riskCounts: {
        high: 2,
        medium: 2,
        low: 0,
      },
    },
    findings: [
      {
        id: 'find-501',
        title: 'Severe Audit Penalties and Retroactive True-Up Charges',
        severity: 'high',
        category: 'Financial',
        clauseReference: 'Section 11.4 (Audit Discrepancies and Under-licensing)',
        explanation:
          'If an audit reveals any usage exceeding license limits by more than 3%, customer must pay 200% of list price for excess usage plus all audit inspection fees.',
        evidenceSnippet:
          'In the event of an under-licensed discrepancy exceeding 3%, Licensee shall remit retroactive licensing fees at 200% of current standard list prices plus reasonable third-party auditor costs.',
        recommendation:
          'Negotiate true-up fees at normal contracted discount rates without the 200% penalty multiplier.',
        pageNumber: 9,
      },
      {
        id: 'find-502',
        title: 'Immediate Unilateral Termination on Disputed Invoices',
        severity: 'high',
        category: 'Termination',
        clauseReference: 'Section 16.2 (Termination for Payment Default)',
        explanation:
          'Licensor may terminate license and deactivate software keys within 10 days of missed invoice without allowing customary good-faith billing dispute procedures.',
        evidenceSnippet:
          'Licensor may instantly revoke software operational keys and terminate this Agreement if any invoice remains outstanding ten (10) days following due date.',
        recommendation:
          'Add standard 30-day cure period and explicit exception for good-faith disputed amounts.',
        pageNumber: 13,
      },
      {
        id: 'find-503',
        title: 'Total Disclaimer of Consequential and Lost Profit Damages',
        severity: 'medium',
        category: 'Legal Liability',
        clauseReference: 'Section 13.1 (Limitation of Consequential Damages)',
        explanation:
          'Licensor disclaims all liability for data loss or business disruption even in instances of severe gross negligence in security patch delivery.',
        evidenceSnippet:
          'In no event shall Licensor be liable for lost profits, loss of data, business disruption, or punitive damages arising from software defects or patch failure.',
        recommendation:
          'Exclude gross negligence and willful misconduct from limitation of liability carve-outs.',
        pageNumber: 11,
      },
      {
        id: 'find-504',
        title: 'Mandatory Automatic Maintenance Renewal with No Refund',
        severity: 'medium',
        category: 'Financial',
        clauseReference: 'Section 6.3 (Maintenance Service Terms)',
        explanation:
          'Annual maintenance auto-renews unless cancelled 120 days in advance, and pre-paid annual maintenance is non-refundable upon early termination.',
        evidenceSnippet:
          'Maintenance shall renew automatically for consecutive twelve (12) month terms unless cancelled in writing not less than one hundred twenty (120) days prior.',
        recommendation: 'Reduce cancellation notice window to 60 days.',
        pageNumber: 5,
      },
    ],
  },
  {
    id: 'doc-6',
    name: 'Independent Contractor Agreement - Senior DevOps.pdf',
    fileType: 'pdf',
    fileSizeBytes: 620000,
    uploadedAt: '2026-10-12T08:30:00Z',
    status: 'analyzed',
    overallRiskLevel: 'medium',
    summary: {
      executiveSummary:
        'Professional services agreement for an external Senior DevOps Cloud Architect providing infrastructure as code (IaC) engineering and Kubernetes hardening services.',
      keyObligations: [
        'Contractor invoices bi-weekly at agreed hourly rate of $145/hr with 30-day payment terms.',
        'All deliverables, code repositories, and documentation created become sole property of the company.',
        'Contractor provides basic $1M commercial general liability insurance coverage.'
      ],
      criticalDates: [
        'Contract Start Date: October 20, 2026',
        'Estimated Completion: April 30, 2027',
        'Termination Notice: 14 Days Notice by either party'
      ],
      totalRisks: 2,
      complianceScore: 82,
      riskCounts: {
        high: 0,
        medium: 2,
        low: 0,
      },
    },
    findings: [
      {
        id: 'find-601',
        title: 'Overbroad Non-Compete Scope Across Geographic Territory',
        severity: 'medium',
        category: 'Compliance',
        clauseReference: 'Section 8.2 (Restrictive Covenants & Non-Competition)',
        explanation:
          'Non-compete clause prohibits contractor from rendering DevOps consulting to any cloud consumer across North America for 18 months, likely unenforceable in many states.',
        evidenceSnippet:
          'Contractor shall not, during the Term and for eighteen (18) months thereafter, provide cloud computing or DevOps advisory services to any enterprise in North America.',
        recommendation:
          'Narrow non-compete to direct competitive products or replace with standard non-solicitation of clients.',
        pageNumber: 6,
      },
      {
        id: 'find-602',
        title: 'Assignment of Pre-Existing Background Intellectual Property',
        severity: 'medium',
        category: 'Intellectual Property',
        clauseReference: 'Section 7.3 (Background IP and Inventions)',
        explanation:
          'Agreement inadvertently assigns pre-existing open-source toolkits and scripts developed by contractor prior to the engagement.',
        evidenceSnippet:
          'Contractor hereby assigns all right, title, and interest in and to all scripts, code libraries, and methodologies utilized during the course of services.',
        recommendation:
          'Expressly exclude and license Background IP rather than assigning full ownership to company.',
        pageNumber: 5,
      },
    ],
  },
];

/**
 * Dynamically computes dashboard statistics from mock documents to ensure 100% data consistency.
 */
function computeDashboardStats(docs: DocumentItem[]): DashboardStats {
  const allFindings = docs.flatMap((doc) => doc.findings || []);
  const highRiskCount = allFindings.filter((f) => f.severity === 'high').length;
  const mediumRiskCount = allFindings.filter((f) => f.severity === 'medium').length;
  const lowRiskCount = allFindings.filter((f) => f.severity === 'low').length;

  const categoryMap = new Map<RiskCategory, { count: number; high: number; medium: number; low: number }>();
  allFindings.forEach((f) => {
    const current = categoryMap.get(f.category) || { count: 0, high: 0, medium: 0, low: 0 };
    current.count += 1;
    if (f.severity === 'high') current.high += 1;
    else if (f.severity === 'medium') current.medium += 1;
    else current.low += 1;
    categoryMap.set(f.category, current);
  });

  const riskDistribution = Array.from(categoryMap.entries()).map(([category, data]) => {
    const predominantSeverity: RiskSeverity =
      data.high > 0 ? 'high' : data.medium > 0 ? 'medium' : 'low';
    return {
      category,
      count: data.count,
      severity: predominantSeverity,
    };
  }).sort((a, b) => b.count - a.count);

  const totalCompliance = docs.reduce((acc, doc) => acc + (doc.summary?.complianceScore || 0), 0);
  const avgComplianceScore = docs.length ? Math.round(totalCompliance / docs.length) : 0;

  return {
    totalDocuments: docs.length,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    avgComplianceScore,
    riskDistribution,
  };
}

export const mockDashboardStats: DashboardStats = computeDashboardStats(mockDocuments);

export const mockVersionComparisons: VersionComparisonData[] = [
  {
    id: 'comp-1',
    documentTitle: 'Master Services Agreement (MSA) - CloudScale Inc.',
    versionA: {
      versionNumber: 'v1.2 (Standard Baseline)',
      uploadedDate: 'September 15, 2026',
      fileName: 'MSA_CloudScale_v1.2_Original.pdf',
    },
    versionB: {
      versionNumber: 'v2.0 (Vendor Revised Draft)',
      uploadedDate: 'October 10, 2026',
      fileName: 'MSA_CloudScale_v2.0_VendorRedline.pdf',
    },
    overallImpact:
      'Version 2.0 introduces 3 high-severity risk changes: removing aggregate liability caps, shortening breach notice windows, and expanding unilateral price escalation terms.',
    clauses: [
      {
        id: 'diff-1',
        sectionTitle: 'Section 14.2: Indemnification Limits',
        diffType: 'modified',
        oldClause:
          'Each party total aggregate liability for indemnification claims under this Agreement shall not exceed two times (2x) the total fees paid by Customer during the twelve (12) months preceding the incident.',
        newClause:
          'Notwithstanding any other provision herein, Customer shall indemnify and hold harmless Vendor against all third-party claims, liabilities, and legal expenses without limitation as to aggregate dollar amount.',
        riskImpact: {
          severity: 'high',
          description:
            'Liability cap completely removed. Client is now exposed to unbounded financial exposure for third-party claims.',
        },
      },
      {
        id: 'diff-2',
        sectionTitle: 'Section 8.4: Fee Adjustments on Renewal',
        diffType: 'modified',
        oldClause:
          'Annual renewal fee adjustments shall be limited to the percentage increase in the US Consumer Price Index (CPI-U), capped at a maximum of 3% per annum.',
        newClause:
          'Fees for subsequent renewal periods may be increased at Vendor sole discretion by an amount not exceeding eighteen percent (18%) of the preceding term rates upon thirty (30) days notice.',
        riskImpact: {
          severity: 'high',
          description:
            'Replaced CPI indexing capped at 3% with unilateral vendor discretion up to 18% annual price hike.',
        },
      },
      {
        id: 'diff-3',
        sectionTitle: 'Section 18.1: Security Incident Notification',
        diffType: 'modified',
        oldClause:
          'Vendor shall notify Customer in writing within seventy-two (72) hours of confirming any unauthorized access to or acquisition of Customer Confidential Data.',
        newClause:
          'Vendor shall notify Client of any confirmed security compromise involving Customer Personal Data as soon as commercially practicable under the prevailing circumstances.',
        riskImpact: {
          severity: 'medium',
          description:
            'Replaced clear 72-hour notification with subjective "as soon as commercially practicable", creating regulatory exposure under GDPR.',
        },
      },
      {
        id: 'diff-4',
        sectionTitle: 'Section 21.4: AI Model Training Rights',
        diffType: 'added',
        oldClause: '[Clause did not exist in v1.2]',
        newClause:
          'Vendor may ingest anonymized and aggregated Customer telemetry and operational inputs to train, improve, and benchmark its proprietary machine learning and generative artificial intelligence models.',
        riskImpact: {
          severity: 'medium',
          description:
            'New clause grants vendor perpetual rights to use customer workflow data for training AI models without revenue sharing.',
        },
      },
      {
        id: 'diff-5',
        sectionTitle: 'Section 12.3: Mandatory Informal Mediation',
        diffType: 'removed',
        oldClause:
          'Prior to commencing formal litigation or binding arbitration, parties agree to submit disputed matters to a designated senior executive officer conference for a thirty (30) day mandatory cooling-off period.',
        newClause:
          '[Clause deleted in Version 2.0]',
        riskImpact: {
          severity: 'low',
          description:
            'Mandatory cooling-off and executive mediation was eliminated, allowing instant escalation directly to adversarial legal arbitration.',
        },
      },
    ],
  },
  {
    id: 'comp-2',
    documentTitle: 'Vendor Software License & Maintenance Contract.docx',
    versionA: {
      versionNumber: 'v3.0 (Enterprise Baseline)',
      uploadedDate: 'August 1, 2026',
      fileName: 'Software_License_v3.0_Standard.docx',
    },
    versionB: {
      versionNumber: 'v3.5 (Proposed Renewal Terms)',
      uploadedDate: 'October 8, 2026',
      fileName: 'Software_License_v3.5_Renewal.docx',
    },
    overallImpact:
      'Proposed renewal terms increase audit penalties from 100% to 200% list price and restrict disaster recovery backup environments.',
    clauses: [
      {
        id: 'diff-201',
        sectionTitle: 'Section 11.4: Audit Penalty Multipliers',
        diffType: 'modified',
        oldClause:
          'If an audit reveals usage exceeding licensed quantities, Customer shall pay for excess copies at the standard discounted contract rates agreed in Schedule B.',
        newClause:
          'In the event of an under-licensed discrepancy exceeding 3%, Licensee shall remit retroactive licensing fees at 200% of current standard list prices plus all reasonable auditor costs.',
        riskImpact: {
          severity: 'high',
          description:
            'Introduces punitive 200% surcharge penalty multiplier on uncontracted usage plus customer obligation to reimburse vendor third-party auditor fees.',
        },
      },
      {
        id: 'diff-202',
        sectionTitle: 'Section 7.2: Cold Standby & Disaster Recovery Environments',
        diffType: 'modified',
        oldClause:
          'Customer may deploy two (2) unmetered cold standby instances exclusively for disaster recovery, failover testing, and high-availability hot clusters.',
        newClause:
          'Cold standby deployments are restricted to one (1) passive instance, and any failover test exceeding four (4) hours shall be billed as concurrent active production usage.',
        riskImpact: {
          severity: 'medium',
          description:
            'Restricts disaster recovery redundancy and introduces billing hazards during multi-hour infrastructure maintenance simulations.',
        },
      },
      {
        id: 'diff-203',
        sectionTitle: 'Section 15.1: Automated Usage Telemetry Reporting',
        diffType: 'added',
        oldClause: '[Clause did not exist in v3.0]',
        newClause:
          'Software will initiate periodic outbound telemetry pings to Licensor license verification servers to validate core license allocation every twenty-four (24) hours.',
        riskImpact: {
          severity: 'low',
          description:
            'Requires firewall egress holes for air-gapped on-premise infrastructure nodes to communicate with external licensing hosts.',
        },
      },
      {
        id: 'diff-204',
        sectionTitle: 'Section 18.5: Source Code Escrow Deposit',
        diffType: 'removed',
        oldClause:
          'Licensor shall maintain an active third-party source code escrow release covenant with Iron Mountain to protect Licensee in the event of vendor bankruptcy or dissolution.',
        newClause:
          '[Clause deleted in Version 3.5]',
        riskImpact: {
          severity: 'medium',
          description:
            'Eliminates business continuity source code escrow safeguard, exposing customer to mission-critical dependency failure if vendor ceases operations.',
        },
      },
    ],
  },
];

export const mockVersionComparison: VersionComparisonData = mockVersionComparisons[0];
