'use client';

import React, { useMemo } from 'react';
import {
  Search,
  Check,
  Copy,
  Download,
  Mail,
  Trash2,
} from 'lucide-react';
import { Subscriber } from '@/lib/subscribers';
import {
  SubscriberSegment,
  isNov27Subscriber,
  isRestockSubscriber,
  getRestockTargetLabel,
  getSourceDisplayLabel,
} from './adminUtils';

interface AdminSubscribersTabProps {
  subscribers: Subscriber[];
  searchQuery: string;
  segment: SubscriberSegment;
  copiedId: string | null;
  copiedAllEmails: boolean;
  onSearchChange: (q: string) => void;
  onSegmentChange: (segment: SubscriberSegment) => void;
  onCopyEmail: (text: string, id: string) => void;
  onCopyFilteredEmails: (list: Subscriber[]) => void;
  onExportFilteredCSV: (list: Subscriber[], segmentLabel: string) => void;
  onRequestDeleteSubscriber: (sub: Subscriber) => void;
}

export function AdminSubscribersTab({
  subscribers,
  searchQuery,
  segment,
  copiedId,
  copiedAllEmails,
  onSearchChange,
  onSegmentChange,
  onCopyEmail,
  onCopyFilteredEmails,
  onExportFilteredCSV,
  onRequestDeleteSubscriber,
}: AdminSubscribersTabProps) {
  const counts = useMemo(() => {
    const nov27 = subscribers.filter(isNov27Subscriber).length;
    const restock = subscribers.filter(isRestockSubscriber).length;
    const storefront = subscribers.filter(
      (s) => !isNov27Subscriber(s) && !isRestockSubscriber(s)
    ).length;
    return {
      all: subscribers.length,
      nov27,
      restock,
      storefront,
    };
  }, [subscribers]);

  // Restock breakdown per silhouette (e.g., The Twist, The Ring)
  const restockBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    subscribers.forEach((s) => {
      const target = getRestockTargetLabel(s);
      if (target) {
        map.set(target, (map.get(target) || 0) + 1);
      }
    });
    return Array.from(map.entries());
  }, [subscribers]);

  const filteredSubscribers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return subscribers.filter((sub) => {
      if (segment === 'nov27' && !isNov27Subscriber(sub)) return false;
      if (segment === 'restock' && !isRestockSubscriber(sub)) return false;
      if (
        segment === 'storefront' &&
        (isNov27Subscriber(sub) || isRestockSubscriber(sub))
      ) {
        return false;
      }

      if (!q) return true;
      return (
        sub.email.toLowerCase().includes(q) ||
        (sub.name && sub.name.toLowerCase().includes(q)) ||
        getSourceDisplayLabel(sub).toLowerCase().includes(q)
      );
    });
  }, [subscribers, segment, searchQuery]);

  return (
    <div className="bg-warm-white border border-cocoa/20 rounded-2xl shadow-apple-sm space-y-5 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
        <div>
          <h2 className="font-editorial text-2xl font-normal text-ink-black">
            Waitlists &amp; Subscribers
          </h2>
          <p className="text-xs text-muted-taupe mt-0.5">
            Filter by November 27 reminders, paused style restock alerts, or general newsletter visitors, then copy or export that exact list.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search
              className="w-4 h-4 absolute left-3.5 top-3 text-cocoa"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search email or style..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-bone/60 border border-cocoa/30 rounded-full focus:outline-none focus:border-ink-black text-ink-black font-medium min-h-[40px]"
            />
          </div>

          <button
            type="button"
            disabled={filteredSubscribers.length === 0}
            onClick={() => onCopyFilteredEmails(filteredSubscribers)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-espresso transition-colors min-h-[40px] cursor-pointer disabled:opacity-40"
          >
            {copiedAllEmails ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied {filteredSubscribers.length}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Shown ({filteredSubscribers.length})</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={filteredSubscribers.length === 0}
            onClick={() => onExportFilteredCSV(filteredSubscribers, segment)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-bone transition-colors min-h-[40px] cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-cocoa" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Segment Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all' as const, label: 'All Contacts', count: counts.all },
            {
              id: 'nov27' as const,
              label: 'Nov 27 Reminders',
              count: counts.nov27,
            },
            {
              id: 'restock' as const,
              label: 'Restock Waitlists',
              count: counts.restock,
            },
            {
              id: 'storefront' as const,
              label: 'Newsletter & Buyers',
              count: counts.storefront,
            },
          ].map((pill) => {
            const active = segment === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onSegmentChange(pill.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-full transition-colors cursor-pointer min-h-[38px] ${
                  active
                    ? 'bg-[#111111] text-[#b89b72] border border-[#b89b72]/50'
                    : 'bg-bone/70 text-cocoa hover:text-ink-black border border-cocoa/20'
                }`}
              >
                <span>{pill.label}</span>
                <span className="font-mono text-[10px] opacity-80">
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Restock Breakdown Summary when available */}
        {restockBreakdown.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-cocoa">
            <span className="font-medium">Waiting on restock:</span>
            {restockBreakdown.map(([styleName, count]) => (
              <span
                key={styleName}
                className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-medium"
              >
                {styleName} ({count})
              </span>
            ))}
          </div>
        )}
      </div>

      {filteredSubscribers.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-taupe space-y-2 border border-dashed border-cocoa/20 rounded-xl">
          <Mail className="w-8 h-8 text-cocoa/40 mx-auto" />
          <p className="font-semibold text-ink-black text-sm">
            No contacts in this list yet
          </p>
          <p>Signups for Nov 27 alerts, paused styles, and site updates appear here automatically.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredSubscribers.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-cocoa/20 bg-bone/30 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono font-semibold text-ink-black truncate">
                      {sub.email}
                    </div>
                    <div className="text-[11px] text-muted-taupe mt-0.5">
                      {sub.name || 'Visitor'} ·{' '}
                      {new Date(sub.subscribedAt).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                      isNov27Subscriber(sub)
                        ? 'bg-[#111111] text-[#b89b72]'
                        : isRestockSubscriber(sub)
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-bone text-espresso border border-cocoa/20'
                    }`}
                  >
                    {getSourceDisplayLabel(sub)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1 border-t border-cocoa/10">
                  <button
                    type="button"
                    onClick={() => onCopyEmail(sub.email, sub.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-espresso py-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedId === sub.id ? 'Copied' : 'Copy Email'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestDeleteSubscriber(sub)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-oxblood py-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto border border-cocoa/15 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/60">
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">List / Source</th>
                  <th className="p-3.5">Date Joined</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cocoa/15">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-bone/30 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-ink-black">
                      {sub.email}
                    </td>
                    <td className="p-3.5 text-ink-black">
                      {sub.name || (
                        <span className="text-muted-taupe italic">Visitor</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-medium rounded-full ${
                          isNov27Subscriber(sub)
                            ? 'bg-[#111111] text-[#b89b72]'
                            : isRestockSubscriber(sub)
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-espresso/10 text-espresso'
                        }`}
                      >
                        {getSourceDisplayLabel(sub)}
                      </span>
                    </td>
                    <td className="p-3.5 text-muted-taupe font-mono text-[11px]">
                      {new Date(sub.subscribedAt).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onCopyEmail(sub.email, sub.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-espresso hover:underline cursor-pointer"
                        >
                          {copiedId === sub.id ? (
                            <span className="text-emerald-700">Copied</span>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDeleteSubscriber(sub)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-oxblood/85 hover:text-oxblood hover:underline cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
