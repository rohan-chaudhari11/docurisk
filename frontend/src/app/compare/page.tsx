import React from 'react';
import { documentService } from '@/services/documentService';
import { ComparisonView } from '@/components/compare/ComparisonView';
import { VersionComparisonData } from '@/types/document';

export const instant = false;


export default async function ComparePage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const targetId = resolvedParams?.id || 'comp-1';
  let comparisons: VersionComparisonData[] = [];
  let fetchError: string | null = null;

  try {
    comparisons = await documentService.getVersionComparisons(false);
  } catch (err: unknown) {
    fetchError = err instanceof Error ? err.message : String(err);
  }

  return (
    <ComparisonView
      key={targetId}
      initialComparisons={comparisons}
      defaultComparisonId={targetId}
      initialError={fetchError}
    />
  );
}
