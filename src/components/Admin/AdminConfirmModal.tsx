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
    <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-warm-white border border-cocoa/30 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-oxblood">
          <div className="w-10 h-10 rounded-full bg-oxblood/10 border border-oxblood/20 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-oxblood" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-black">{title}</h3>
            <p className="text-xs text-muted-taupe">{subtitle}</p>
          </div>
        </div>

        <div className="p-3.5 bg-bone/70 border border-cocoa/20 rounded-xl space-y-1.5 text-xs">
          {details.map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <span className="text-muted-taupe">{row.label}:</span>
              <span className="font-mono font-semibold text-ink-black text-right truncate">
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
            className="flex-1 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-bone transition-colors min-h-[44px] cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-oxblood text-warm-white text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-oxblood/90 transition-colors disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            {isBusy ? 'Removing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
