import React from 'react';
import { documentService } from '@/services/documentService';
import { DocumentAnalysisView } from '@/components/analysis/DocumentAnalysisView';

export const instant = false;

export default async function DocumentAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let doc = null;
  let error: string | null = null;

  try {
    doc = await documentService.getDocumentById(id, false);
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : String(err);
  }

  return <DocumentAnalysisView initialDoc={doc} docId={id} initialError={error} />;
}
