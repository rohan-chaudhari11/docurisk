import React from 'react';
import Link from 'next/link';
import { UploadCloud, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const QuickUploadWidget: React.FC = () => {
  return (
    <div className="rounded-xl border border-dashed border-teal-300 bg-gradient-to-br from-teal-50/40 via-white to-slate-50 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
            <UploadCloud className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/70 border border-teal-200 px-2 py-0.5 rounded-full">
            Quick Ingestion
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-900">
          Upload New Legal Document
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Ingest contracts, NDAs, or SLAs to generate executive summaries and flag high-risk liabilities.
        </p>

        <div className="mt-4 rounded-lg bg-white p-3 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-around text-center text-xs text-slate-600">
            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-900 text-xs">PDF</span>
              <span className="text-[10px] text-slate-400">Contracts & Scans</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-900 text-xs">DOCX</span>
              <span className="text-[10px] text-slate-400">Word Drafts</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-900 text-xs">Auto</span>
              <span className="text-[10px] text-slate-400">Risk Tagging</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-200/60">
        <Link href="/upload" className="block">
          <Button
            variant="secondary"
            size="md"
            className="w-full justify-between"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Launch Upload Wizard
          </Button>
        </Link>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Interactive preview demonstration • Simulated AI analysis pipeline
        </p>
      </div>
    </div>
  );
};
