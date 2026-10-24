'use client';

import React from 'react';
import {
  GitCompare,
  FileText,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { VersionComparisonData } from '@/types/document';

interface ComparisonSelectorProps {
  comparisons: VersionComparisonData[];
  selectedComparison: VersionComparisonData;
  onSelectComparison: (comparisonId: string) => void;
}

export const ComparisonSelector: React.FC<ComparisonSelectorProps> = ({
  comparisons,
  selectedComparison,
  onSelectComparison,
}) => {
  return (
    <div className="space-y-4">
      {/* Contract Version Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <GitCompare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <label htmlFor="comparison-select" className="text-xs font-bold text-slate-800 block">
              Active Comparison Dataset
            </label>
            <p className="text-[11px] text-slate-500">
              Select contract revision benchmark to inspect clause-level redlines
            </p>
          </div>
        </div>

        <div className="relative min-w-[280px]">
          <select
            id="comparison-select"
            value={selectedComparison.id}
            onChange={(e) => onSelectComparison(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50/80 px-3.5 py-2 pr-9 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-white focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors cursor-pointer"
          >
            {comparisons.map((c) => (
              <option key={c.id} value={c.id}>
                {c.documentTitle} ({c.clauses.length} changed clauses)
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Version Header Cards (Version A vs Version B) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* Baseline Version Box */}
        <div className="md:col-span-5 rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" aria-hidden="true" />
                Version A (Baseline)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Original Draft</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-1">
              {selectedComparison.versionA.versionNumber}
            </h2>
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-700">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="font-mono text-[11px] truncate">{selectedComparison.versionA.fileName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span>Uploaded: {selectedComparison.versionA.uploadedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Comparison Indicator */}
        <div className="md:col-span-2 flex flex-col items-center justify-center p-2 text-center">
          <div className="h-10 w-10 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-2xs mb-1">
            <ArrowRight className="w-5 h-5 hidden md:block" aria-hidden="true" />
            <GitCompare className="w-5 h-5 md:hidden" aria-hidden="true" />
          </div>
          <span className="text-[11px] font-bold text-teal-800">
            {selectedComparison.clauses.length} Clauses Diffed
          </span>
          <span className="text-[10px] text-slate-400">Delta Analysis</span>
        </div>

        {/* Revised Version Box */}
        <div className="md:col-span-5 rounded-xl border border-teal-200 bg-teal-50/20 p-4.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-200">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />
                Version B (Revised)
              </span>
              <span className="text-[10px] text-teal-700 font-semibold">Active Review Target</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-1">
              {selectedComparison.versionB.versionNumber}
            </h2>
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-800">
                <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" aria-hidden="true" />
                <span className="font-mono text-[11px] truncate font-medium">{selectedComparison.versionB.fileName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span>Uploaded: {selectedComparison.versionB.uploadedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Impact Callout */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="leading-relaxed">
          <span className="font-bold block mb-0.5 text-amber-900">
            Overall Version Risk Delta Summary:
          </span>
          <span>{selectedComparison.overallImpact}</span>
        </div>
      </div>
    </div>
  );
};
