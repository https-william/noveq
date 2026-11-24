'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface AdminConfirmModalProps {
  title: string;
  subtitle: string;
  details: Array<{ label: string; value: string }>;
  warningText: string;
  confirmLabel: string;
  cancelLabel: string;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AdminConfirmModal({
  title,
  subtitle,
  details,
  warningText,
  confirmLabel,
  cancelLabel,
  isBusy,
  onCancel,
  onConfirm,
}: AdminConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-ink-black/55 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-warm-white border border-cocoa/15 max-w-md w-full rounded-2xl shadow-[0_24px_64px_-16px_rgba(42,27,21,0.22)] p-6 space-y-4">
        <div className="flex items-center gap-3 text-oxblood">
          <div className="w-10 h-10 rounded-full bg-oxblood/10 border border-oxblood/20 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4 text-oxblood" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-editorial text-xl font-normal text-ink-black">{title}</h3>
            <p className="text-xs text-muted-taupe">{subtitle}</p>
          </div>
        </div>

        <div className="p-3.5 bg-bone/60 border border-cocoa/12 rounded-xl space-y-1.5 text-xs">
          {details.map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <span className="text-muted-taupe">{row.label}:</span>
              <span className="font-mono font-medium text-ink-black text-right truncate">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-oxblood leading-relaxed">{warningText}</p>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={onCancel}
            className="press-tactile flex-1 py-2.5 bg-warm-white border border-cocoa/18 text-ink-black text-xs font-medium rounded-full hover:bg-bone transition-colors min-h-[42px] cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={onConfirm}
            className="press-tactile flex-1 py-2.5 bg-oxblood text-warm-white text-xs font-medium rounded-full hover:bg-oxblood/90 transition-colors disabled:opacity-50 min-h-[42px] cursor-pointer"
          >
            {isBusy ? 'Removing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
