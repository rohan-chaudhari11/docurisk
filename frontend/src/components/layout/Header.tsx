'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UploadCloud, Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  searchQuery: externalQuery,
}) => {
  const router = useRouter();
  const [internalQuery, setInternalQuery] = useState('');

  const currentQuery = externalQuery !== undefined ? externalQuery : internalQuery;

  const handleChange = (val: string) => {
    if (externalQuery === undefined) {
      setInternalQuery(val);
    }
    onSearchChange?.(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!onSearchChange) {
        router.push(`/?search=${encodeURIComponent(currentQuery)}`);
      }
    }
  };

  const handleClear = () => {
    handleChange('');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-xs shadow-2xs">
      {/* Search Bar / Quick Finder */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={currentQuery}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search documents and contracts by name, obligation, or risk category"
            placeholder="Search contracts, obligations, or risk categories..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
          />
          {currentQuery && (
            <button
              onClick={handleClear}
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              aria-label="Clear search text"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Project Demo Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/60 px-3 py-1 text-xs text-teal-800">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span className="font-medium text-teal-800">Enterprise AI Demo</span>
        </div>

        {/* Quick Upload CTA */}
        <Link href="/upload">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<UploadCloud className="w-4 h-4" aria-hidden="true" />}
          >
            Upload Document
          </Button>
        </Link>
      </div>
    </header>
  );
};
