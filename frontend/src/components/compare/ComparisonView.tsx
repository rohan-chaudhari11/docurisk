'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  GitCompare,
  ArrowLeft,
  Columns2,
  Rows3,
  Search,
  X,
  Info,
  UploadCloud,
  FileText,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  Edit3,
} from 'lucide-react';
import { VersionComparisonData, RiskSeverity } from '@/types/document';
import { ComparisonSelector } from '@/components/compare/ComparisonSelector';
import { ClauseDiffCard } from '@/components/compare/ClauseDiffCard';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { documentService } from '@/services/documentService';

interface ComparisonViewProps {
  initialComparisons: VersionComparisonData[];
  defaultComparisonId?: string;
  initialError?: string | null;
}

function ComparisonParamSync({
  onSync,
}: {
  onSync: (comparisonId: string) => void;
}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      onSync(id);
    }
  }, [searchParams, onSync]);
  return null;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  initialComparisons,
  defaultComparisonId = 'comp-1',
  initialError = null,
}) => {
  const [comparisons, setComparisons] = useState<VersionComparisonData[]>(initialComparisons);
  const [selectedComparisonId, setSelectedComparisonId] = useState<string>(defaultComparisonId);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [diffFilter, setDiffFilter] = useState<'all' | 'modified' | 'added' | 'removed'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | RiskSeverity>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(initialError);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const activeComparison =
    comparisons.find((c) => c.id === selectedComparisonId) ||
    comparisons[0] ||
    null;

  const loadDemoComparisons = async () => {
    setLoading(true);
    try {
      const demoData = await documentService.getVersionComparisons(true);
      setComparisons(demoData);
      setIsDemoMode(true);
      setError(null);
      if (demoData.length > 0) {
        setSelectedComparisonId(demoData[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const liveData = await documentService.getVersionComparisons(false);
      setComparisons(liveData);
      setIsDemoMode(false);
      if (liveData.length > 0) {
        setSelectedComparisonId(liveData[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleComparisonChange = (newId: string) => {
    setSelectedComparisonId(newId);
    setDiffFilter('all');
    setSeverityFilter('all');
    setSearchQuery('');
  };

  const handleResetFilters = () => {
    setDiffFilter('all');
    setSeverityFilter('all');
    setSearchQuery('');
  };

  // Filter clauses based on diff type, risk severity, and search text
  const clauses = activeComparison ? activeComparison.clauses : [];
  const filteredClauses = clauses.filter((clause) => {
    // Diff type filter
    if (diffFilter !== 'all' && clause.diffType !== diffFilter) {
      return false;
    }

    // Severity filter
    if (severityFilter !== 'all' && clause.riskImpact.severity !== severityFilter) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = clause.sectionTitle.toLowerCase().includes(q);
      const matchesOld = clause.oldClause.toLowerCase().includes(q);
      const matchesNew = clause.newClause.toLowerCase().includes(q);
      const matchesRisk = clause.riskImpact.description.toLowerCase().includes(q);
      if (!matchesTitle && !matchesOld && !matchesNew && !matchesRisk) {
        return false;
      }
    }

    return true;
  });

  // Calculate metrics for active comparison
  const totalClauses = clauses.length;
  const modifiedCount = clauses.filter((c) => c.diffType === 'modified').length;
  const addedCount = clauses.filter((c) => c.diffType === 'added').length;
  const removedCount = clauses.filter((c) => c.diffType === 'removed').length;

  const highRiskCount = clauses.filter((c) => c.riskImpact.severity === 'high').length;
  const medRiskCount = clauses.filter((c) => c.riskImpact.severity === 'medium').length;
  const lowRiskCount = clauses.filter((c) => c.riskImpact.severity === 'low').length;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Suspense fallback={null}>
        <ComparisonParamSync onSync={handleComparisonChange} />
      </Suspense>

      <Header />

      <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* Navigation Breadcrumbs & Top Actions */}
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
            <span className="text-xs text-slate-400">
              / Version Comparison & Diff
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/documents/doc-1">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileText className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                View Single Document
              </Button>
            </Link>
            <Link href="/upload">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<UploadCloud className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                Upload Revision
              </Button>
            </Link>
          </div>
        </div>

        {/* Page Banner Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 shrink-0 border border-teal-200/60 shadow-2xs">
                <GitCompare className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-snug">
                  Document Version Comparison & Risk Diff
                </h1>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Interactive side-by-side clause comparison between contract revisions. Highlights added, removed, and modified clauses with illustrative risk-impact assessments.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" aria-hidden="true" />
                Live Redline Engine
              </span>
            </div>
          </div>

          {/* Status & Mode Banners */}
          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong className="font-semibold block">Backend Connection Error</strong>
                  <span>{error}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleRetry} isLoading={loading}>
                  Retry Connection
                </Button>
                <Button variant="secondary" size="sm" onClick={loadDemoComparisons} isLoading={loading}>
                  View Demo Comparison
                </Button>
              </div>
            </div>
          )}

          {isDemoMode && !error && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Demo Mode Active:</strong> Viewing illustrative contract redline diff fixtures.
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry} isLoading={loading}>
                Reconnect Live Data
              </Button>
            </div>
          )}
        </div>

        {/* Empty Comparison State */}
        {!activeComparison ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <GitCompare className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-slate-900">No Document Comparisons Available</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              No contract version comparisons are currently stored in the database. You can upload revisions to generate real comparison diffs, or explore sample benchmark data.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/upload">
                <Button variant="primary" size="sm">
                  Upload Contract Revision
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={loadDemoComparisons} isLoading={loading}>
                Load Sample Comparison Fixtures
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Comparison Selector & Version Metadata Cards */}
            <section aria-label="Version Selector and Metadata">
              <ComparisonSelector
                comparisons={comparisons}
                selectedComparison={activeComparison}
                onSelectComparison={handleComparisonChange}
              />
            </section>

        {/* Change Statistics Breakdown Bar */}
        <section aria-label="Comparison Summary Metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs text-center">
            <span className="text-[11px] font-medium text-slate-500 block">Total Clause Changes</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">{totalClauses}</span>
            <span className="text-[10px] text-slate-400">Audited in revision</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs text-center">
            <span className="text-[11px] font-medium text-slate-500 block">Modified Clauses</span>
            <span className="text-lg font-bold text-amber-700 mt-0.5 block">{modifiedCount}</span>
            <span className="text-[10px] text-amber-600 font-medium">Changed wording</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs text-center">
            <span className="text-[11px] font-medium text-slate-500 block">New Additions</span>
            <span className="text-lg font-bold text-emerald-700 mt-0.5 block">{addedCount}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Added sections</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs text-center">
            <span className="text-[11px] font-medium text-slate-500 block">High Risk Deltas</span>
            <span className="text-lg font-bold text-rose-700 mt-0.5 block">{highRiskCount}</span>
            <span className="text-[10px] text-rose-600 font-medium">Uncapped exposure</span>
          </div>
        </section>

        {/* Filter Controls, Search, and View Mode Toolbar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search changed clauses or risk keywords..."
                aria-label="Search changed clauses or risk keywords"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* View Mode Toggle: Side-by-Side vs Unified Redline */}
            <div className="flex items-center gap-1.5 self-start md:self-center bg-slate-100 p-1 rounded-lg border border-slate-200" role="group" aria-label="Comparison View Layout">
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                aria-pressed={viewMode === 'side-by-side'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'side-by-side'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                <span>Side-by-Side Split</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('unified')}
                aria-pressed={viewMode === 'unified'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'unified'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Rows3 className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                <span>Unified Redline</span>
              </button>
            </div>
          </div>

          {/* Filter Pills: Diff Type and Risk Severity */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* Diff Type Filter Group */}
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by clause diff type">
              <span className="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider">
                Diff Type:
              </span>
              <button
                type="button"
                onClick={() => setDiffFilter('all')}
                aria-pressed={diffFilter === 'all'}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                  diffFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({totalClauses})
              </button>
              <button
                type="button"
                onClick={() => setDiffFilter('modified')}
                aria-pressed={diffFilter === 'modified'}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                  diffFilter === 'modified'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Edit3 className="w-3 h-3" aria-hidden="true" />
                Modified ({modifiedCount})
              </button>
              <button
                type="button"
                onClick={() => setDiffFilter('added')}
                aria-pressed={diffFilter === 'added'}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                  diffFilter === 'added'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <PlusCircle className="w-3 h-3" aria-hidden="true" />
                Added ({addedCount})
              </button>
              <button
                type="button"
                onClick={() => setDiffFilter('removed')}
                aria-pressed={diffFilter === 'removed'}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                  diffFilter === 'removed'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <MinusCircle className="w-3 h-3" aria-hidden="true" />
                Removed ({removedCount})
              </button>
            </div>

            {/* Risk Severity Filter Group */}
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by risk severity">
              <span className="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider">
                Risk Impact:
              </span>
              <button
                type="button"
                onClick={() => setSeverityFilter('all')}
                aria-pressed={severityFilter === 'all'}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                  severityFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('high')}
                aria-pressed={severityFilter === 'high'}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                  severityFilter === 'high'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                }`}
              >
                High ({highRiskCount})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('medium')}
                aria-pressed={severityFilter === 'medium'}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                  severityFilter === 'medium'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
                }`}
              >
                Medium ({medRiskCount})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('low')}
                aria-pressed={severityFilter === 'low'}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                  severityFilter === 'low'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                Low ({lowRiskCount})
              </button>
            </div>
          </div>
        </div>

        {/* Clause Diff Results List */}
        <section aria-label="Audited Changed Clauses" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Displaying <strong className="text-slate-800 font-semibold">{filteredClauses.length}</strong> of{' '}
              <strong className="text-slate-800 font-semibold">{totalClauses}</strong> changed clauses
            </span>
            {(diffFilter !== 'all' || severityFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-teal-700 hover:text-teal-800 font-semibold underline cursor-pointer"
              >
                Reset active filters
              </button>
            )}
          </div>

          {filteredClauses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <AlertCircle className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold text-slate-900">No Changed Clauses Found</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                No clauses match your selected filters (Diff Type: {diffFilter}, Severity: {severityFilter}
                {searchQuery ? `, Query: "${searchQuery}"` : ''}).
              </p>
              <div className="mt-5">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Search & Filters
                </Button>
              </div>
            </div>
          ) : (
            filteredClauses.map((clause) => (
              <ClauseDiffCard
                key={clause.id}
                clause={clause}
                versionAName={activeComparison.versionA.versionNumber}
                versionBName={activeComparison.versionB.versionNumber}
                viewMode={viewMode}
              />
            ))
          )}
        </section>
          </>
        )}
      </main>
    </div>
  );
};
