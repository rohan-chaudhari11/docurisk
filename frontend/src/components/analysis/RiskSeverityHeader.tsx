import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RiskSeverity } from '@/types/document';

interface RiskSeverityHeaderProps {
  riskCounts: {
    high: number;
    medium: number;
    low: number;
  };
  selectedSeverity?: 'all' | RiskSeverity;
  onSelectSeverity?: (sev: 'all' | RiskSeverity) => void;
}

export const RiskSeverityHeader: React.FC<RiskSeverityHeaderProps> = ({
  riskCounts,
  selectedSeverity = 'all',
  onSelectSeverity,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* High Severity Card */}
      <button
        type="button"
        onClick={() => onSelectSeverity?.(selectedSeverity === 'high' ? 'all' : 'high')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          selectedSeverity === 'high'
            ? 'ring-2 ring-rose-500 border-rose-300 bg-rose-50/70 shadow-sm'
            : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/30'
        }`}
        aria-pressed={selectedSeverity === 'high'}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
            High Risk Flags
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
            <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{riskCounts.high}</span>
          <span className="text-xs text-rose-700 font-semibold">Immediate Action</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Uncapped liabilities or unilateral terms
        </p>
      </button>

      {/* Medium Severity Card */}
      <button
        type="button"
        onClick={() => onSelectSeverity?.(selectedSeverity === 'medium' ? 'all' : 'medium')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          selectedSeverity === 'medium'
            ? 'ring-2 ring-amber-500 border-amber-300 bg-amber-50/70 shadow-sm'
            : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30'
        }`}
        aria-pressed={selectedSeverity === 'medium'}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Medium Risk Flags
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{riskCounts.medium}</span>
          <span className="text-xs text-amber-800 font-semibold">Review Queue</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Clauses requiring negotiation or clarification
        </p>
      </button>

      {/* Low Severity Card */}
      <button
        type="button"
        onClick={() => onSelectSeverity?.(selectedSeverity === 'low' ? 'all' : 'low')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          selectedSeverity === 'low'
            ? 'ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50/70 shadow-sm'
            : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
        }`}
        aria-pressed={selectedSeverity === 'low'}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Low Risk Flags
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{riskCounts.low}</span>
          <span className="text-xs text-emerald-800 font-semibold">Standard Scope</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Procedural terms and minor advisory notes
        </p>
      </button>
    </div>
  );
};
