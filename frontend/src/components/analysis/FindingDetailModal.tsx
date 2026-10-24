'use client';

import React, { useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Lightbulb,
  Quote,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { RiskFinding } from '@/types/document';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface FindingDetailModalProps {
  finding: RiskFinding | null;
  onClose: () => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({
  finding,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (finding) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [finding, onClose]);

  if (!finding) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="finding-detail-title"
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="severity" severity={finding.severity} size="md" />
              <Badge variant="category" size="md">
                {finding.category}
              </Badge>
              {finding.pageNumber && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                  <MapPin className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  Page {finding.pageNumber}
                </span>
              )}
            </div>
            <h2 id="finding-detail-title" className="text-lg font-bold text-slate-900 leading-snug">
              {finding.title}
            </h2>
            <p className="text-xs text-teal-800 font-medium">
              Clause: {finding.clauseReference}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Explanation Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              Risk Analysis & Potential Exposure
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              {finding.explanation}
            </div>
          </div>

          {/* Verbatim Supporting Evidence Citation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
              Verbatim Contract Evidence Citation
            </h3>
            <div className="relative p-4 rounded-xl bg-teal-50/30 border border-teal-200/80 text-xs font-serif text-slate-800 italic leading-relaxed">
              <span className="text-teal-600 font-bold not-italic font-sans block text-[11px] mb-1">
                Excerpt from {finding.clauseReference}:
              </span>
              &ldquo;{finding.evidenceSnippet}&rdquo;
            </div>
          </div>

          {/* AI Risk Mitigation Recommendation */}
          {finding.recommendation && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                Recommended Contract Remediation
              </h3>
              <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/80 text-xs text-amber-950 leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong className="block font-semibold mb-0.5">Negotiation Advice:</strong>
                  {finding.recommendation}
                </div>
              </div>
            </div>
          )}

          {/* Illustrative Prototype Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Prototype Note:</span> This finding citation illustrates automated clause-level evidence extraction for presentation review.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done Reviewing
          </Button>
        </div>
      </div>
    </div>
  );
};
