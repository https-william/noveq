'use client';

import React from 'react';
import {
  Activity,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Layers,
  Package,
} from 'lucide-react';
import { Order } from '@/types/commerce';
import { GOOGLE_SHEETS_CONFIG } from '@/config/siteSettings';
import { SheetsSubTab } from './adminUtils';

interface AdminSheetsTabProps {
  orders: Order[];
  sheetsSubTab: SheetsSubTab;
  webhookStatus: 'idle' | 'testing' | 'healthy' | 'error';
  webhookMessage: string;
  isSyncingAll: boolean;
  syncSummary: { total: number; succeeded: number; failed: number } | null;
  syncingOrderId: string | null;
  orderSyncFeedback: Record<string, { success: boolean; message: string }>;
  iframeKey: number;
  onSubTabChange: (tab: SheetsSubTab) => void;
  onTestWebhook: () => void;
  onSyncAllOrders: () => void;
  onSyncSingleOrder: (orderId: string) => void;
  onReloadIframe: () => void;
  onDismissWebhook: () => void;
  onDismissSyncSummary: () => void;
}

export function AdminSheetsTab({
  orders,
  sheetsSubTab,
  webhookStatus,
  webhookMessage,
  isSyncingAll,
  syncSummary,
  syncingOrderId,
  orderSyncFeedback,
  iframeKey,
  onSubTabChange,
  onTestWebhook,
  onSyncAllOrders,
  onSyncSingleOrder,
  onReloadIframe,
  onDismissWebhook,
  onDismissSyncSummary,
}: AdminSheetsTabProps) {
  return (
    <div className="bg-warm-white border border-cocoa/12 rounded-2xl space-y-6 p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cocoa/12">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-editorial text-2xl font-normal text-ink-black">
              Books &amp; Google Sheets
            </h2>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-900 text-[11px] font-medium rounded-full border border-emerald-200/80">
              Live Sync
            </span>
          </div>
          <p className="text-xs text-muted-taupe mt-1 max-w-2xl">
            View and edit your Orders, P&amp;L Balance Sheet, and Summary numbers directly here, or sync any missed order in one tap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onTestWebhook}
            disabled={webhookStatus === 'testing'}
            className="press-tactile inline-flex items-center gap-1.5 px-3.5 py-2 bg-warm-white border border-cocoa/18 text-ink-black text-xs font-medium rounded-full hover:bg-bone transition-colors min-h-[38px] cursor-pointer disabled:opacity-50"
          >
            <Activity
              className={`w-3.5 h-3.5 text-cocoa ${
                webhookStatus === 'testing' ? 'animate-pulse' : ''
              }`}
            />
            <span>
              {webhookStatus === 'testing' ? 'Testing...' : 'Check Connection'}
            </span>
          </button>

          <button
            type="button"
            onClick={onSyncAllOrders}
            disabled={isSyncingAll}
            className="press-tactile inline-flex items-center gap-1.5 px-4 py-2 bg-ink-black text-warm-white text-xs font-medium rounded-full hover:bg-espresso transition-colors min-h-[38px] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`}
            />
            <span>{isSyncingAll ? 'Syncing...' : 'Sync All Orders'}</span>
          </button>

          <a
            href={GOOGLE_SHEETS_CONFIG.spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press-tactile inline-flex items-center gap-1.5 px-3.5 py-2 bg-bone/60 border border-cocoa/18 text-ink-black text-xs font-medium rounded-full hover:bg-bone transition-colors min-h-[38px]"
          >
            <span>Open Full Sheet</span>
            <ExternalLink className="w-3.5 h-3.5 text-cocoa" />
          </a>
        </div>
      </div>

      {webhookStatus !== 'idle' && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
            webhookStatus === 'healthy'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : webhookStatus === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {webhookStatus === 'healthy' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            {webhookStatus === 'error' && (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            {webhookStatus === 'testing' && (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            )}
            <span className="font-mono">{webhookMessage}</span>
          </div>
          <button
            type="button"
            onClick={onDismissWebhook}
            className="text-muted-taupe hover:text-ink-black text-[11px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {syncSummary && (
        <div className="p-3.5 bg-bone/80 border border-cocoa/20 rounded-xl text-xs flex items-center justify-between">
          <span className="font-medium text-ink-black">
            Sync finished:{' '}
            <strong className="text-emerald-700">{syncSummary.succeeded}</strong>{' '}
            synced
            {syncSummary.failed > 0 && (
              <span className="text-oxblood">
                , <strong>{syncSummary.failed}</strong> failed
              </span>
            )}{' '}
            out of {syncSummary.total} orders.
          </span>
          <button
            type="button"
            onClick={onDismissSyncSummary}
            className="text-xs text-muted-taupe hover:text-ink-black underline cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-bone/60 border border-cocoa/12 rounded-xl overflow-x-auto">
          {[
            { id: 'orders' as const, label: 'Orders Sheet', icon: ShoppingBag },
            { id: 'pnl' as const, label: 'P&L Balance Sheet', icon: TrendingUp },
            { id: 'summary' as const, label: 'Summary Totals', icon: Layers },
            {
              id: 'sync' as const,
              label: `Sync Audit (${orders.length})`,
              icon: RefreshCw,
            },
          ].map((subTab) => {
            const Icon = subTab.icon;
            const isCurrent = sheetsSubTab === subTab.id;
            return (
              <button
                key={subTab.id}
                type="button"
                onClick={() => onSubTabChange(subTab.id)}
                className={`press-tactile inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-[background-color,color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] whitespace-nowrap min-h-[36px] cursor-pointer ${
                  isCurrent
                    ? 'bg-ink-black text-warm-white'
                    : 'text-muted-taupe hover:text-ink-black hover:bg-warm-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{subTab.label}</span>
              </button>
            );
          })}
        </div>

        {(sheetsSubTab === 'orders' ||
          sheetsSubTab === 'pnl' ||
          sheetsSubTab === 'summary') && (
          <div className="flex items-center gap-2 shrink-0 py-1">
            <button
              type="button"
              onClick={onReloadIframe}
              className="press-tactile inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-cocoa hover:text-ink-black bg-bone/60 border border-cocoa/15 rounded-full cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reload</span>
            </button>
            <a
              href={
                sheetsSubTab === 'orders'
                  ? GOOGLE_SHEETS_CONFIG.tabs.orders.url
                  : sheetsSubTab === 'pnl'
                  ? GOOGLE_SHEETS_CONFIG.tabs.pnl.url
                  : GOOGLE_SHEETS_CONFIG.tabs.summary.url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="press-tactile inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-ink-black hover:bg-bone border border-cocoa/15 rounded-full"
            >
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3 h-3 text-cocoa" />
            </a>
          </div>
        )}
      </div>

      {/* Embedded Sheet Frames */}
      {sheetsSubTab !== 'sync' ? (
        <div className="w-full h-[680px] border border-cocoa/12 rounded-2xl overflow-hidden bg-warm-white relative">
          <iframe
            key={`${sheetsSubTab}-frame-${iframeKey}`}
            src={`https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/edit?rm=minimal&gid=${GOOGLE_SHEETS_CONFIG.tabs[sheetsSubTab].gid}#gid=${GOOGLE_SHEETS_CONFIG.tabs[sheetsSubTab].gid}`}
            title={`NOVEQ ${sheetsSubTab} Google Sheet`}
            className="w-full h-full border-0"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-taupe space-y-2 border border-dashed border-cocoa/20 rounded-xl">
              <Package className="w-8 h-8 text-cocoa/40 mx-auto" />
              <p className="font-semibold text-ink-black text-sm">
                No orders yet
              </p>
              <p>Orders placed on the store appear here and sync to Google Sheets.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-cocoa/15 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cocoa/20 text-cocoa uppercase tracking-wider text-[10px] bg-bone/60">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Pairs</th>
                    <th className="p-3">Total (₦)</th>
                    <th className="p-3">Sync Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cocoa/15">
                  {orders.map((order) => {
                    const feedback = orderSyncFeedback[order.id];
                    const isSyncing = syncingOrderId === order.id;
                    return (
                      <tr key={order.id} className="hover:bg-bone/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-ink-black">
                          {order.id}
                        </td>
                        <td className="p-3 text-muted-taupe font-mono text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-ink-black">
                            {order.customer.fullName}
                          </div>
                          <div className="text-[10px] font-mono text-muted-taupe">
                            {order.customer.phone}
                          </div>
                        </td>
                        <td className="p-3 text-[11px]">
                          {order.items.map((i, idx) => (
                            <div key={idx}>
                              {i.product.name} ({i.selectedSize}) x{i.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="p-3 font-mono font-bold text-ink-black tabular-nums">
                          ₦{order.total.toLocaleString()}
                        </td>
                        <td className="p-3">
                          {feedback ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-mono ${
                                feedback.success
                                  ? 'text-emerald-700 font-bold'
                                  : 'text-red-700'
                              }`}
                            >
                              {feedback.success ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              {feedback.message}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-muted-taupe">
                              Ready
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => onSyncSingleOrder(order.id)}
                            disabled={isSyncing}
                            className="inline-flex items-center gap-1 px-3 py-1 text-[10px] uppercase font-bold text-ink-black bg-warm-white border border-cocoa/30 rounded-full hover:bg-bone transition-colors disabled:opacity-50 min-h-[30px] cursor-pointer"
                          >
                            <RefreshCw
                              className={`w-3 h-3 ${
                                isSyncing ? 'animate-spin' : ''
                              }`}
                            />
                            <span>{isSyncing ? 'Syncing' : 'Sync'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
