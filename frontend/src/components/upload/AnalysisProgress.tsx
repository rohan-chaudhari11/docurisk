'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface AnalysisStage {
  id: number;
  label: string;
  description: string;
}

const STAGES: AnalysisStage[] = [
  { id: 1, label: 'Document received', description: 'File validated, checksum verified, and added to the processing queue' },
  { id: 2, label: 'Extracting text', description: 'Parsing document structure, clause headings, and contractual sections' },
  { id: 3, label: 'Generating summary', description: 'Synthesizing executive summary, key obligations, and milestones' },
  { id: 4, label: 'Identifying potential risks', description: 'Mapping liabilities against High, Medium, and Low risk criteria' },
  { id: 5, label: 'Analysis complete', description: 'Report generated and ready for interactive inspection' },
];

interface AnalysisProgressProps {
  fileName: string;
  onComplete: () => void;
  completedDocId?: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  fileName,
  onComplete,
  completedDocId,
}) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [progressPercent, setProgressPercent] = useState(15);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Stage 1 -> 2: 700ms
    const timer1 = setTimeout(() => {
      setCurrentStage(2);
      setProgressPercent(35);
    }, 700);

    // Stage 2 -> 3: 1600ms
    const timer2 = setTimeout(() => {
      setCurrentStage(3);
      setProgressPercent(60);
    }, 1600);

    // Stage 3 -> 4: 2500ms
    const timer3 = setTimeout(() => {
      setCurrentStage(4);
      setProgressPercent(85);
    }, 2500);

    // Stage 4 -> 5: 3400ms
    const timer4 = setTimeout(() => {
      setCurrentStage(5);
      setProgressPercent(100);
      setIsFinished(true);
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header with Document Context */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-teal-50 text-teal-700 px-2 py-0.5 text-xs font-semibold border border-teal-200">
              <Sparkles className="w-3 h-3 text-teal-600" aria-hidden="true" />
              Simulated Analysis Pipeline
            </span>
            <span className="text-xs text-slate-400 font-medium">Stage {currentStage} of 5</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Analyzing: <span className="text-teal-700">{fileName}</span>
          </h2>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold font-mono text-slate-900">
            {progressPercent}%
          </span>
          <span className="block text-[11px] text-slate-400">Total Progress</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div
          className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Document analysis progress"
        >
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 5-Stage Step Indicators */}
      <div className="space-y-3 pt-2">
        {STAGES.map((stage) => {
          const isDone = currentStage > stage.id || isFinished;
          const isCurrent = currentStage === stage.id && !isFinished;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-teal-300 bg-teal-50/40 shadow-xs ring-1 ring-teal-200'
                  : isDone
                  ? 'border-slate-200/80 bg-slate-50/60'
                  : 'border-slate-100 bg-slate-50/20 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  </div>
                ) : isCurrent ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-700 border border-teal-300">
                    <div className="h-2 w-2 rounded-full bg-teal-600 animate-ping" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-xs font-semibold">
                    {stage.id}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-teal-900 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    Stage {stage.id}: {stage.label}
                  </h3>
                  {isCurrent && (
                    <span className="text-[10px] font-medium text-teal-700 animate-pulse">
                      In progress...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-medium text-teal-700">Completed</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Prototype Simulation Disclosure */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="leading-relaxed">
          <strong className="font-semibold block mb-0.5">
            Simulated Prototype Demonstration Notice
          </strong>
          <span>
            This workflow demonstrates the multi-stage ingestion and automated risk-flagging sequence.
            The findings displayed upon completion are sample results mapped to illustrate standard commercial risk categories (High, Medium, and Low) prior to Java Spring Boot backend integration.
          </span>
        </div>
      </div>

      {/* Completion CTA */}
      {isFinished && completedDocId && (
        <div className="pt-2 flex justify-end">
          <Link href={`/documents/${completedDocId}`}>
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
            >
              View Analysis Results & Risk Flags
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
