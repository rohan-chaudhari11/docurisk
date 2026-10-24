'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileCode,
  AlertCircle,
  X,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

interface DocumentDropzoneProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
}

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  onAnalyze,
  isAnalyzing,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!hasValidExtension) {
      setErrorMessage(
        `Invalid file format. Please upload a PDF (.pdf) or Word document (.docx). Received: ${file.name}`
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(
        `File exceeds maximum limit of ${MAX_FILE_SIZE_MB} MB. Selected file size: ${sizeMb} MB.`
      );
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes). Please select a valid document.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeClick = () => {
    if (!selectedFile) {
      setErrorMessage('Please select or drop a valid PDF or DOCX file before starting analysis.');
      return;
    }
    onAnalyze(selectedFile);
  };

  const handleLoadSample = (sampleName: string, isPdf: boolean) => {
    // Generate a dummy File object for quick sample testing
    const blob = new Blob(['Sample contract text for demonstration.'], {
      type: isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const sampleFile = new File([blob], sampleName, {
      type: isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    validateAndSetFile(sampleFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
        id="document-upload-input"
        aria-label="Upload document file"
      />

      {/* Drag & Drop Target Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          selectedFile
            ? 'border-teal-300 bg-teal-50/20'
            : isDragOver
            ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50 cursor-pointer'
        }`}
      >
        {!selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-200/80 mb-4 shadow-2xs">
              <UploadCloud className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Drop your contract or agreement here
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
              Drag and drop your file directly into this dropzone, or click anywhere to browse from your device.
            </p>

            {/* Supported format badges */}
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium border border-slate-200">
                <FileText className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                PDF Documents (.pdf)
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium border border-slate-200">
                <FileCode className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                Word Documents (.docx)
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              Maximum file size: {MAX_FILE_SIZE_MB} MB
            </p>
          </div>
        ) : (
          /* Selected File Card */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-teal-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs shrink-0">
                {selectedFile.name.toLowerCase().endsWith('.pdf') ? (
                  <FileText className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <FileCode className="h-6 w-6" aria-hidden="true" />
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {selectedFile.name}
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                    Ready
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>
                    {selectedFile.name.toLowerCase().endsWith('.pdf') ? 'PDF Contract' : 'Word Document'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3 shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <strong className="font-semibold block mb-0.5">File Validation Notice</strong>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
            aria-label="Dismiss error notice"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Sample Demo Contracts Quick Chips */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-700">
            Preloaded Demo Benchmark Samples
          </span>
          <span className="text-[10px] text-slate-400">(Click to load immediately)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleLoadSample('Vendor_Service_Agreement_Draft_2026.pdf', true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/40 transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            Vendor_Service_Agreement_Draft_2026.pdf
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('Software_License_Maintenance_Redline.docx', false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/40 transition-colors shadow-2xs cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            Software_License_Maintenance_Redline.docx
          </button>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-[11px] text-slate-500 text-center sm:text-left">
          Simulated prototype analysis. Uploaded file contents are handled in local browser memory.
        </p>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleAnalyzeClick}
          disabled={!selectedFile || isAnalyzing}
          isLoading={isAnalyzing}
          leftIcon={<FileCheck2 className="w-4 h-4" aria-hidden="true" />}
          className="w-full sm:w-auto"
        >
          {isAnalyzing ? 'Simulating Analysis...' : 'Analyze Document'}
        </Button>
      </div>
    </div>
  );
};
