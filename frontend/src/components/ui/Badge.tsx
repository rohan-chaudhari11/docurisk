import React from 'react';
import { RiskSeverity, DocumentStatus } from '@/types/document';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'severity' | 'status' | 'category' | 'outline' | 'neutral';
  severity?: RiskSeverity;
  status?: DocumentStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  severity,
  status,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (variant === 'severity' || severity) {
    const sev = severity || 'low';
    const severityStyles: Record<RiskSeverity, string> = {
      high: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
      medium: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
      low: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium',
    };

    const labels: Record<RiskSeverity, string> = {
      high: 'High Risk',
      medium: 'Medium Risk',
      low: 'Low Risk',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${severityStyles[sev]} ${className}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            sev === 'high' ? 'bg-rose-600' : sev === 'medium' ? 'bg-amber-600' : 'bg-emerald-600'
          }`}
          aria-hidden="true"
        />
        {children || labels[sev]}
      </span>
    );
  }

  if (variant === 'status' || status) {
    const st = status || 'analyzed';
    const statusStyles: Record<DocumentStatus, string> = {
      analyzed: 'bg-teal-50 text-teal-800 border-teal-200',
      processing: 'bg-sky-50 text-sky-800 border-sky-200',
      failed: 'bg-rose-50 text-rose-800 border-rose-200',
    };

    const statusLabels: Record<DocumentStatus, string> = {
      analyzed: 'Analyzed',
      processing: 'Processing',
      failed: 'Failed',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses} ${statusStyles[st]} ${className}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            st === 'analyzed' ? 'bg-teal-600' : st === 'processing' ? 'bg-sky-600' : 'bg-rose-600'
          }`}
          aria-hidden="true"
        />
        {children || statusLabels[st]}
      </span>
    );
  }

  if (variant === 'category') {
    return (
      <span
        className={`inline-flex items-center rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium ${sizeClasses} ${className}`}
      >
        {children}
      </span>
    );
  }

  if (variant === 'outline') {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-slate-300 text-slate-700 font-medium ${sizeClasses} ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 font-medium ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
