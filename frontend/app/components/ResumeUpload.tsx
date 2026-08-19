"use client";

import { useEffect, useRef, useState } from "react";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeUpload({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || file.type !== "application/pdf") {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFiles(files: FileList | null) {
    const picked = files?.[0];
    if (picked) onChange(picked);
  }

  if (file) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M15 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-black dark:text-zinc-50">
              {file.name}
            </p>
            <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-8 shrink-0 items-center justify-center rounded-full border border-black/[.08] px-3 text-xs font-medium text-black transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-[#1a1a1a]"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove resume"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-black/[.04] hover:text-black dark:hover:bg-white/[.08] dark:hover:text-zinc-50"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {previewUrl ? (
          <div className="overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <iframe
              src={previewUrl}
              title="Resume preview"
              className="h-[600px] w-full"
            />
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-lg border border-black/[.08] text-center dark:border-white/[.145]">
            <p className="text-sm text-zinc-500">
              Preview isn&apos;t available for Word documents.
            </p>
            <p className="text-xs text-zinc-400">Upload a PDF to preview it here.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors ${
        dragActive
          ? "border-black/40 bg-black/[.03] dark:border-white/40 dark:bg-white/[.05]"
          : "border-black/[.15] hover:border-black/30 hover:bg-black/[.02] dark:border-white/[.2] dark:hover:border-white/30 dark:hover:bg-white/[.03]"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[.05] text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M12 16V4m0 0L7 9m5-5 5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-black dark:text-zinc-50">
        Drop your resume here, or{" "}
        <span className="underline underline-offset-2">browse</span>
      </p>
      <p className="text-xs text-zinc-500">PDF, DOC, or DOCX</p>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </label>
  );
}
