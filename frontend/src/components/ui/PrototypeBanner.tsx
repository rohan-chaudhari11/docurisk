import React from 'react';
import { Info, Sparkles } from 'lucide-react';

export const PrototypeBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white px-4 py-2.5 text-xs border-b border-slate-700 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-teal-500/20 text-teal-300 px-2 py-0.5 font-semibold text-[11px] border border-teal-500/30">
            <Sparkles className="w-3 h-3 text-teal-400" />
            PROTOTYPE PREVIEW
          </span>
          <span className="font-medium text-slate-200">
            AI-Powered Document Summarizer & Risk Flagger Demonstration
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-[11px]">
          <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>Simulated analysis workflow for presentation — Frontend prototype demonstration.</span>
        </div>
      </div>
    </div>
  );
};
