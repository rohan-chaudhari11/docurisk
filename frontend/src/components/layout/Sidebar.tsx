'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  GitCompare,
  ShieldAlert,
  Menu,
  X,
  Cpu,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  matchPrefix?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Document Upload', href: '/upload', icon: UploadCloud, badge: 'New', matchPrefix: '/upload' },
  { name: 'Analysis & Risks', href: '/documents/doc-1', icon: FileText, matchPrefix: '/documents' },
  { name: 'Version Diff', href: '/compare', icon: GitCompare, matchPrefix: '/compare' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top navigation bar toggle */}
      <div className="lg:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white">DocuRisk AI</span>
            <span className="block text-[10px] text-teal-400 font-medium">Document Risk Flagger</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md focus:outline-none cursor-pointer"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:min-h-screen shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xs transition-colors group-hover:bg-teal-500/30">
              <ShieldAlert className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">DocuRisk AI</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
                  Demo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                AI Summarizer & Risk Flagger
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : item.matchPrefix
                ? pathname.startsWith(item.matchPrefix)
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Prototype Architecture Status Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Cpu className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-slate-200">
                Engine Architecture
              </span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Frontend Client Demo with mock data. Ready for Spring Boot REST API integration.
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-2">
              <span className="flex items-center gap-1 text-teal-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden="true" />
                Service Ready
              </span>
              <span className="text-slate-300 font-mono text-[10px]">v1.0 (Phase 1)</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
