import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { PrototypeBanner } from '@/components/ui/PrototypeBanner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DocuRisk AI — Document Summarizer & Risk Flagger',
  description:
    'AI-Powered Document Summarizer & Risk Flagger — Enterprise Legal AI Demonstration Prototype',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {/* Prototype Header Banner */}
        <PrototypeBanner />

        {/* SaaS Dashboard Layout Shell */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <Suspense fallback={<aside className="w-64 bg-slate-900 hidden lg:block" />}>
            <Sidebar />
          </Suspense>
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
