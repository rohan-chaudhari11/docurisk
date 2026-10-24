'use client';

import React from 'react';
import {
  PlusCircle,
  MinusCircle,
  Edit3,
  ShieldAlert,
} from 'lucide-react';
import { ClauseDiff } from '@/types/document';
import { Badge } from '@/components/ui/Badge';

interface ClauseDiffCardProps {
  clause: ClauseDiff;
  versionAName: string;
  versionBName: string;
  viewMode?: 'side-by-side' | 'unified';
}

export const ClauseDiffCard: React.FC<ClauseDiffCardProps> = ({
  clause,
  versionAName,
  versionBName,
  viewMode = 'side-by-side',
}) => {
  const getDiffBadge = () => {
    switch (clause.diffType) {
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-semibold">
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            New Clause Added
          </span>
        );
      case 'removed':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 text-xs font-semibold">
            <MinusCircle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
            Clause Removed
          </span>
        );
      case 'modified':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 text-xs font-semibold">
            <Edit3 className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            Clause Modified
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all hover:border-slate-300">
      {/* Card Header: Section Title, Diff Type, Risk Impact Severity */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {getDiffBadge()}
            <Badge variant="severity" severity={clause.riskImpact.severity} size="md" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1">
            {clause.sectionTitle}
          </h3>
        </div>
      </div>

      {/* Side-by-Side Clause Comparison */}
      <div className="p-5 space-y-4">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Old Clause */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                clause.diffType === 'removed'
                  ? 'border-rose-200 bg-rose-50/40'
                  : clause.diffType === 'added'
                  ? 'border-slate-200 bg-slate-50/40 text-slate-400'
                  : 'border-slate-200 bg-slate-50/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
                    {versionAName} (Original)
                  </span>
                  {clause.diffType === 'removed' && (
                    <span className="text-rose-700 font-semibold lowercase">deleted</span>
                  )}
                </div>

                <div className="text-xs font-serif leading-relaxed text-slate-800">
                  {clause.diffType === 'added' ? (
                    <span className="italic text-slate-400 font-sans">
                      [This section did not exist in baseline version]
                    </span>
                  ) : clause.diffType === 'removed' ? (
                    <del className="bg-rose-100/90 text-rose-950 px-1.5 py-0.5 rounded border border-rose-200 block no-underline line-through leading-relaxed">
                      {clause.oldClause}
                    </del>
                  ) : (
                    <div className="p-2 rounded bg-rose-50/50 border border-rose-100 text-slate-800 leading-relaxed">
                      <span className="text-[10px] text-rose-700 font-sans font-bold block mb-1 uppercase tracking-wide">
                        Original Language:
                      </span>
                      {clause.oldClause}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: New Clause */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                clause.diffType === 'added'
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : clause.diffType === 'removed'
                  ? 'border-slate-200 bg-slate-50/40 text-slate-400'
                  : 'border-teal-200 bg-teal-50/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-teal-800">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal-500" aria-hidden="true" />
                    {versionBName} (Revised)
                  </span>
                  {clause.diffType === 'added' && (
                    <span className="text-emerald-700 font-semibold lowercase">new</span>
                  )}
                </div>

                <div className="text-xs font-serif leading-relaxed text-slate-800">
                  {clause.diffType === 'removed' ? (
                    <span className="italic text-slate-400 font-sans">
                      [Clause was struck/deleted in revised draft]
                    </span>
                  ) : clause.diffType === 'added' ? (
                    <ins className="bg-emerald-100/90 text-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 block no-underline font-normal leading-relaxed">
                      {clause.newClause}
                    </ins>
                  ) : (
                    <div className="p-2 rounded bg-emerald-50/50 border border-emerald-100 text-slate-900 leading-relaxed">
                      <span className="text-[10px] text-teal-700 font-sans font-bold block mb-1 uppercase tracking-wide">
                        Revised Language:
                      </span>
                      {clause.newClause}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Unified Redline View */
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 text-xs font-serif leading-relaxed space-y-2">
            {clause.diffType !== 'added' && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-950">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wide text-rose-700 block mb-1">
                  - Removed from {versionAName}:
                </span>
                <del className="line-through">{clause.oldClause}</del>
              </div>
            )}
            {clause.diffType !== 'removed' && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wide text-emerald-700 block mb-1">
                  + Added in {versionBName}:
                </span>
                <ins className="no-underline font-semibold">{clause.newClause}</ins>
              </div>
            )}
          </div>
        )}

        {/* Risk-Impact Assessment Callout */}
        <div
          className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
            clause.riskImpact.severity === 'high'
              ? 'border-rose-200 bg-rose-50/60 text-rose-950'
              : clause.riskImpact.severity === 'medium'
              ? 'border-amber-200 bg-amber-50/60 text-amber-950'
              : 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
          }`}
        >
          <ShieldAlert
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              clause.riskImpact.severity === 'high'
                ? 'text-rose-600'
                : clause.riskImpact.severity === 'medium'
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
            aria-hidden="true"
          />
          <div>
            <span className="font-bold block mb-0.5">
              Risk-Impact Assessment:
            </span>
            <span>{clause.riskImpact.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
