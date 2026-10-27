import { jsPDF } from 'jspdf';
import { DocumentItem, RiskFinding, AnalysisSummary } from '@/types/document';

/**
 * Sanitizes input text for standard PDF fonts (WinAnsi/CP1252 compatible).
 * Replaces fancy Unicode quotes, dashes, bullets, and ellipses that otherwise
 * render as garbled characters or question marks in jsPDF.
 */
export function cleanPdfText(text: string | null | undefined): string {
  if (!text) return '';

  return text
    .replace(/[\u2018\u2019]/g, "'") // Single curly quotes
    .replace(/[\u201C\u201D]/g, '"') // Double curly quotes
    .replace(/\u2014/g, ' - ') // Em dash
    .replace(/\u2013/g, '-') // En dash
    .replace(/\u2026/g, '...') // Ellipsis
    .replace(/[\u2022\u25CF\u00B7]/g, '-') // Bullets
    .replace(/\u00A0/g, ' ') // Non-breaking space
    .replace(/[\t\r]/g, ' ') // Tabs/carriage returns to spaces
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, ' ') // Strip other unsupported control/unicode chars
    .trim();
}

/**
 * Sanitizes a document name into a clean, safe filename for downloads.
 */
export function sanitizeFilename(name: string | null | undefined): string {
  if (!name) return 'document';
  // Remove existing extension (.pdf, .docx, etc.)
  const withoutExt = name.replace(/\.[a-zA-Z0-9]+$/, '');
  // Replace non-alphanumeric chars with underscores and collapse consecutive underscores
  const clean = withoutExt
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return clean || 'document';
}

/**
 * Formats file size in bytes to a human-readable string.
 */
export function formatPdfFileSize(bytes: number): string {
  if (!bytes || isNaN(bytes)) return 'Unknown size';
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Formats ISO date string to a human-readable format.
 */
export function formatPdfDate(isoString: string | null | undefined): string {
  if (!isoString) return 'Not recorded';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

// Design Palette matching DocuRisk Theme (RGB values for jsPDF)
const PALETTE = {
  primaryDark: [15, 23, 42] as [number, number, number], // #0f172a Slate 900
  secondaryDark: [30, 41, 59] as [number, number, number], // #1e293b Slate 800
  tealAccent: [13, 148, 136] as [number, number, number], // #0d9488 Teal 600
  tealDark: [15, 118, 110] as [number, number, number], // #0f766e Teal 700
  tealLight: [240, 253, 250] as [number, number, number], // #f0fdfa Teal 50
  tealBorder: [153, 246, 228] as [number, number, number], // #99f6e4 Teal 200
  slateText: [51, 65, 85] as [number, number, number], // #334155 Slate 700
  slateMuted: [100, 116, 139] as [number, number, number], // #64748b Slate 500
  borderLight: [226, 232, 240] as [number, number, number], // #e2e8f0 Slate 200
  cardBg: [248, 250, 252] as [number, number, number], // #f8fafc Slate 50
  white: [255, 255, 255] as [number, number, number],
  amberAccent: [217, 119, 6] as [number, number, number], // #d97706 Amber 600
  amberLight: [254, 243, 199] as [number, number, number], // #fef3c7 Amber 50
  amberBorder: [253, 230, 138] as [number, number, number], // #fde68a Amber 200
  roseAccent: [225, 29, 72] as [number, number, number], // #e11d48 Rose 600
  roseLight: [255, 241, 242] as [number, number, number], // #fff1f2 Rose 50
  roseBorder: [254, 205, 211] as [number, number, number], // #fecdd3 Rose 200
  emeraldAccent: [5, 150, 105] as [number, number, number], // #059669 Emerald 600
  emeraldLight: [236, 253, 245] as [number, number, number], // #ecfdf5 Emerald 50
  emeraldBorder: [167, 243, 208] as [number, number, number], // #a7f3d0 Emerald 200
};

/**
 * Common PDF layout builder containing shared page setup, header, footer,
 * and page-breaking logic.
 */
class PdfDocumentBuilder {
  pdf: jsPDF;
  pageWidth = 210; // A4 standard mm
  pageHeight = 297;
  marginLeft = 16;
  marginRight = 16;
  marginTop = 18;
  marginBottom = 18;
  contentWidth: number;
  currentY: number;
  reportTitle: string;
  documentName: string;
  generationDate: string;

  constructor(reportTitle: string, documentName: string) {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight; // 178mm
    this.currentY = this.marginTop;
    this.reportTitle = reportTitle;
    this.documentName = documentName;
    this.generationDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Checks if required height fits on the current page.
   * If not, adds a new page and resets currentY with top margin.
   */
  ensureSpace(neededHeight: number): void {
    if (this.currentY + neededHeight > this.pageHeight - this.marginBottom) {
      this.pdf.addPage();
      this.currentY = this.marginTop + 10; // Extra room for running header on page 2+
    }
  }

  /**
   * Draws the top branding bar on the first page.
   */
  drawHeaderBanner(title: string, subtitle: string): void {
    const bannerHeight = 26;
    // Dark Slate Header Block
    this.pdf.setFillColor(...PALETTE.primaryDark);
    this.pdf.roundedRect(this.marginLeft, this.currentY, this.contentWidth, bannerHeight, 3, 3, 'F');

    // Teal accent line on top edge of banner
    this.pdf.setFillColor(...PALETTE.tealAccent);
    this.pdf.rect(this.marginLeft + 3, this.currentY, this.contentWidth - 6, 1.8, 'F');

    // Brand tag
    this.pdf.setTextColor(...PALETTE.tealBorder);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(8);
    this.pdf.text('DOCURISK AI LEGAL SUITE', this.marginLeft + 8, this.currentY + 8);

    // Main Report Title
    this.pdf.setTextColor(...PALETTE.white);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(13);
    this.pdf.text(cleanPdfText(title), this.marginLeft + 8, this.currentY + 15);

    // Subtitle / Document Identifier
    this.pdf.setTextColor(148, 163, 184); // Slate 400
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8.5);
    const safeSubtitle = cleanPdfText(subtitle);
    const truncatedSubtitle = safeSubtitle.length > 80 ? safeSubtitle.substring(0, 77) + '...' : safeSubtitle;
    this.pdf.text(truncatedSubtitle, this.marginLeft + 8, this.currentY + 21);

    this.currentY += bannerHeight + 6;
  }

  /**
   * Draws the Document Metadata Summary Grid (2-column or 4-box card).
   */
  drawMetadataGrid(doc: DocumentItem): void {
    const gridHeight = 22;
    this.pdf.setFillColor(...PALETTE.cardBg);
    this.pdf.setDrawColor(...PALETTE.borderLight);
    this.pdf.roundedRect(this.marginLeft, this.currentY, this.contentWidth, gridHeight, 2, 2, 'FD');

    const colWidth = this.contentWidth / 4;
    const yTop = this.currentY + 5.5;
    const yBottom = this.currentY + 14;

    // Col 1: Filename
    this.pdf.setTextColor(...PALETTE.slateMuted);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.text('TARGET DOCUMENT', this.marginLeft + 5, yTop);
    this.pdf.setTextColor(...PALETTE.primaryDark);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(8);
    const docName = cleanPdfText(doc.name);
    const shortName = docName.length > 22 ? docName.substring(0, 20) + '...' : docName;
    this.pdf.text(shortName, this.marginLeft + 5, yBottom);

    // Divider 1
    this.pdf.setDrawColor(...PALETTE.borderLight);
    this.pdf.line(this.marginLeft + colWidth, this.currentY + 3, this.marginLeft + colWidth, this.currentY + gridHeight - 3);

    // Col 2: Ingestion / Analysis Date
    this.pdf.setTextColor(...PALETTE.slateMuted);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.text('ANALYZED AT', this.marginLeft + colWidth + 5, yTop);
    this.pdf.setTextColor(...PALETTE.primaryDark);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.text(formatPdfDate(doc.uploadedAt), this.marginLeft + colWidth + 5, yBottom);

    // Divider 2
    this.pdf.line(this.marginLeft + colWidth * 2, this.currentY + 3, this.marginLeft + colWidth * 2, this.currentY + gridHeight - 3);

    // Col 3: Compliance & Risk
    this.pdf.setTextColor(...PALETTE.slateMuted);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.text('COMPLIANCE SCORE', this.marginLeft + colWidth * 2 + 5, yTop);
    const score = doc.summary?.complianceScore ?? 0;
    this.pdf.setTextColor(
      score >= 80 ? PALETTE.emeraldAccent[0] : score >= 70 ? PALETTE.amberAccent[0] : PALETTE.roseAccent[0],
      score >= 80 ? PALETTE.emeraldAccent[1] : score >= 70 ? PALETTE.amberAccent[1] : PALETTE.roseAccent[1],
      score >= 80 ? PALETTE.emeraldAccent[2] : score >= 70 ? PALETTE.amberAccent[2] : PALETTE.roseAccent[2],
    );
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(8.5);
    this.pdf.text(`${score}% (${doc.overallRiskLevel.toUpperCase()} RISK)`, this.marginLeft + colWidth * 2 + 5, yBottom);

    // Divider 3
    this.pdf.setDrawColor(...PALETTE.borderLight);
    this.pdf.line(this.marginLeft + colWidth * 3, this.currentY + 3, this.marginLeft + colWidth * 3, this.currentY + gridHeight - 3);

    // Col 4: AI Engine
    this.pdf.setTextColor(...PALETTE.slateMuted);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7);
    this.pdf.text('AI ENGINE / STATUS', this.marginLeft + colWidth * 3 + 5, yTop);
    this.pdf.setTextColor(...PALETTE.tealDark);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(8);
    const providerStr = doc.summary?.actualProvider
      ? cleanPdfText(doc.summary.actualProvider.toUpperCase())
      : 'GEMINI AI';
    const statusStr = doc.summary?.executionStatus === 'fallback' ? 'RULE FALLBACK' : 'SYNTHESIS';
    this.pdf.text(`${providerStr} • ${statusStr}`, this.marginLeft + colWidth * 3 + 5, yBottom);

    this.currentY += gridHeight + 6;
  }

  /**
   * Draws a section header with colored left pill accent.
   */
  drawSectionHeader(title: string, subtitle?: string): void {
    this.ensureSpace(14);
    // Left pill
    this.pdf.setFillColor(...PALETTE.tealAccent);
    this.pdf.roundedRect(this.marginLeft, this.currentY, 3, 9, 1, 1, 'F');

    // Title text
    this.pdf.setTextColor(...PALETTE.primaryDark);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10.5);
    this.pdf.text(cleanPdfText(title), this.marginLeft + 6, this.currentY + 6.5);

    if (subtitle) {
      const titleWidth = this.pdf.getTextWidth(cleanPdfText(title));
      this.pdf.setTextColor(...PALETTE.slateMuted);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(7.5);
      this.pdf.text(cleanPdfText(subtitle), this.marginLeft + 8 + titleWidth, this.currentY + 6.5);
    }

    this.currentY += 11;
  }

  /**
   * Renders the Executive Summary box.
   */
  drawExecutiveSummary(summary: AnalysisSummary): void {
    const cleanSummary = cleanPdfText(summary.executiveSummary) || 'No executive summary available for this document.';
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8.5);

    // Calculate height of wrapped text
    const textLines = this.pdf.splitTextToSize(cleanSummary, this.contentWidth - 10);
    const textHeight = textLines.length * 4.3;
    const boxHeight = textHeight + 10;

    this.ensureSpace(boxHeight);

    // Box container
    this.pdf.setFillColor(...PALETTE.cardBg);
    this.pdf.setDrawColor(...PALETTE.borderLight);
    this.pdf.roundedRect(this.marginLeft, this.currentY, this.contentWidth, boxHeight, 2, 2, 'FD');

    // Subtle left border accent
    this.pdf.setFillColor(...PALETTE.tealAccent);
    this.pdf.rect(this.marginLeft, this.currentY, 1.5, boxHeight, 'F');

    // Text content
    this.pdf.setTextColor(...PALETTE.slateText);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8.5);
    this.pdf.text(textLines, this.marginLeft + 6, this.currentY + 6.5);

    this.currentY += boxHeight + 6;
  }

  /**
   * Renders Key Obligations / Important Points list.
   */
  drawKeyObligations(obligations: string[]): void {
    if (!obligations || obligations.length === 0) {
      this.ensureSpace(12);
      this.pdf.setTextColor(...PALETTE.slateMuted);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.setFontSize(8.5);
      this.pdf.text('No key obligations or important findings were detected.', this.marginLeft + 4, this.currentY + 4);
      this.currentY += 8;
      return;
    }

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);

    obligations.forEach((item, index) => {
      const cleanItem = cleanPdfText(item);
      const lines = this.pdf.splitTextToSize(cleanItem, this.contentWidth - 14);
      const itemHeight = Math.max(8, lines.length * 4.2 + 3);

      this.ensureSpace(itemHeight + 2);

      // Number badge
      this.pdf.setFillColor(...PALETTE.tealLight);
      this.pdf.setDrawColor(...PALETTE.tealBorder);
      this.pdf.roundedRect(this.marginLeft + 2, this.currentY, 6, 6, 1, 1, 'FD');

      this.pdf.setTextColor(...PALETTE.tealDark);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(6.5);
      this.pdf.text(String(index + 1), this.marginLeft + 3.8, this.currentY + 4.2);

      // Obligation Text
      this.pdf.setTextColor(...PALETTE.slateText);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(8);
      this.pdf.text(lines, this.marginLeft + 11, this.currentY + 4.2);

      this.currentY += itemHeight;
    });

    this.currentY += 4;
  }

  /**
   * Renders Critical Dates & Deadlines list.
   */
  drawCriticalDates(dates: string[]): void {
    if (!dates || dates.length === 0) {
      this.ensureSpace(12);
      this.pdf.setTextColor(...PALETTE.slateMuted);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.setFontSize(8.5);
      this.pdf.text('No critical milestone dates were identified in the text.', this.marginLeft + 4, this.currentY + 4);
      this.currentY += 8;
      return;
    }

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);

    dates.forEach((dateItem) => {
      const cleanDate = cleanPdfText(dateItem);
      const lines = this.pdf.splitTextToSize(cleanDate, this.contentWidth - 14);
      const itemHeight = Math.max(7, lines.length * 4.2 + 2);

      this.ensureSpace(itemHeight + 2);

      // Calendar pill icon indicator
      this.pdf.setFillColor(...PALETTE.cardBg);
      this.pdf.setDrawColor(...PALETTE.borderLight);
      this.pdf.roundedRect(this.marginLeft + 2, this.currentY, 5, 5, 1, 1, 'FD');

      this.pdf.setFillColor(...PALETTE.tealAccent);
      this.pdf.circle(this.marginLeft + 4.5, this.currentY + 2.5, 1, 'F');

      // Date Text
      this.pdf.setTextColor(...PALETTE.primaryDark);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8);
      this.pdf.text(lines, this.marginLeft + 10, this.currentY + 3.8);

      this.currentY += itemHeight;
    });

    this.currentY += 4;
  }

  /**
   * Draws Risk Distribution Breakdown cards.
   */
  drawRiskDistributionSummary(summary: AnalysisSummary, findingsCount: number): void {
    const cardHeight = 18;
    this.ensureSpace(cardHeight + 4);

    const counts = summary.riskCounts || { high: 0, medium: 0, low: 0 };
    const colWidth = this.contentWidth / 4;

    const stats = [
      {
        label: 'TOTAL RISKS',
        value: String(summary.totalRisks ?? findingsCount),
        bg: PALETTE.cardBg,
        border: PALETTE.borderLight,
        textColor: PALETTE.primaryDark,
      },
      {
        label: 'HIGH SEVERITY',
        value: String(counts.high ?? 0),
        bg: PALETTE.roseLight,
        border: PALETTE.roseBorder,
        textColor: PALETTE.roseAccent,
      },
      {
        label: 'MEDIUM SEVERITY',
        value: String(counts.medium ?? 0),
        bg: PALETTE.amberLight,
        border: PALETTE.amberBorder,
        textColor: PALETTE.amberAccent,
      },
      {
        label: 'LOW SEVERITY',
        value: String(counts.low ?? 0),
        bg: PALETTE.emeraldLight,
        border: PALETTE.emeraldBorder,
        textColor: PALETTE.emeraldAccent,
      },
    ];

    stats.forEach((stat, idx) => {
      const x = this.marginLeft + idx * colWidth;
      const w = colWidth - 2;

      this.pdf.setFillColor(...stat.bg);
      this.pdf.setDrawColor(...stat.border);
      this.pdf.roundedRect(x, this.currentY, w, cardHeight, 1.5, 1.5, 'FD');

      this.pdf.setTextColor(...stat.textColor);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(12);
      this.pdf.text(stat.value, x + 4, this.currentY + 8);

      this.pdf.setTextColor(...PALETTE.slateMuted);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(6.5);
      this.pdf.text(stat.label, x + 4, this.currentY + 14);
    });

    this.currentY += cardHeight + 6;
  }

  /**
   * Draws a complete Risk Finding Card including:
   * Title, Severity Badge, Category, Clause Reference, Verification Status,
   * Risk Explanation, Evidence Citation, and Recommended Remediation.
   */
  drawFindingCard(finding: RiskFinding, index: number): void {
    // Determine colors based on severity
    let sevColor = PALETTE.amberAccent;
    let sevBg = PALETTE.amberLight;
    let sevBorder = PALETTE.amberBorder;
    if (finding.severity === 'high') {
      sevColor = PALETTE.roseAccent;
      sevBg = PALETTE.roseLight;
      sevBorder = PALETTE.roseBorder;
    } else if (finding.severity === 'low') {
      sevColor = PALETTE.emeraldAccent;
      sevBg = PALETTE.emeraldLight;
      sevBorder = PALETTE.emeraldBorder;
    }

    // Prepare clean text
    const title = cleanPdfText(finding.title);
    const category = cleanPdfText(finding.category);
    const clause = cleanPdfText(finding.clauseReference);
    const explanation = cleanPdfText(finding.explanation);
    const evidence = cleanPdfText(finding.evidenceSnippet);
    const recommendation = finding.recommendation ? cleanPdfText(finding.recommendation) : null;
    const pageNum = finding.pageNumber ? `Page ${finding.pageNumber}` : null;
    const verification = finding.evidenceStatus === 'verified'
      ? 'Verified Quote'
      : finding.evidenceStatus === 'unverified'
      ? 'Unverified Quote'
      : finding.findingSource === 'rule'
      ? 'Rule Baseline'
      : null;

    // Calculate heights for text blocks
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    const explanationLines = this.pdf.splitTextToSize(explanation, this.contentWidth - 14);
    const explanationHeight = explanationLines.length * 3.8;

    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setFontSize(7.5);
    const evidenceLines = this.pdf.splitTextToSize(`"${evidence}"`, this.contentWidth - 22);
    const evidenceBoxHeight = evidenceLines.length * 3.5 + 8;

    let recBoxHeight = 0;
    let recLines: string[] = [];
    if (recommendation) {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(7.5);
      recLines = this.pdf.splitTextToSize(recommendation, this.contentWidth - 22);
      recBoxHeight = recLines.length * 3.5 + 8;
    }

    const totalCardHeight = 16 + explanationHeight + evidenceBoxHeight + recBoxHeight + 8;

    // Ensure entire card fits on page; if card is taller than page (rare), break cleanly
    if (totalCardHeight > this.pageHeight - this.marginTop - this.marginBottom) {
      this.ensureSpace(35);
    } else {
      this.ensureSpace(totalCardHeight);
    }

    const cardStartY = this.currentY;

    // Outer card container
    this.pdf.setFillColor(...PALETTE.white);
    this.pdf.setDrawColor(...PALETTE.borderLight);
    this.pdf.roundedRect(this.marginLeft, cardStartY, this.contentWidth, totalCardHeight - 2, 2, 2, 'FD');

    // Left severity vertical accent bar
    this.pdf.setFillColor(...sevColor);
    this.pdf.rect(this.marginLeft, cardStartY, 2, totalCardHeight - 2, 'F');

    let innerY = cardStartY + 5;

    // Severity & Category Badges
    const badgeHeight = 4.5;
    const sevLabel = `${finding.severity.toUpperCase()} RISK`;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(6.5);
    const sevBadgeWidth = this.pdf.getTextWidth(sevLabel) + 5;

    this.pdf.setFillColor(...sevBg);
    this.pdf.setDrawColor(...sevBorder);
    this.pdf.roundedRect(this.marginLeft + 5, innerY, sevBadgeWidth, badgeHeight, 1, 1, 'FD');
    this.pdf.setTextColor(...sevColor);
    this.pdf.text(sevLabel, this.marginLeft + 7.5, innerY + 3.2);

    let nextBadgeX = this.marginLeft + 6 + sevBadgeWidth;

    // Category Badge
    if (category) {
      const catWidth = this.pdf.getTextWidth(category) + 5;
      this.pdf.setFillColor(...PALETTE.cardBg);
      this.pdf.setDrawColor(...PALETTE.borderLight);
      this.pdf.roundedRect(nextBadgeX, innerY, catWidth, badgeHeight, 1, 1, 'FD');
      this.pdf.setTextColor(...PALETTE.slateText);
      this.pdf.text(category, nextBadgeX + 2.5, innerY + 3.2);
      nextBadgeX += catWidth + 2;
    }

    // Verification Status Badge
    if (verification) {
      const verWidth = this.pdf.getTextWidth(verification) + 5;
      this.pdf.setFillColor(...PALETTE.tealLight);
      this.pdf.setDrawColor(...PALETTE.tealBorder);
      this.pdf.roundedRect(nextBadgeX, innerY, verWidth, badgeHeight, 1, 1, 'FD');
      this.pdf.setTextColor(...PALETTE.tealDark);
      this.pdf.text(verification, nextBadgeX + 2.5, innerY + 3.2);
      nextBadgeX += verWidth + 2;
    }

    // Page number if present
    if (pageNum) {
      this.pdf.setTextColor(...PALETTE.slateMuted);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(7);
      this.pdf.text(pageNum, this.marginLeft + this.contentWidth - 22, innerY + 3.2);
    }

    innerY += badgeHeight + 3.5;

    // Finding Title
    this.pdf.setTextColor(...PALETTE.primaryDark);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.text(`${index + 1}. ${title}`, this.marginLeft + 5, innerY);
    innerY += 4;

    // Clause Reference
    this.pdf.setTextColor(...PALETTE.tealDark);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7.5);
    this.pdf.text(`Clause Reference: ${clause}`, this.marginLeft + 5, innerY);
    innerY += 4;

    // Risk Explanation
    this.pdf.setTextColor(...PALETTE.slateText);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.text(explanationLines, this.marginLeft + 5, innerY);
    innerY += explanationHeight + 3;

    // Evidence Citation Box
    const evidenceWidth = this.contentWidth - 10;
    this.pdf.setFillColor(...PALETTE.tealLight);
    this.pdf.setDrawColor(...PALETTE.tealBorder);
    this.pdf.roundedRect(this.marginLeft + 5, innerY, evidenceWidth, evidenceBoxHeight - 2, 1.5, 1.5, 'FD');

    // Evidence Header Tag
    this.pdf.setTextColor(...PALETTE.tealDark);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(6.5);
    this.pdf.text('VERBATIM CONTRACT EVIDENCE CITATION', this.marginLeft + 8, innerY + 4);

    // Evidence Excerpt
    this.pdf.setTextColor(...PALETTE.secondaryDark);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setFontSize(7.5);
    this.pdf.text(evidenceLines, this.marginLeft + 8, innerY + 8);
    innerY += evidenceBoxHeight + 2;

    // Recommendation Box (if available)
    if (recommendation && recLines.length > 0) {
      this.pdf.setFillColor(...PALETTE.amberLight);
      this.pdf.setDrawColor(...PALETTE.amberBorder);
      this.pdf.roundedRect(this.marginLeft + 5, innerY, evidenceWidth, recBoxHeight - 2, 1.5, 1.5, 'FD');

      this.pdf.setTextColor(...PALETTE.amberAccent);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(6.5);
      this.pdf.text('RECOMMENDED CONTRACT REMEDIATION & NEGOTIATION ADVICE', this.marginLeft + 8, innerY + 4);

      this.pdf.setTextColor(...PALETTE.primaryDark);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(7.5);
      this.pdf.text(recLines, this.marginLeft + 8, innerY + 8);
      innerY += recBoxHeight + 2;
    }

    this.currentY = cardStartY + totalCardHeight + 2;
  }

  /**
   * Renders the Actionable Recommendations summary section.
   */
  drawRecommendationsSummary(findings: RiskFinding[]): void {
    const withRecs = findings.filter((f) => f.recommendation && f.recommendation.trim().length > 0);

    if (withRecs.length === 0) {
      this.ensureSpace(12);
      this.pdf.setTextColor(...PALETTE.slateMuted);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.setFontSize(8.5);
      this.pdf.text('No explicit risk mitigation recommendations generated by the application.', this.marginLeft + 4, this.currentY + 4);
      this.currentY += 8;
      return;
    }

    withRecs.forEach((finding, idx) => {
      const rec = cleanPdfText(finding.recommendation);
      const title = cleanPdfText(finding.title);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(8);
      const lines = this.pdf.splitTextToSize(rec, this.contentWidth - 14);
      const blockHeight = lines.length * 3.8 + 8;

      this.ensureSpace(blockHeight + 2);

      this.pdf.setFillColor(...PALETTE.cardBg);
      this.pdf.setDrawColor(...PALETTE.borderLight);
      this.pdf.roundedRect(this.marginLeft, this.currentY, this.contentWidth, blockHeight, 1.5, 1.5, 'FD');

      // Left bar
      this.pdf.setFillColor(...PALETTE.amberAccent);
      this.pdf.rect(this.marginLeft, this.currentY, 1.5, blockHeight, 'F');

      // Title & Advice
      this.pdf.setTextColor(...PALETTE.primaryDark);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(7.5);
      this.pdf.text(`${idx + 1}. Regarding: ${title}`, this.marginLeft + 5, this.currentY + 4);

      this.pdf.setTextColor(...PALETTE.slateText);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(7.5);
      this.pdf.text(lines, this.marginLeft + 5, this.currentY + 8);

      this.currentY += blockHeight + 3;
    });

    this.currentY += 4;
  }

  /**
   * Renders the Legal Disclaimer Box at the conclusion of the report.
   */
  drawDisclaimerBox(): void {
    const disclaimerLines = [
      'IMPORTANT LEGAL & AUDIT NOTICE: This report was automatically compiled by the DocuRisk AI Document Analyzer and Risk Flagger platform using automated text extraction, natural language processing, and rule-based heuristics.',
      'AI-generated outputs may contain inadvertent inaccuracies, misinterpret legal terms of art, or fail to identify nuanced jurisdictional liabilities. This analysis is prepared solely as an informational decision-support aid and DOES NOT constitute legal advice or create an attorney-client relationship.',
      'All findings, risk scores, clause citations, and remediation suggestions should be independently verified by qualified legal counsel prior to contract execution or commercial negotiation.',
    ];

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(7);
    const wrappedLines: string[] = [];
    disclaimerLines.forEach((p) => {
      wrappedLines.push(...this.pdf.splitTextToSize(p, this.contentWidth - 10));
      wrappedLines.push('');
    });

    const boxHeight = wrappedLines.length * 3.2 + 8;
    this.ensureSpace(boxHeight + 4);

    this.pdf.setFillColor(248, 250, 252); // Slate 50
    this.pdf.setDrawColor(203, 213, 225); // Slate 300
    this.pdf.roundedRect(this.marginLeft, this.currentY, this.contentWidth, boxHeight, 2, 2, 'FD');

    // Amber warning tag
    this.pdf.setTextColor(...PALETTE.amberAccent);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(7.5);
    this.pdf.text('LEGAL DISCLAIMER & COMPLIANCE NOTICE', this.marginLeft + 5, this.currentY + 5);

    // Disclaimer body text
    this.pdf.setTextColor(...PALETTE.slateMuted);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(6.8);
    this.pdf.text(wrappedLines, this.marginLeft + 5, this.currentY + 9);

    this.currentY += boxHeight + 6;
  }

  /**
   * Applies running headers and footers across all generated pages.
   * Call this right before saving.
   */
  finalizeDocument(): void {
    const totalPages = this.pdf.getNumberOfPages();

    for (let p = 1; p <= totalPages; p++) {
      this.pdf.setPage(p);

      // Running top header on pages 2+
      if (p > 1) {
        this.pdf.setTextColor(...PALETTE.slateMuted);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setFontSize(7.5);
        this.pdf.text('DocuRisk AI — Contract Analysis & Risk Audit', this.marginLeft, 10);

        const docTitle = cleanPdfText(this.documentName);
        const rightHeader = docTitle.length > 45 ? docTitle.substring(0, 42) + '...' : docTitle;
        this.pdf.text(rightHeader, this.pageWidth - this.marginRight - this.pdf.getTextWidth(rightHeader), 10);

        this.pdf.setDrawColor(...PALETTE.borderLight);
        this.pdf.setLineWidth(0.3);
        this.pdf.line(this.marginLeft, 12, this.pageWidth - this.marginRight, 12);
      }

      // Running footer on all pages
      const footerY = this.pageHeight - 9;
      this.pdf.setDrawColor(...PALETTE.borderLight);
      this.pdf.setLineWidth(0.3);
      this.pdf.line(this.marginLeft, footerY - 4, this.pageWidth - this.marginRight, footerY - 4);

      // Left footer
      this.pdf.setTextColor(...PALETTE.slateMuted);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(7);
      this.pdf.text('DocuRisk AI Document Analyzer & Risk Flagger • Informational Aid', this.marginLeft, footerY);

      // Center generation date
      const dateText = `Generated: ${this.generationDate}`;
      const dateWidth = this.pdf.getTextWidth(dateText);
      this.pdf.text(dateText, (this.pageWidth - dateWidth) / 2, footerY);

      // Right page number
      const pageText = `Page ${p} of ${totalPages}`;
      const pageTextWidth = this.pdf.getTextWidth(pageText);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(pageText, this.pageWidth - this.marginRight - pageTextWidth, footerY);
    }
  }

  /**
   * Triggers browser download with the given filename.
   */
  save(filename: string): void {
    this.finalizeDocument();
    this.pdf.save(filename);
  }
}

/**
 * Public PDF Service API
 */
export const pdfReportService = {
  /**
   * Generates and downloads the Summary-Only PDF.
   * Suggested filename: DocuRisk_Summary_[document-name].pdf
   */
  async downloadSummaryPdf(doc: DocumentItem): Promise<void> {
    if (!doc) {
      throw new Error('No document provided for summary download.');
    }
    if (!doc.summary) {
      throw new Error('Analysis summary is not yet available for this document.');
    }

    const cleanName = sanitizeFilename(doc.name);
    const filename = `DocuRisk_Summary_${cleanName}.pdf`;

    const builder = new PdfDocumentBuilder('DOCUMENT EXECUTIVE SUMMARY', doc.name);

    // 1. Cover / Header Banner
    builder.drawHeaderBanner('EXECUTIVE SUMMARY & OBLIGATIONS', `Document: ${doc.name}`);

    // 2. Metadata Grid
    builder.drawMetadataGrid(doc);

    // 3. Executive Summary
    builder.drawSectionHeader('1. Executive Summary', 'Synthesized by Gemini AI & Commercial Legal Engine');
    builder.drawExecutiveSummary(doc.summary);

    // 4. Key Obligations & Important Findings
    builder.drawSectionHeader('2. Key Obligations & Important Findings', 'Mandatory client / vendor covenants');
    builder.drawKeyObligations(doc.summary.keyObligations || []);

    // 5. Critical Dates & Deadlines
    builder.drawSectionHeader('3. Critical Dates & Milestones', 'Key execution, renewal, and expiry deadlines');
    builder.drawCriticalDates(doc.summary.criticalDates || []);

    // 6. Risk Distribution Snapshot
    builder.drawSectionHeader('4. Risk Findings Overview', 'Identified commercial liabilities count');
    builder.drawRiskDistributionSummary(doc.summary, doc.findings?.length || 0);

    // 7. Disclaimer
    builder.drawDisclaimerBox();

    // Save PDF
    builder.save(filename);
  },

  /**
   * Generates and downloads the Complete Analysis Report PDF.
   * Suggested filename: DocuRisk_Analysis_Report_[document-name].pdf
   */
  async downloadAnalysisReportPdf(doc: DocumentItem): Promise<void> {
    if (!doc) {
      throw new Error('No document provided for analysis report download.');
    }
    if (!doc.summary && (!doc.findings || doc.findings.length === 0)) {
      throw new Error('Detailed analysis results are not yet available for this document.');
    }

    const cleanName = sanitizeFilename(doc.name);
    const filename = `DocuRisk_Analysis_Report_${cleanName}.pdf`;

    const builder = new PdfDocumentBuilder('COMPREHENSIVE CONTRACT ANALYSIS REPORT', doc.name);

    // 1. Cover / Header Banner
    builder.drawHeaderBanner('COMPREHENSIVE CONTRACT ANALYSIS & RISK AUDIT', `Document: ${doc.name}`);

    // 2. Metadata Grid
    builder.drawMetadataGrid(doc);

    // 3. Executive Summary
    if (doc.summary) {
      builder.drawSectionHeader('1. Executive Summary', 'Contract Overview & High-Level Scope');
      builder.drawExecutiveSummary(doc.summary);

      // 4. Key Obligations & Dates
      builder.drawSectionHeader('2. Key Obligations & Critical Dates', 'Extracted commitments and milestone schedules');
      builder.drawKeyObligations(doc.summary.keyObligations || []);
      builder.drawCriticalDates(doc.summary.criticalDates || []);

      // 5. Risk Severity Overview
      builder.drawSectionHeader('3. Risk Breakdown & Severity Distribution', 'Identified commercial exposure');
      builder.drawRiskDistributionSummary(doc.summary, doc.findings?.length || 0);
    }

    // 6. Detailed Detected Risk Findings & Verbatim Clause Citations
    builder.drawSectionHeader(
      '4. Identified Risk Findings & Clause Citations',
      `Detailed audit of ${doc.findings?.length || 0} commercial risk items`
    );

    if (doc.findings && doc.findings.length > 0) {
      doc.findings.forEach((finding, idx) => {
        builder.drawFindingCard(finding, idx);
      });
    } else {
      builder.ensureSpace(12);
      builder.pdf.setTextColor(...PALETTE.slateMuted);
      builder.pdf.setFont('helvetica', 'italic');
      builder.pdf.setFontSize(8.5);
      builder.pdf.text('No risk findings were detected in this document.', builder.marginLeft + 4, builder.currentY + 4);
      builder.currentY += 8;
    }

    // 7. Actionable Recommendations
    if (doc.findings && doc.findings.length > 0) {
      builder.drawSectionHeader('5. Actionable Recommendations & Remediation', 'Negotiation strategy for identified risks');
      builder.drawRecommendationsSummary(doc.findings);
    }

    // 8. Legal Disclaimer
    builder.drawDisclaimerBox();

    // Save PDF
    builder.save(filename);
  },
};
