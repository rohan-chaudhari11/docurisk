import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';
import { DashboardStats } from '@/types/document';
import { Badge } from '@/components/ui/Badge';

interface RiskOverviewCardProps {
  stats: DashboardStats;
}

export const RiskOverviewCard: React.FC<RiskOverviewCardProps> = ({ stats }) => {
  const totalRisks = stats.highRiskCount + stats.mediumRiskCount + stats.lowRiskCount;
  const highPercent = totalRisks ? Math.round((stats.highRiskCount / totalRisks) * 100) : 0;
  const medPercent = totalRisks ? Math.round((stats.mediumRiskCount / totalRisks) * 100) : 0;
  const lowPercent = totalRisks ? Math.round((stats.lowRiskCount / totalRisks) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Risk Distribution Matrix
              </h2>
              <p className="text-[11px] text-slate-500">
                Aggregate breakdown across {stats.totalDocuments} documents
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
            {totalRisks} Total Flags
          </span>
        </div>

        {/* Severity Proportions Stacked Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Severity Ratio</span>
            <span className="text-[11px] text-slate-400">
              {stats.highRiskCount} High • {stats.mediumRiskCount} Medium • {stats.lowRiskCount} Low
            </span>
          </div>
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100" role="progressbar" aria-valuenow={highPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Risk severity ratio">
            <div
              style={{ width: `${highPercent}%` }}
              className="bg-rose-500 transition-all duration-300"
              title={`High Severity: ${highPercent}%`}
            />
            <div
              style={{ width: `${medPercent}%` }}
              className="bg-amber-400 transition-all duration-300"
              title={`Medium Severity: ${medPercent}%`}
            />
            <div
              style={{ width: `${lowPercent}%` }}
              className="bg-teal-500 transition-all duration-300"
              title={`Low Severity: ${lowPercent}%`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
              High ({highPercent}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
              Medium ({medPercent}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-teal-500" aria-hidden="true" />
              Low ({lowPercent}%)
            </span>
          </div>
        </div>

        {/* Category Breakdown List */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Key Risk Categories
          </div>
          <div className="space-y-1.5">
            {stats.riskDistribution.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.severity === 'high'
                        ? 'bg-rose-500'
                        : item.severity === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-teal-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    {item.count} {item.count === 1 ? 'flag' : 'flags'}
                  </span>
                  <Badge variant="severity" severity={item.severity} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          Findings are tagged using legal risk classification algorithms for contract review workflows.
        </span>
      </div>
    </div>
  );
};
