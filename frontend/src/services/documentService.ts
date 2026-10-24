import {
  DocumentItem,
  DashboardStats,
  VersionComparisonData,
  RiskFinding,
} from '@/types/document';
import {
  mockDocuments,
  mockDashboardStats,
  mockVersionComparison,
  mockVersionComparisons,
} from '@/data/mockDocuments';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:8080/api';

/**
 * Service layer for Document & Risk Analysis operations.
 * Communicates strictly with the Spring Boot REST backend.
 * Mock data fixtures are strictly isolated for explicit demo/test requests.
 */
export const documentService = {
  /**
   * Fetch all documents from the backend database.
   * Throws on network/server errors so UI can render error & retry states.
   */
  async getDocuments(demoMode: boolean = false): Promise<DocumentItem[]> {
    if (demoMode) {
      return [...mockDocuments];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'GET',
        headers: { credentials: 'omit' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status} when fetching documents.`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Unable to load documents from backend (${API_BASE_URL}): ${msg}`);
    }
  },

  /**
   * Fetch a single document by ID from the backend database.
   */
  async getDocumentById(id: string, demoMode: boolean = false): Promise<DocumentItem | null> {
    if (demoMode) {
      return mockDocuments.find((d) => d.id === id) || null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: { credentials: 'omit' },
        cache: 'no-store',
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status} for document ${id}.`);
      }

      return await response.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Unable to load document ${id} from backend: ${msg}`);
    }
  },

  /**
   * Fetch a specific risk finding within a document.
   */
  async getFindingById(docId: string, findingId: string): Promise<RiskFinding | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/findings/${encodeURIComponent(findingId)}`, {
        method: 'GET',
        headers: { credentials: 'omit' },
        cache: 'no-store',
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn(`[documentService] Error querying finding ${findingId}:`, err);
    }

    const doc = await this.getDocumentById(docId);
    return doc?.findings?.find((f) => f.id === findingId) || null;
  },

  /**
   * Fetch aggregate statistics and risk distributions for dashboard KPI cards.
   */
  async getDashboardStats(demoMode: boolean = false): Promise<DashboardStats> {
    if (demoMode) {
      return { ...mockDashboardStats };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/stats`, {
        method: 'GET',
        headers: { credentials: 'omit' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status} when fetching dashboard stats.`);
      }

      return await response.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Unable to load dashboard stats from backend: ${msg}`);
    }
  },

  /**
   * Fetch all version comparisons from the backend.
   */
  async getVersionComparisons(demoMode: boolean = false): Promise<VersionComparisonData[]> {
    if (demoMode) {
      return [...mockVersionComparisons];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/comparisons`, {
        method: 'GET',
        headers: { credentials: 'omit' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status} when fetching comparisons.`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Unable to load version comparisons from backend: ${msg}`);
    }
  },

  /**
   * Fetch a specific version comparison redline diff.
   */
  async getVersionComparison(comparisonId: string = 'comp-1', demoMode: boolean = false): Promise<VersionComparisonData | null> {
    if (demoMode) {
      const match = mockVersionComparisons.find((c) => c.id === comparisonId);
      return match ? { ...match } : { ...mockVersionComparison };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/comparisons/${encodeURIComponent(comparisonId)}`, {
        method: 'GET',
        headers: { credentials: 'omit' },
        cache: 'no-store',
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status} for comparison ${comparisonId}.`);
      }

      return await response.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Unable to load comparison ${comparisonId}: ${msg}`);
    }
  },

  /**
   * Upload a real document file to the Spring Boot backend /api/documents/upload.
   * Never silently masks backend upload failures.
   */
  async uploadDocument(file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.message) detail = errJson.message;
      } catch {
        const text = await response.text();
        if (text) detail = text;
      }
      throw new Error(`Upload processing failed: ${detail}`);
    }

    const result = await response.json();
    if (!result.document) {
      throw new Error('Backend response did not contain the processed document payload.');
    }

    return result.document;
  },

  /**
   * Backward-compatible alias for uploadDocument.
   */
  async simulateUploadAndAnalyze(file: File): Promise<DocumentItem> {
    return this.uploadDocument(file);
  },
};
