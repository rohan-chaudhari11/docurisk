'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Quote,
  ArrowRight,
  MapPin,
  FileSearch,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileDown,
} from 'lucide-react';
import { RiskFinding, RiskSeverity } from '@/types/document';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface RiskFindingsListProps {
  findings: RiskFinding[];
  activeSeverityFilter: 'all' | RiskSeverity;
  onSeverityFilterChange: (sev: 'all' | RiskSeverity) => void;
  onSelectFinding: (finding: RiskFinding) => void;
  onDownloadReport?: () => void;
  isDownloadingReport?: boolean;
}

export const RiskFindingsList: React.FC<RiskFindingsListProps> = ({
  findings,
  activeSeverityFilter,
  onSeverityFilterChange,
  onSelectFinding,
  onDownloadReport,
  isDownloadingReport = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.toLowerCase().trim();

  const filteredFindings = findings.filter((finding) => {
    const matchesSeverity =
      activeSeverityFilter === 'all' || finding.severity === activeSeverityFilter;

    const matchesSearch =
      !q ||
      finding.title.toLowerCase().includes(q) ||
      finding.category.toLowerCase().includes(q) ||
      finding.clauseReference.toLowerCase().includes(q) ||
      finding.explanation.toLowerCase().includes(q) ||
      finding.evidenceSnippet.toLowerCase().includes(q);

    return matchesSeverity && matchesSearch;
  });

  const highCount = findings.filter((f) => f.severity === 'high').length;
  const medCount = findings.filter((f) => f.severity === 'medium').length;
  const lowCount = findings.filter((f) => f.severity === 'low').length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" aria-hidden="true" />
              Identified Risk Findings & Clause Citations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any finding to inspect verbatim clause evidence, explanation, and negotiation recommendations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search findings or clauses..."
                aria-label="Filter findings by keyword"
                className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            {onDownloadReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadReport}
                isLoading={isDownloadingReport}
                disabled={isDownloadingReport}
                leftIcon={<FileDown className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />}
                className="shrink-0 text-xs py-1"
                title="Download Complete Analysis Report as PDF"
              >
                Download Report
              </Button>
            )}
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Filter findings by severity">
          <button
            onClick={() => onSeverityFilterChange('all')}
            aria-pressed={activeSeverityFilter === 'all'}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              activeSeverityFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Findings ({findings.length})
          </button>
          <button
            onClick={() => onSeverityFilterChange('high')}
            aria-pressed={activeSeverityFilter === 'high'}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              activeSeverityFilter === 'high'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            High Risk ({highCount})
          </button>
          <button
            onClick={() => onSeverityFilterChange('medium')}
            aria-pressed={activeSeverityFilter === 'medium'}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              activeSeverityFilter === 'medium'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            Medium Risk ({medCount})
          </button>
          <button
            onClick={() => onSeverityFilterChange('low')}
            aria-pressed={activeSeverityFilter === 'low'}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              activeSeverityFilter === 'low'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Low Risk ({lowCount})
          </button>
        </div>
      </div>

      {/* Findings List */}
      <div className="divide-y divide-slate-100 p-5 space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <FileSearch className="h-10 w-10 text-slate-300 mx-auto mb-2" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-800">No findings matched your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting the severity filter or clearing the search query.
            </p>
            {(activeSeverityFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  onSeverityFilterChange('all');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer underline"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <div
              key={finding.id}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs transition-all space-y-3"
            >
              {/* Finding Title & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="severity" severity={finding.severity} size="sm" />
                    <Badge variant="category" size="sm">
                      {finding.category}
                    </Badge>
                    {finding.findingSource === 'llm' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                        <Sparkles className="w-2.5 h-2.5 text-teal-600" aria-hidden="true" />
                        AI Finding
                      </span>
                    )}
                    {finding.findingSource === 'hybrid' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                        Hybrid Match
                      </span>
                    )}
                    {finding.findingSource === 'rule' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        Rule Baseline
                      </span>
                    )}
                    {finding.evidenceStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" aria-hidden="true" />
                        Verified Quote
                      </span>
                    )}
                    {finding.evidenceStatus === 'unverified' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" aria-hidden="true" />
                        Unverified Quote
                      </span>
                    )}
                    {finding.pageNumber && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" aria-hidden="true" />
                        Page {finding.pageNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {finding.title}
                  </h3>
                  <p className="text-xs text-teal-800 font-medium">
                    {finding.clauseReference}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectFinding(finding)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
                  className="self-start sm:self-center shrink-0"
                >
                  Inspect Evidence
                </Button>
              </div>

              {/* Explanation Paragraph */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {finding.explanation}
              </p>

              {/* Verbatim Supporting Evidence Excerpt */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-serif italic text-slate-700 leading-relaxed flex items-start gap-2">
                <Quote className="w-4 h-4 text-teal-600 shrink-0 not-italic mt-0.5" aria-hidden="true" />
                <span>&ldquo;{finding.evidenceSnippet}&rdquo;</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
