'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { DocumentDropzone } from '@/components/upload/DocumentDropzone';
import { AnalysisProgress } from '@/components/upload/AnalysisProgress';
import { documentService } from '@/services/documentService';

export default function UploadPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingFileName, setAnalyzingFileName] = useState('');
  const [completedDocId, setCompletedDocId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleStartAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setAnalyzingFileName(file.name);
    setUploadError(null);

    try {
      const newDoc = await documentService.uploadDocument(file);
      setCompletedDocId(newDoc.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Failed to process document upload:', err);
      setUploadError(msg);
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisCompleted = () => {
    // Stage completed callback
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Header />

      <main className="flex-1 p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                Back to Dashboard
              </Button>
            </Link>
            <span className="text-xs text-slate-400">/ Ingestion Wizard</span>
          </div>

          {isAnalyzing && (
            <button
              onClick={() => {
                setIsAnalyzing(false);
                setCompletedDocId(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Reset Upload
            </button>
          )}
        </div>

        {/* Page Title & Context */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <span>Document Ingestion</span>
            <span>•</span>
            <span>Step 1: Upload & Parse</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Upload & Analyze Legal Document
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Ingest PDF contracts or Word agreements to simulate text extraction, clause classification, and automated risk scoring.
          </p>
        </div>

        {/* Error State Banner */}
        {uploadError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-rose-950">Upload Processing Failed</p>
                <p className="mt-1 text-rose-800 leading-relaxed">{uploadError}</p>
                <p className="mt-1 text-[11px] text-rose-600">
                  Verify that the backend service and AI service are operational, and that the file format is supported (.pdf, .docx, .txt).
                </p>
              </div>
              <button
                onClick={() => setUploadError(null)}
                className="text-xs font-semibold text-rose-700 hover:text-rose-950 px-2 py-1 bg-white rounded border border-rose-200 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Upload or Progress View */}
        {!isAnalyzing ? (
          <DocumentDropzone
            onAnalyze={handleStartAnalysis}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <AnalysisProgress
            fileName={analyzingFileName}
            completedDocId={completedDocId || undefined}
            onComplete={handleAnalysisCompleted}
          />
        )}
      </main>
    </div>
  );
}
