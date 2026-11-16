'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface AdminAuthGateProps {
  passwordInput: string;
  authError: string | null;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminAuthGate({
  passwordInput,
  authError,
  onPasswordChange,
  onSubmit,
}: AdminAuthGateProps) {
  return (
    <div className="min-h-screen bg-bone text-ink-black flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-warm-white border border-cocoa/20 p-8 sm:p-10 rounded-2xl shadow-apple-md space-y-6 text-center">
        <div className="space-y-2.5">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#111111] border border-[#b89b72]/40 rounded-full mb-1">
            <Lock className="w-5 h-5 text-[#b89b72]" aria-hidden="true" />
          </div>
          <span className="block text-[10px] uppercase tracking-[0.22em] text-cocoa font-semibold">
            Lagos Studio
          </span>
          <h1 className="font-editorial text-3xl font-normal tracking-tight text-ink-black">
            NOVEQ Studio Operations
          </h1>
          <p className="text-xs text-muted-taupe leading-relaxed">
            Enter your studio password to view orders, inventory, waitlists, and November 27 launch tools.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-left">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[11px] uppercase tracking-[0.16em] font-semibold text-cocoa mb-1.5"
            >
              Studio Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={passwordInput}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-4 py-3 text-sm bg-bone/60 border border-cocoa/30 rounded-xl focus:outline-none focus:border-ink-black font-mono text-ink-black min-h-[46px]"
              autoFocus
            />
          </div>

          {authError && (
            <div className="p-3 bg-oxblood/10 border border-oxblood/30 text-oxblood text-xs rounded-xl">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-colors rounded-full focus-dark min-h-[48px] shadow-apple-sm cursor-pointer"
          >
            Enter Studio
          </button>
        </form>

        <div className="text-[11px] text-muted-taupe border-t border-cocoa/15 pt-4">
          Protected NOVEQ management workspace · Orders sync live
        </div>
      </div>
    </div>
  );
}
