'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  FileCode,
  ArrowLeft,
  UploadCloud,
  ShieldAlert,
  Info,
  GitCompare,
} from 'lucide-react';
import { DocumentItem, RiskSeverity, RiskFinding } from '@/types/document';
import { documentService } from '@/services/documentService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { DocumentSummaryCard } from '@/components/analysis/DocumentSummaryCard';
import { RiskSeverityHeader } from '@/components/analysis/RiskSeverityHeader';
import { RiskFindingsList } from '@/components/analysis/RiskFindingsList';
import { FindingDetailModal } from '@/components/analysis/FindingDetailModal';

interface DocumentAnalysisViewProps {
  initialDoc: DocumentItem | null;
  docId: string;
  initialError?: string | null;
}

export const DocumentAnalysisView: React.FC<DocumentAnalysisViewProps> = ({
  initialDoc,
  docId,
  initialError = null,
}) => {
  const [doc, setDoc] = useState<DocumentItem | null>(initialDoc);
  const [loading, setLoading] = useState<boolean>(!initialDoc && !initialError);
  const [error, setError] = useState<string | null>(initialError);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | RiskSeverity>('all');
  const [inspectingFinding, setInspectingFinding] = useState<RiskFinding | null>(null);

  const fetchDoc = async (demo: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const found = await documentService.getDocumentById(docId, demo);
      if (found) {
        setDoc(found);
        setIsDemoMode(demo);
      } else if (demo) {
        // Fallback to first mock doc if specific ID not found in demo fixtures
        const fallback = await documentService.getDocumentById('doc-1', true);
        setDoc(fallback);
        setIsDemoMode(true);
      } else {
        setDoc(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialDoc || initialError) {
      return;
    }

    let ignore = false;
    documentService
      .getDocumentById(docId, false)
      .then((found) => {
        if (!ignore) {
          setDoc(found);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!ignore) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [docId, initialDoc, initialError]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
          <div className="h-32 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
            <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
            <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
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
          </div>

          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mb-4">
              <ShieldAlert className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Backend Communication Error</h1>
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 max-w-lg mx-auto mt-2 leading-relaxed">
              {error}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-3 leading-relaxed">
              Ensure the Spring Boot backend service is running on port 8080 and MySQL is accessible.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="primary" size="md" onClick={() => fetchDoc(false)}>
                Retry Connection
              </Button>
              <Button variant="secondary" size="md" onClick={() => fetchDoc(true)}>
                Load Demo Contract Fixture
              </Button>
              <Link href="/">
                <Button variant="outline" size="md">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
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
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-4">
              <ShieldAlert className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Document Not Found</h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              The document with identifier <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">{docId}</code> was not found in the database.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/">
                <Button variant="primary" size="md">
                  Return to Dashboard
                </Button>
              </Link>
              <Link href="/upload">
                <Button variant="secondary" size="md">
                  Upload a Document
                </Button>
              </Link>
              <Button variant="outline" size="md" onClick={() => fetchDoc(true)}>
                Explore Sample Contract Fixture
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Header />

      <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* Navigation Breadcrumb & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                Dashboard
              </Button>
            </Link>
            <span className="text-xs text-slate-400">/ Document Analysis / {doc.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href={doc.id === 'doc-5' ? '/compare?id=comp-2' : '/compare?id=comp-1'}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<GitCompare className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />}
              >
                Compare Versions
              </Button>
            </Link>
            <Link href="/upload">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<UploadCloud className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                Upload Another
              </Button>
            </Link>
          </div>
        </div>

        {/* Document Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 shrink-0 border border-teal-200/60 shadow-2xs">
                {doc.fileType === 'pdf' ? (
                  <FileText className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <FileCode className="h-6 w-6" aria-hidden="true" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-snug">
                  {doc.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                  <span className="uppercase">{doc.fileType}</span>
                  <span>•</span>
                  <span>{formatFileSize(doc.fileSizeBytes)}</span>
                  <span>•</span>
                  <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <Badge variant="severity" severity={doc.overallRiskLevel} size="md" />
              <Badge variant="status" status={doc.status} size="md" />
              {isDemoMode && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  Demo Fixture
                </span>
              )}
            </div>
          </div>

          {/* Prototype Transparency Banner - Only in Demo Mode */}
          {isDemoMode && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="leading-relaxed">
                <strong className="font-semibold block mb-0.5">
                  Demonstration Prototype Fixture
                </strong>
                <span>
                  The executive summary, key obligations, and risk findings displayed below are simulated sample data for testing the UI. Upload a real document to see real backend extraction and analysis.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Document Processing Failure Banner */}
        {doc.status === 'failed' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-900 flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="leading-relaxed">
              <strong className="font-semibold block text-rose-950 text-sm">
                Document Processing Failed
              </strong>
              <span>
                {doc.summary?.executionStatus === 'legacy'
                  ? 'Backend document processing encountered a failure during historical ingestion. Historical provider outcome is unknown (record pre-dates provider telemetry tracking).'
                  : doc.summary?.statusMessage || 'Text extraction or pipeline execution failed for this document.'}
              </span>
            </div>
          </div>
        )}

        {/* Risk Counts by Severity KPI Header */}
        {doc.summary && (
          <section aria-label="Risk Severity Overview">
            <RiskSeverityHeader
              riskCounts={doc.summary.riskCounts}
              selectedSeverity={selectedSeverity}
              onSelectSeverity={(sev) => setSelectedSeverity(sev)}
            />
          </section>
        )}

        {/* Executive Summary, Key Obligations, and Critical Dates */}
        {doc.summary && (
          <section aria-label="Executive Summary and Obligations">
            <DocumentSummaryCard summary={doc.summary} />
          </section>
        )}

        {/* Filterable Risk Findings List & Evidence Explorer */}
        {doc.findings && doc.findings.length > 0 && (
          <section aria-label="Risk Findings List">
            <RiskFindingsList
              findings={doc.findings}
              activeSeverityFilter={selectedSeverity}
              onSeverityFilterChange={(sev) => setSelectedSeverity(sev)}
              onSelectFinding={(f) => setInspectingFinding(f)}
            />
          </section>
        )}
      </main>

      {/* Modal Inspector for Individual Finding */}
      <FindingDetailModal
        finding={inspectingFinding}
        onClose={() => setInspectingFinding(null)}
      />
    </div>
  );
};
