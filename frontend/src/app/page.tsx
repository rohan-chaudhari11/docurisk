'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  GitCompare,
  RefreshCw,
  AlertCircle,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { RecentDocumentsTable } from '@/components/dashboard/RecentDocumentsTable';
import { RiskOverviewCard } from '@/components/dashboard/RiskOverviewCard';
import { QuickUploadWidget } from '@/components/dashboard/QuickUploadWidget';
import { documentService } from '@/services/documentService';
import { DocumentItem, DashboardStats } from '@/types/document';

const emptyStats: DashboardStats = {
  totalDocuments: 0,
  highRiskCount: 0,
  mediumRiskCount: 0,
  lowRiskCount: 0,
  avgComplianceScore: 0,
  riskDistribution: [],
};

function SearchQuerySync({ onSync }: { onSync: (q: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      onSync(query);
    }
  }, [searchParams, onSync]);
  return null;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadData = useCallback(async (demo: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const [docsData, statsData] = await Promise.all([
        documentService.getDocuments(demo),
        documentService.getDashboardStats(demo),
      ]);
      setDocuments(docsData);
      setStats(statsData);
      setIsDemoMode(demo);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setDocuments([]);
      setStats(emptyStats);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      documentService.getDocuments(false),
      documentService.getDashboardStats(false),
    ])
      .then(([docsData, statsData]) => {
        if (!ignore) {
          setDocuments(docsData);
          setStats(statsData);
          setIsDemoMode(false);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
          setDocuments([]);
          setStats(emptyStats);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Suspense fallback={null}>
        <SearchQuerySync onSync={(q) => setSearchQuery(q)} />
      </Suspense>

      {/* Top Header with live search input */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
      />

      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Page Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <span>Legal AI Suite</span>
              <span>•</span>
              <span>Audit Dashboard</span>
              {isDemoMode && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  Demo Fixture Mode
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Document Risk & Summary Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Centralized dashboard tracking contract obligations, high-risk liabilities, and automated clause flags.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => loadData(isDemoMode)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link href="/compare">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<GitCompare className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                Compare Versions
              </Button>
            </Link>

            <Link href="/upload">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UploadCloud className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                New Upload
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold">Demo Fixtures Active</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You are viewing mock contract fixtures. These records do not originate from the real MySQL database.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(false)}
              className="bg-white hover:bg-amber-100/50 self-start sm:self-auto shrink-0"
            >
              Switch to Live Database
            </Button>
          </div>
        )}

        {/* Backend Connection Error Banner */}
        {error && !isDemoMode && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-rose-950">Backend Connection Error</h3>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  {error}
                </p>
                <p className="text-[11px] text-rose-600 mt-1">
                  Ensure the Java Spring Boot service is running on <code>http://localhost:8080</code> and connected to MySQL.
                </p>
                <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => loadData(false)}
                    leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
                  >
                    Retry Connection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadData(true)}
                  >
                    View Offline Demo Fixtures
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-800">Connecting to DocuRisk Backend...</h3>
            <p className="text-xs text-slate-500 mt-1">Querying MySQL document repository and active risk metrics.</p>
          </div>
        )}

        {/* KPI Stat Cards Grid */}
        <section aria-label="Key Performance Metrics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Documents"
              value={stats.totalDocuments}
              subtitle="Parsed contracts and agreements"
              icon={<FileText className="w-5 h-5 text-slate-700" aria-hidden="true" />}
              iconBgColor="bg-slate-100"
              trendText={stats.totalDocuments > 0 ? "Repository Active" : "Empty"}
              trendPositive={stats.totalDocuments > 0}
            />

            <StatCard
              title="High Risks Detected"
              value={stats.highRiskCount}
              subtitle="Urgent financial or legal exposure"
              icon={<ShieldAlert className="w-5 h-5 text-rose-600" aria-hidden="true" />}
              iconBgColor="bg-rose-50"
              trendText="High Severity"
              trendPositive={false}
            />

            <StatCard
              title="Medium Risk Warnings"
              value={stats.mediumRiskCount}
              subtitle="Clauses requiring negotiation"
              icon={<AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />}
              iconBgColor="bg-amber-50"
              trendText="Medium Severity"
              trendPositive={false}
            />

            <StatCard
              title="Avg. Compliance Score"
              value={`${stats.avgComplianceScore}%`}
              subtitle="Benchmark against standard terms"
              icon={<CheckCircle2 className="w-5 h-5 text-teal-600" aria-hidden="true" />}
              iconBgColor="bg-teal-50"
              trendText="Enterprise Grade"
              trendPositive={true}
            />
          </div>
        </section>

        {/* Risk Distribution & Quick Actions Row */}
        <section aria-label="Risk Distribution and Ingestion" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RiskOverviewCard stats={stats} />
          </div>
          <div>
            <QuickUploadWidget />
          </div>
        </section>

        {/* Recent Documents Table or Empty State Section */}
        <section aria-label="Recent Documents Table">
          {!isLoading && !error && documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3">
                <Database className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Documents In Database</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                The database repository is currently empty. Upload a PDF, DOCX, or TXT contract to extract covenants and detect legal risks.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href="/upload">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Upload First Document
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => loadData(true)}>
                  Load Sample Fixtures
                </Button>
              </div>
            </div>
          ) : (
            <RecentDocumentsTable
              documents={documents}
              searchFilter={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          )}
        </section>
      </main>
    </div>
  );
}
