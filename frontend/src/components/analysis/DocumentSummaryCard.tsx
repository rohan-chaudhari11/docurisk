import React from 'react';
import {
  FileText,
  CheckCircle2,
  Calendar,
  Award,
  Sparkles,
  AlertTriangle,
  Cpu,
  Info,
  Download,
} from 'lucide-react';
import { AnalysisSummary } from '@/types/document';
import { Button } from '@/components/ui/Button';

interface DocumentSummaryCardProps {
  summary: AnalysisSummary;
  onDownloadSummary?: () => void;
  isDownloadingSummary?: boolean;
}

export const DocumentSummaryCard: React.FC<DocumentSummaryCardProps> = ({
  summary,
  onDownloadSummary,
  isDownloadingSummary = false,
}) => {
  const renderProviderBadge = () => {
    const status = summary.executionStatus;
    const provider = summary.actualProvider || '';
    const model = summary.modelName;

    if (status === 'completed' && provider && provider.toLowerCase() !== 'rule') {
      const providerLabel = provider.toLowerCase() === 'gemini' 
        ? 'Gemini' 
        : provider.toUpperCase();
      const displayName = model ? `${providerLabel} (${model})` : `${providerLabel} Synthesis`;
      return (
        <span 
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-300 px-2.5 py-0.5 rounded-full ml-auto"
          title="Executive summary and findings verified from AI model response. Does not constitute formal legal counsel."
        >
          <Sparkles className="w-3 h-3 text-teal-600" aria-hidden="true" />
          <span>{displayName}</span>
        </span>
      );
    }

    if (status === 'fallback') {
      return (
        <span 
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full ml-auto"
          title="AI service encountered an issue; deterministic commercial legal rules were utilized."
        >
          <AlertTriangle className="w-3 h-3 text-amber-600" aria-hidden="true" />
          <span>Rule-Based Fallback</span>
        </span>
      );
    }

    if (status === 'partial') {
      const partialLabel = model ? `Hybrid Partial AI (${model})` : 'Hybrid Partial AI';
      return (
        <span 
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-300 px-2.5 py-0.5 rounded-full ml-auto"
          title="Hybrid execution: partial AI synthesis combined with deterministic rule baseline."
        >
          <Info className="w-3 h-3 text-indigo-600" aria-hidden="true" />
          <span>{partialLabel}</span>
        </span>
      );
    }

    if (status === 'rule_only') {
      return (
        <span 
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full ml-auto"
          title="Analyzed with deterministic rule-based engine (no cloud AI credentials configured)."
        >
          <Cpu className="w-3 h-3 text-slate-500" aria-hidden="true" />
          <span>Deterministic Rule Baseline</span>
        </span>
      );
    }

    if (status === 'failed') {
      return (
        <span 
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-300 px-2.5 py-0.5 rounded-full ml-auto"
          title="Provider analysis failed or was unreachable."
        >
          <AlertTriangle className="w-3 h-3 text-rose-600" aria-hidden="true" />
          <span>Analysis Failed</span>
        </span>
      );
    }

    // Default for legacy records or missing status
    return (
      <span 
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full ml-auto"
        title="Analysis executed prior to provider tracking."
      >
        <span>Provider status unknown — legacy analysis</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Executive Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <FileText className="w-4 h-4" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              Executive Summary
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {renderProviderBadge()}
            {onDownloadSummary && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadSummary}
                isLoading={isDownloadingSummary}
                disabled={isDownloadingSummary}
                leftIcon={<Download className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />}
                className="text-xs py-1"
                title="Download Executive Summary as PDF"
              >
                Download Summary
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {summary.executiveSummary}
        </p>

        {summary.executionStatus === 'fallback' && (
          <div className="mt-3.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="leading-relaxed">
              <strong className="font-semibold block text-amber-950">Deterministic Rule Engine Fallback Active</strong>
              <span>
                {summary.statusMessage || 'The cloud AI provider encountered an issue; analysis and findings were generated using deterministic commercial legal rules.'}
              </span>
            </div>
          </div>
        )}

        {summary.executionStatus === 'partial' && (
          <div className="mt-3.5 rounded-xl border border-indigo-200 bg-indigo-50/80 p-3 text-xs text-indigo-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="leading-relaxed">
              <strong className="font-semibold block text-indigo-950">Partial Provider Execution</strong>
              <span>
                {summary.statusMessage || 'Executive summary was generated by the AI provider, but risk detection fell back to rule-based baseline analysis.'}
              </span>
            </div>
          </div>
        )}

        {summary.executionStatus === 'failed' && (
          <div className="mt-3.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="leading-relaxed">
              <strong className="font-semibold block text-rose-950">Provider Analysis Failed</strong>
              <span>
                {summary.statusMessage || 'The AI service was unreachable or an error occurred during analysis.'}
              </span>
            </div>
          </div>
        )}

        {/* Compliance Score Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-800">
              Contract Compliance Score: {summary.complianceScore}%
            </span>
          </div>
          <div className="w-full sm:w-48">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  summary.complianceScore >= 80
                    ? 'bg-teal-500'
                    : summary.complianceScore >= 70
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${summary.complianceScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Key Obligations & Critical Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Important Points & Key Obligations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Important Points & Obligations
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {summary.keyObligations.map((obligation, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span>{obligation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Dates & Deadlines */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-600" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Critical Dates & Milestones
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {summary.criticalDates.map((dateItem, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 leading-relaxed">
                <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="font-medium">{dateItem}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
