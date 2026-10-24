'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowRight,
  Filter,
  GitCompare,
  FileCode,
} from 'lucide-react';
import { DocumentItem, RiskSeverity } from '@/types/document';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface RecentDocumentsTableProps {
  documents: DocumentItem[];
  searchFilter?: string;
  onClearSearch?: () => void;
}

export const RecentDocumentsTable: React.FC<RecentDocumentsTableProps> = ({
  documents,
  searchFilter = '',
  onClearSearch,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | RiskSeverity>('all');

  const q = searchFilter.toLowerCase().trim();

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      !q ||
      doc.name.toLowerCase().includes(q) ||
      doc.fileType.toLowerCase().includes(q) ||
      (doc.summary?.executiveSummary.toLowerCase().includes(q) ?? false) ||
      (doc.findings?.some((f) =>
        f.title.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.clauseReference.toLowerCase().includes(q)
      ) ?? false);

    const matchesSeverity =
      severityFilter === 'all' || doc.overallRiskLevel === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const highDocCount = documents.filter((d) => d.overallRiskLevel === 'high').length;
  const medDocCount = documents.filter((d) => d.overallRiskLevel === 'medium').length;
  const lowDocCount = documents.filter((d) => d.overallRiskLevel === 'low').length;

  const handleClearFilters = () => {
    setSeverityFilter('all');
    onClearSearch?.();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Recent Documents & Contracts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of uploaded legal agreements with AI risk flag status
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-center" role="group" aria-label="Filter documents by severity">
          <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" /> Filter:
          </span>
          <button
            onClick={() => setSeverityFilter('all')}
            aria-pressed={severityFilter === 'all'}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              severityFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({documents.length})
          </button>
          <button
            onClick={() => setSeverityFilter('high')}
            aria-pressed={severityFilter === 'high'}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              severityFilter === 'high'
                ? 'bg-rose-600 text-white'
                : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            High ({highDocCount})
          </button>
          <button
            onClick={() => setSeverityFilter('medium')}
            aria-pressed={severityFilter === 'medium'}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              severityFilter === 'medium'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            Medium ({medDocCount})
          </button>
          <button
            onClick={() => setSeverityFilter('low')}
            aria-pressed={severityFilter === 'low'}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              severityFilter === 'low'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Low ({lowDocCount})
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th scope="col" className="py-3 px-4">Document Title</th>
              <th scope="col" className="py-3 px-4">Uploaded</th>
              <th scope="col" className="py-3 px-4">Risk Severity</th>
              <th scope="col" className="py-3 px-4">Findings</th>
              <th scope="col" className="py-3 px-4">Compliance</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                    <FileText className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">No documents found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No uploaded contracts match your selected severity filter or search query.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-3 text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer underline"
                  >
                    Clear search and filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Title & Format */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2.5 max-w-sm">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                        {doc.fileType === 'pdf' ? (
                          <FileText className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <FileCode className="h-4 w-4" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/documents/${doc.id}`}
                          className="font-semibold text-slate-900 hover:text-teal-600 transition-colors line-clamp-1 block"
                        >
                          {doc.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-medium">
                          <span className="uppercase">{doc.fileType}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.fileSizeBytes)}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Upload Date */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {formatDate(doc.uploadedAt)}
                  </td>

                  {/* Risk Level Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant="severity" severity={doc.overallRiskLevel} size="sm" />
                  </td>

                  {/* Findings Count */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-slate-900 font-bold">
                        {doc.summary?.totalRisks || 0}
                      </span>
                      <span className="text-slate-500">flags</span>
                      {doc.summary && doc.summary.riskCounts.high > 0 && (
                        <span className="ml-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          {doc.summary.riskCounts.high} high
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Compliance Score Bar */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="w-24">
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                        <span className="text-slate-700">{doc.summary?.complianceScore}%</span>
                        <span className="text-slate-400 font-normal">Score</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (doc.summary?.complianceScore || 0) >= 80
                              ? 'bg-teal-500'
                              : (doc.summary?.complianceScore || 0) >= 70
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${doc.summary?.complianceScore || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant="status" status={doc.status} size="sm" />
                  </td>

                  {/* Action Links */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {doc.id === 'doc-1' && (
                        <Link href="/compare?id=comp-1" title="Compare with baseline v1.2">
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-teal-700 hover:bg-teal-50">
                            <GitCompare className="w-3 h-3 mr-1" aria-hidden="true" />
                            Diff
                          </Button>
                        </Link>
                      )}
                      {doc.id === 'doc-5' && (
                        <Link href="/compare?id=comp-2" title="Compare with renewal draft">
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-teal-700 hover:bg-teal-50">
                            <GitCompare className="w-3 h-3 mr-1" aria-hidden="true" />
                            Diff
                          </Button>
                        </Link>
                      )}
                      <Link href={`/documents/${doc.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                          Inspect
                          <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between p-3.5 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-700">{filteredDocs.length}</strong> of{' '}
          <strong className="text-slate-700">{documents.length}</strong> loaded contracts
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/compare"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-teal-700 font-medium"
          >
            <GitCompare className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            Compare Sample Versions
          </Link>
        </div>
      </div>
    </div>
  );
};
