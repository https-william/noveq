'use client';

import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';

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
      <div className="max-w-md w-full p-1.5 rounded-[28px] bg-warm-white/65 border border-cocoa/12 shadow-[0_12px_40px_-16px_rgba(42,27,21,0.12)]">
        <div className="bg-warm-white border border-cocoa/10 p-8 sm:p-10 rounded-[22px] space-y-6 text-center">
          <div className="space-y-2.5">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-bone border border-cocoa/15 rounded-full mb-1">
              <Lock className="w-4 h-4 text-espresso" aria-hidden="true" />
            </div>
            <span className="block text-xs text-cocoa font-medium">
              Lagos Studio
            </span>
            <h1 className="font-editorial text-3xl font-normal tracking-tight text-ink-black">
              NOVEQ Studio Operations
            </h1>
            <p className="text-xs text-muted-taupe leading-relaxed">
              Enter your studio password to manage orders, inventory, waitlists, accounting sheets, and your Telegram bot.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-espresso mb-1.5"
              >
                Studio Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={passwordInput}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 text-sm bg-bone/50 border border-cocoa/18 rounded-xl focus:outline-none focus:border-ink-black font-mono text-ink-black min-h-[46px] transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-oxblood/10 border border-oxblood/25 text-oxblood text-xs rounded-xl">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="group press-tactile w-full pl-6 pr-2 py-2 bg-ink-black text-warm-white text-xs font-medium hover:bg-espresso transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full focus-dark min-h-[48px] flex items-center justify-between cursor-pointer"
            >
              <span>Enter Studio</span>
              <span className="w-8 h-8 rounded-full bg-warm-white text-ink-black flex items-center justify-center transition-transform duration-[200ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </button>
          </form>

          <div className="text-[11px] text-muted-taupe border-t border-cocoa/12 pt-4">
            Protected NOVEQ management workspace · Orders sync live
          </div>
        </div>
      </div>
    </div>
  );
}
