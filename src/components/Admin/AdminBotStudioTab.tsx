'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bot,
  Send,
  BarChart3,
  Mail,
  Users,
  Pin,
  Trash2,
  Link2,
  Check,
  Copy,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle,
  Plus,
  X,
  Edit3,
  Lock,
} from 'lucide-react';
import { Product } from '@/types/commerce';
import { Subscriber } from '@/lib/subscribers';
import type { BotStudioOverview } from '@/services/telegramService';
import type { TelegramBotLogEntry } from '@/lib/telegramLog';
import { parsePlainEnglishBotCommand } from '@/lib/botCommandParser';
import { isNov27Subscriber, isRestockSubscriber } from './adminUtils';

interface AdminBotStudioTabProps {
  subscribers: Subscriber[];
  products: Product[];
  onRefreshStoreData: () => Promise<void> | void;
}

type StudioSection = 'message' | 'poll' | 'group' | 'email' | 'store';

export function AdminBotStudioTab({
  subscribers,
  products,
  onRefreshStoreData,
}: AdminBotStudioTabProps) {
  const [overview, setOverview] = useState<BotStudioOverview | null>(null);
  const [activity, setActivity] = useState<TelegramBotLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [section, setSection] = useState<StudioSection>('message');

  // Plain-English Bar
  const [englishCommand, setEnglishCommand] = useState('');
  const parsedCommand = useMemo(
    () => parsePlainEnglishBotCommand(englishCommand),
    [englishCommand]
  );

  // Panel A: Message & Photo
  const [msgText, setMsgText] = useState('');
  const [msgReplyId, setMsgReplyId] = useState('');
  const [msgPin, setMsgPin] = useState(false);
  const [msgSilent, setMsgSilent] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');

  // Inline message edit state
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const [editingMsgText, setEditingMsgText] = useState('');

  // Panel B: Poll
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollAnonymous, setPollAnonymous] = useState(false);
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollPin, setPollPin] = useState(false);

  // Panel C: Group, Members & Invite
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [groupTitleInput, setGroupTitleInput] = useState('');
  const [groupDescInput, setGroupDescInput] = useState('');
  const [memberUserId, setMemberUserId] = useState('');
  const [memberMuteHours, setMemberMuteHours] = useState(24);

  // Panel D: Email Composer
  const [emailAudience, setEmailAudience] = useState<
    'custom' | 'nov27' | 'restock' | 'all_real'
  >('custom');
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailHeading, setEmailHeading] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailCtaLabel, setEmailCtaLabel] = useState('');
  const [emailCtaUrl, setEmailCtaUrl] = useState('https://www.noveq.com.ng/shop');
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);

  // Panel E: Quick Store Add/Remove Subscriber
  const [subEmailInput, setSubEmailInput] = useState('');
  const [subSourceInput, setSubSourceInput] = useState('black_friday_2026');

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchBotState = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bot');
      const data = await res.json();
      if (data.success) {
        setOverview(data.overview);
        setActivity(data.activity || []);
        if (data.overview?.group?.title) {
          setGroupTitleInput(data.overview.group.title);
        }
        if (data.overview?.group?.description) {
          setGroupDescInput(data.overview.group.description);
        }
      }
    } catch {
      showToast(false, 'Could not connect to Telegram right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBotState();
  }, [fetchBotState]);

  const runBotAction = async (
    action: string,
    payload: Record<string, unknown>,
    successMsg?: string
  ) => {
    setBusyAction(action);
    try {
      const res = await fetch('/api/admin/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(false, data.error || 'Action could not be completed.');
        return null;
      }
      if (successMsg) showToast(true, successMsg);
      await fetchBotState();
      return data;
    } catch {
      showToast(false, 'Network error while talking to bot endpoint.');
      return null;
    } finally {
      setBusyAction(null);
    }
  };

  const handleRunPlainEnglish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedCommand.type === 'unknown') {
      showToast(false, parsedCommand.hint);
      return;
    }

    switch (parsedCommand.type) {
      case 'send_message': {
        const res = await runBotAction(
          'send_message',
          parsedCommand.payload,
          'Message sent to noveqthebrand.'
        );
        if (res) setEnglishCommand('');
        break;
      }
      case 'send_poll': {
        const res = await runBotAction(
          'send_poll',
          parsedCommand.payload,
          'Poll posted to noveqthebrand.'
        );
        if (res) setEnglishCommand('');
        break;
      }
      case 'send_email': {
        // Load into email composer with confirmation open so founder never blasts blindly
        setEmailAudience('custom');
        setCustomEmailInput(parsedCommand.payload.recipients.join(', '));
        setEmailSubject(parsedCommand.payload.subject);
        setEmailBody(parsedCommand.payload.body);
        setSection('email');
        setEmailConfirmOpen(true);
        setEnglishCommand('');
        showToast(
          true,
          'Loaded into Email Studio — review and click Confirm & Send.'
        );
        break;
      }
      case 'add_subscriber': {
        const res = await runBotAction(
          'add_subscriber',
          parsedCommand.payload,
          `Added ${parsedCommand.payload.email} cleanly.`
        );
        if (res) {
          setEnglishCommand('');
          onRefreshStoreData();
        }
        break;
      }
      case 'remove_subscriber': {
        const res = await runBotAction(
          'remove_subscriber',
          parsedCommand.payload,
          `Removed ${parsedCommand.payload.email}.`
        );
        if (res) {
          setEnglishCommand('');
          onRefreshStoreData();
        }
        break;
      }
      case 'pin_message': {
        const res = await runBotAction(
          'pin_message',
          parsedCommand.payload,
          `Pinned message #${parsedCommand.payload.messageId}.`
        );
        if (res) setEnglishCommand('');
        break;
      }
      case 'delete_message': {
        const res = await runBotAction(
          'delete_message',
          parsedCommand.payload,
          `Deleted message #${parsedCommand.payload.messageId}.`
        );
        if (res) setEnglishCommand('');
        break;
      }
      case 'create_invite_link': {
        const res = await runBotAction(
          'create_invite_link',
          parsedCommand.payload,
          'Invite link created.'
        );
        if (res?.inviteLink) {
          setInviteLink(res.inviteLink);
          setSection('group');
          setEnglishCommand('');
        }
        break;
      }
      case 'set_group_title': {
        const res = await runBotAction(
          'set_group_title',
          parsedCommand.payload,
          `Renamed group to "${parsedCommand.payload.title}".`
        );
        if (res) setEnglishCommand('');
        break;
      }
      case 'toggle_product_restocking': {
        const res = await runBotAction(
          'toggle_product_restocking',
          parsedCommand.payload,
          parsedCommand.summary
        );
        if (res) {
          setEnglishCommand('');
          onRefreshStoreData();
        }
        break;
      }
      case 'check_orders_summary': {
        const res = await runBotAction(
          'check_orders_summary',
          {},
          'Posted live studio summary to noveqthebrand.'
        );
        if (res) setEnglishCommand('');
        break;
      }
    }
  };

  // Compute safe deliverable email list
  const resolvedEmailTargets = useMemo(() => {
    const rawList: string[] =
      emailAudience === 'custom'
        ? customEmailInput
            .split(/[,;\n\s]+/)
            .map((s) => s.trim().toLowerCase())
            .filter((s) => s.includes('@'))
        : emailAudience === 'nov27'
        ? subscribers.filter(isNov27Subscriber).map((s) => s.email.toLowerCase())
        : emailAudience === 'restock'
        ? subscribers.filter(isRestockSubscriber).map((s) => s.email.toLowerCase())
        : subscribers.map((s) => s.email.toLowerCase());

    const unique = Array.from(new Set(rawList));
    return unique.filter((e) => !e.endsWith('@client.noveq.com.ng'));
  }, [emailAudience, customEmailInput, subscribers]);

  return (
    <div className="space-y-5">
      {/* 1. Bot Identity, Permissions & Webhook Health */}
      <div className="bg-warm-white text-ink-black border border-cocoa/12 rounded-2xl p-5 sm:p-6 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-black">
                <Bot className="w-4 h-4 text-cocoa" />
                <span>{overview?.bot.firstName || 'NOVEQ.the.bot'}</span>
                <span className="text-xs font-mono text-muted-taupe">
                  @{overview?.bot.username || 'noveq_orders_bot'}
                </span>
              </span>
              {overview && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                    overview.group.isBotAdmin
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}
                >
                  {overview.group.isBotAdmin
                    ? 'Group Admin · Full Control'
                    : 'Member · Promote for Pin & Kick'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-taupe">
              Group:{' '}
              <span className="text-ink-black font-medium">
                {overview?.group.title || 'noveqthebrand'}
              </span>{' '}
              ({overview?.group.memberCount ?? '—'} members) · Chat{' '}
              <code className="text-cocoa font-mono">
                {overview?.group.id || '-5565319867'}
              </code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchBotState}
              disabled={loading}
              className="press-tactile inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-bone/60 hover:bg-bone border border-cocoa/15 text-xs font-medium text-ink-black transition-colors cursor-pointer min-h-[38px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cocoa ${loading ? 'animate-spin' : ''}`} />
              <span>Check Status</span>
            </button>

            {overview?.webhook.url ? (
              <button
                type="button"
                disabled={busyAction === 'disconnect_webhook'}
                onClick={() =>
                  runBotAction('disconnect_webhook', {}, 'Disconnected two-way webhook.')
                }
                className="press-tactile inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-900 text-xs font-medium transition-colors cursor-pointer min-h-[38px]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Two-Way Chat Active</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={busyAction === 'connect_webhook'}
                onClick={() =>
                  runBotAction(
                    'connect_webhook',
                    {},
                    'Enabled two-way chat commands & registered Telegram /menu.'
                  )
                }
                className="press-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink-black hover:bg-espresso text-warm-white text-xs font-medium transition-colors cursor-pointer min-h-[38px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enable Two-Way Chat</span>
              </button>
            )}
          </div>
        </div>

        {overview && !overview.group.isBotAdmin && (
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-medium">
                Promote bot to Admin for pinning, deleting, renaming &amp; moderation:
              </strong>{' '}
              In <strong>{overview.group.title}</strong> on Telegram, open Group Name →{' '}
              <strong>Edit / Administrators → Add Admin → @noveq_orders_bot</strong>.
            </p>
          </div>
        )}

        {toast && (
          <div
            role="status"
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
              toast.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <span>{toast.text}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-[11px] underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 2. Plain-English Command Composer */}
      <div className="bg-warm-white border border-cocoa/12 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="font-editorial text-2xl font-normal text-ink-black">
            Plain-English Command Bar
          </h2>
          <p className="text-xs text-muted-taupe">
            Describe an action, check the preview, and run it.
          </p>
        </div>

        <form onSubmit={handleRunPlainEnglish} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={englishCommand}
              onChange={(e) => setEnglishCommand(e.target.value)}
              placeholder='e.g. "Tell the group orders ship at 4pm" or "Poll: Drop time? | 5pm | 7pm"'
              className="flex-1 px-4 py-3 bg-bone/50 border border-cocoa/20 rounded-xl text-sm text-ink-black placeholder:text-muted-taupe/70 focus:outline-none focus:border-ink-black transition-colors min-h-[46px]"
            />
            <button
              type="submit"
              disabled={!englishCommand.trim() || Boolean(busyAction)}
              className="press-tactile inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink-black hover:bg-espresso text-warm-white text-xs font-medium rounded-full transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer disabled:opacity-40 min-h-[46px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{busyAction ? 'Running...' : 'Run Action'}</span>
            </button>
          </div>

          {englishCommand.trim() && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                parsedCommand.type === 'unknown'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-bone/60 border-cocoa/15 text-ink-black'
              }`}
            >
              <span className="font-medium text-cocoa mr-2">Preview:</span>
              <span>
                {parsedCommand.type === 'unknown'
                  ? `${parsedCommand.summary} — ${parsedCommand.hint}`
                  : parsedCommand.summary}
              </span>
            </div>
          )}

          {/* Quick Plain-English Prompt Starters */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {[
              {
                label: 'Message group',
                sample: 'Tell the group: Today’s pairs are packed and ready for dispatch.',
              },
              {
                label: 'Start a vote',
                sample: 'Poll: When should Drop 001 restock go live? | Friday 6pm | Saturday Noon',
              },
              {
                label: 'Create invite link',
                sample: 'Create an invite link to add someone to the group',
              },
              {
                label: 'Live orders summary',
                sample: 'Check orders summary',
              },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setEnglishCommand(chip.sample)}
                className="press-tactile px-3 py-1.5 rounded-full bg-bone/60 hover:bg-bone border border-cocoa/15 text-[11px] text-espresso font-medium transition-colors cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* 3. Studio Control Grid + Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Structured Bot Studio Panels */}
        <div className="lg:col-span-7 bg-warm-white border border-cocoa/12 rounded-2xl p-5 sm:p-6 space-y-5">
          {/* Sub-Navigation Dock */}
          <div className="flex flex-wrap gap-1 p-1 bg-bone/60 border border-cocoa/12 rounded-xl">
            {[
              { id: 'message' as const, label: 'Text & Photo', icon: Send },
              { id: 'poll' as const, label: 'Polls & Votes', icon: BarChart3 },
              { id: 'group' as const, label: 'People & Group', icon: Users },
              { id: 'email' as const, label: 'Send Email', icon: Mail },
              { id: 'store' as const, label: 'Waitlists & Catalog', icon: Sparkles },
            ].map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`press-tactile inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-[background-color,color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer min-h-[36px] ${
                    active
                      ? 'bg-[#111111] text-[#f4f3ef]'
                      : 'text-muted-taupe hover:text-ink-black hover:bg-warm-white/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#b89b72]' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* PANEL A: TEXT & PHOTO */}
          {section === 'message' && (
            <div className="space-y-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await runBotAction(
                    'send_message',
                    {
                      text: msgText,
                      replyToMessageId: msgReplyId || undefined,
                      pinImmediately: msgPin,
                      silent: msgSilent,
                    },
                    'Message posted to noveqthebrand.'
                  );
                  if (res) {
                    setMsgText('');
                    setMsgReplyId('');
                    setMsgPin(false);
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div className="space-y-1">
                  <label className="block font-semibold text-ink-black">
                    Send Text Message as NOVEQ.the.bot
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Write what you want the bot to say in noveqthebrand..."
                    className="w-full p-3.5 bg-bone/60 border border-cocoa/30 rounded-xl text-sm text-ink-black focus:outline-none focus:border-ink-black"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <input
                    type="number"
                    placeholder="Reply to Msg ID (optional)"
                    value={msgReplyId}
                    onChange={(e) => setMsgReplyId(e.target.value)}
                    className="w-48 px-3 py-2 bg-bone/60 border border-cocoa/30 rounded-xl font-mono text-xs"
                  />
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={msgPin}
                      onChange={(e) => setMsgPin(e.target.checked)}
                    />
                    <span>Pin immediately</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={msgSilent}
                      onChange={(e) => setMsgSilent(e.target.checked)}
                    />
                    <span>Send silently</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!msgText.trim() || busyAction === 'send_message'}
                  className="press-tactile inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black hover:bg-espresso text-warm-white rounded-full font-medium text-xs cursor-pointer disabled:opacity-40 min-h-[40px]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post to Group</span>
                </button>
              </form>

              {/* Send Photo */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await runBotAction(
                    'send_photo',
                    { photoUrl, caption: photoCaption },
                    'Photo sent to noveqthebrand.'
                  );
                  if (res) {
                    setPhotoUrl('');
                    setPhotoCaption('');
                  }
                }}
                className="pt-5 border-t border-cocoa/15 space-y-3 text-xs"
              >
                <div className="flex items-center gap-2 font-semibold text-ink-black">
                  <ImageIcon className="w-4 h-4 text-cocoa" />
                  <span>Send a Photo to the Group</span>
                </div>
                <input
                  type="url"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://www.noveq.com.ng/images/models/the-weave-hero-model.jpg"
                  className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-xs"
                />
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Optional caption..."
                  className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  disabled={!photoUrl.trim() || busyAction === 'send_photo'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-bone hover:bg-cocoa/15 border border-cocoa/30 text-ink-black rounded-full font-semibold text-xs cursor-pointer disabled:opacity-40 min-h-[40px]"
                >
                  <span>Send Photo</span>
                </button>
              </form>
            </div>
          )}

          {/* PANEL B: POLLS & VOTES */}
          {section === 'poll' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const cleanOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
                const res = await runBotAction(
                  'send_poll',
                  {
                    question: pollQuestion,
                    options: cleanOpts,
                    isAnonymous: pollAnonymous,
                    allowsMultipleAnswers: pollMultiple,
                    pinImmediately: pollPin,
                  },
                  'Poll posted to noveqthebrand.'
                );
                if (res) {
                  setPollQuestion('');
                  setPollOptions(['', '']);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-ink-black mb-1">
                  Poll Question
                </label>
                <input
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. Which colour should we cut more pairs of for Nov 27?"
                  className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-sm text-ink-black"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-ink-black">
                    Choices (2 to 10)
                  </label>
                  {pollOptions.length < 10 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="inline-flex items-center gap-1 text-espresso font-semibold hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Choice</span>
                    </button>
                  )}
                </div>

                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      required={idx < 2}
                      value={opt}
                      onChange={(e) => {
                        const next = [...pollOptions];
                        next[idx] = e.target.value;
                        setPollOptions(next);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-3.5 py-2 bg-bone/60 border border-cocoa/30 rounded-xl text-xs"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setPollOptions(pollOptions.filter((_, i) => i !== idx))
                        }
                        aria-label="Remove option"
                        className="p-2 text-oxblood hover:bg-oxblood/10 rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!pollAnonymous}
                    onChange={(e) => setPollAnonymous(!e.target.checked)}
                  />
                  <span>Show who voted</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pollMultiple}
                    onChange={(e) => setPollMultiple(e.target.checked)}
                  />
                  <span>Allow multiple choices</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pollPin}
                    onChange={(e) => setPollPin(e.target.checked)}
                  />
                  <span>Pin poll</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={busyAction === 'send_poll'}
                className="press-tactile inline-flex items-center gap-2 px-6 py-2.5 bg-ink-black hover:bg-espresso text-warm-white rounded-full font-medium text-xs cursor-pointer min-h-[40px]"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Launch Poll</span>
              </button>
            </form>
          )}

          {/* PANEL C: GROUP PEOPLE, INVITE LINK & SETTINGS */}
          {section === 'group' && (
            <div className="space-y-6 text-xs">
              {/* Invite Link (Add people to group) */}
              <div className="p-4 bg-bone/60 border border-cocoa/20 rounded-xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-ink-black">
                      Add Someone to {overview?.group.title || 'noveqthebrand'}
                    </h3>
                    <p className="text-[11px] text-muted-taupe">
                      Telegram lets users join via invite link. Generate a fresh link and share it anywhere.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busyAction === 'create_invite_link'}
                    onClick={async () => {
                      const res = await runBotAction(
                        'create_invite_link',
                        { name: 'NOVEQ Studio Invite' },
                        'Invite link generated.'
                      );
                      if (res?.inviteLink) setInviteLink(res.inviteLink);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-black text-warm-white rounded-full font-semibold text-xs cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>New Invite Link</span>
                  </button>
                </div>

                {inviteLink && (
                  <div className="flex items-center gap-2 p-2.5 bg-warm-white border border-cocoa/25 rounded-lg">
                    <code className="flex-1 text-espresso truncate font-mono">
                      {inviteLink}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteLink);
                        setCopiedInvite(true);
                        setTimeout(() => setCopiedInvite(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-bone rounded-full font-semibold cursor-pointer"
                    >
                      {copiedInvite ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Group Name & Bio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-semibold text-ink-black">
                    Group Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={groupTitleInput}
                      onChange={(e) => setGroupTitleInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-bone/60 border border-cocoa/30 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        runBotAction(
                          'set_group_title',
                          { title: groupTitleInput },
                          'Group name updated.'
                        )
                      }
                      className="px-3.5 py-2 bg-bone border border-cocoa/30 rounded-xl font-semibold hover:bg-warm-white cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-ink-black">
                    Group Description
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={groupDescInput}
                      onChange={(e) => setGroupDescInput(e.target.value)}
                      placeholder="Short group note..."
                      className="flex-1 px-3 py-2 bg-bone/60 border border-cocoa/30 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        runBotAction(
                          'set_group_description',
                          { description: groupDescInput },
                          'Group description updated.'
                        )
                      }
                      className="px-3.5 py-2 bg-bone border border-cocoa/30 rounded-xl font-semibold hover:bg-warm-white cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Group Admins & Member Actions */}
              <div className="space-y-3 pt-2 border-t border-cocoa/15">
                <h3 className="font-semibold text-ink-black">
                  Group Admins &amp; Member Moderation
                </h3>

                {overview?.admins && overview.admins.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {overview.admins.map((ad) => (
                      <button
                        key={ad.user.id}
                        type="button"
                        onClick={() => setMemberUserId(String(ad.user.id))}
                        className="px-3 py-1.5 rounded-full bg-bone border border-cocoa/20 text-[11px] hover:border-ink-black cursor-pointer"
                      >
                        {ad.user.first_name}
                        {ad.user.username ? ` (@${ad.user.username})` : ''} ·{' '}
                        <span className="font-mono text-cocoa">{ad.user.id}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={memberUserId}
                    onChange={(e) => setMemberUserId(e.target.value)}
                    placeholder="Telegram User ID (tap an admin above or enter ID)"
                    className="px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl font-mono text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-muted-taupe whitespace-nowrap">Mute duration (hrs):</span>
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={memberMuteHours}
                      onChange={(e) => setMemberMuteHours(Number(e.target.value))}
                      className="w-24 px-3 py-2 bg-bone/60 border border-cocoa/30 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { act: 'mute', label: `Mute ${memberMuteHours}h` },
                    { act: 'unmute', label: 'Unmute' },
                    { act: 'promote', label: 'Make Admin' },
                    { act: 'demote', label: 'Remove Admin' },
                    { act: 'kick', label: 'Remove from Group', danger: true },
                    { act: 'unban', label: 'Unban' },
                  ].map((btn) => (
                    <button
                      key={btn.act}
                      type="button"
                      disabled={!memberUserId || Boolean(busyAction)}
                      onClick={() =>
                        runBotAction(
                          'manage_member',
                          {
                            memberAction: btn.act,
                            userId: Number(memberUserId),
                            muteHours: memberMuteHours,
                          },
                          `Updated user ${memberUserId} (${btn.label}).`
                        )
                      }
                      className={`px-3.5 py-2 rounded-full border text-xs font-semibold cursor-pointer disabled:opacity-40 ${
                        btn.danger
                          ? 'border-oxblood/30 text-oxblood hover:bg-oxblood/10'
                          : 'border-cocoa/30 bg-warm-white hover:bg-bone text-ink-black'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PANEL D: BRANDED EMAIL COMPOSER */}
          {section === 'email' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'custom' as const, label: 'Specific Email(s)' },
                  { id: 'nov27' as const, label: 'Nov 27 Reminders' },
                  { id: 'restock' as const, label: 'Restock Waitlist' },
                  { id: 'all_real' as const, label: 'All Real Contacts' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEmailAudience(opt.id)}
                    className={`press-tactile py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                      emailAudience === opt.id
                        ? 'bg-ink-black text-warm-white border-ink-black'
                        : 'bg-bone/50 text-espresso border-cocoa/15 hover:bg-bone'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {emailAudience === 'custom' && (
                <div>
                  <label className="block font-semibold text-ink-black mb-1">
                    Recipient Email(s)
                  </label>
                  <input
                    type="text"
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    placeholder="email1@gmail.com, email2@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl font-mono text-xs"
                  />
                </div>
              )}

              <div className="text-[11px] text-cocoa">
                Deliverable real recipients matched:{' '}
                <strong className="font-mono text-ink-black">
                  {resolvedEmailTargets.length}
                </strong>{' '}
                (offline phone placeholders are skipped automatically).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink-black mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Drop 001 studio update"
                    className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink-black mb-1">
                    Card Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={emailHeading}
                    onChange={(e) => setEmailHeading(e.target.value)}
                    placeholder="Matches subject if blank"
                    className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-black mb-1">
                  Plain-English Email Message
                </label>
                <textarea
                  rows={4}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write clearly as The NOVEQ Team. Sent inside your dark Double-Bezel NOVEQ card with Reply-To support and 1-click Unsubscribe."
                  className="w-full p-3.5 bg-bone/60 border border-cocoa/30 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={emailCtaLabel}
                  onChange={(e) => setEmailCtaLabel(e.target.value)}
                  placeholder="Button Label (optional, e.g. Shop Collection)"
                  className="px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-xs"
                />
                <input
                  type="url"
                  value={emailCtaUrl}
                  onChange={(e) => setEmailCtaUrl(e.target.value)}
                  placeholder="https://www.noveq.com.ng/shop"
                  className="px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-xs font-mono"
                />
              </div>

              {emailConfirmOpen ? (
                <div className="p-4 rounded-xl bg-bone/70 text-ink-black border border-cocoa/18 space-y-3">
                  <p className="text-xs leading-relaxed">
                    Ready to send{' '}
                    <strong className="font-medium">&ldquo;{emailSubject}&rdquo;</strong> to{' '}
                    <strong className="font-medium">{resolvedEmailTargets.length}</strong> recipient(s) from{' '}
                    <code className="text-espresso">NOVEQ &lt;hello@noveq.com.ng&gt;</code>?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEmailConfirmOpen(false)}
                      className="press-tactile px-4 py-2 rounded-full bg-warm-white border border-cocoa/18 text-xs font-medium cursor-pointer"
                    >
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      disabled={busyAction === 'send_email'}
                      onClick={async () => {
                        const res = await runBotAction(
                          'send_email',
                          {
                            recipients: resolvedEmailTargets,
                            subject: emailSubject,
                            heading: emailHeading,
                            body: emailBody,
                            ctaLabel: emailCtaLabel,
                            ctaUrl: emailCtaUrl,
                          },
                          'Branded emails dispatched.'
                        );
                        if (res) {
                          setEmailConfirmOpen(false);
                          setEmailSubject('');
                          setEmailHeading('');
                          setEmailBody('');
                        }
                      }}
                      className="press-tactile px-5 py-2 rounded-full bg-ink-black text-warm-white font-medium text-xs cursor-pointer"
                    >
                      {busyAction === 'send_email'
                        ? 'Sending...'
                        : 'Confirm & Send Now'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={
                    resolvedEmailTargets.length === 0 ||
                    !emailSubject.trim() ||
                    !emailBody.trim()
                  }
                  onClick={() => setEmailConfirmOpen(true)}
                  className="press-tactile inline-flex items-center gap-2 px-6 py-2.5 bg-ink-black hover:bg-espresso text-warm-white rounded-full font-medium text-xs cursor-pointer disabled:opacity-40 min-h-[40px]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Review &amp; Send Email</span>
                </button>
              )}
            </div>
          )}

          {/* PANEL E: QUICK STORE ACTIONS (ADD/REMOVE SUBSCRIBER + PRODUCT AVAILABILITY) */}
          {section === 'store' && (
            <div className="space-y-6 text-xs">
              <div className="space-y-3">
                <h3 className="font-semibold text-ink-black">
                  Add or Remove Contact on Waitlists
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="email"
                    value={subEmailInput}
                    onChange={(e) => setSubEmailInput(e.target.value)}
                    placeholder="person@gmail.com"
                    className="px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl font-mono text-xs"
                  />
                  <select
                    value={subSourceInput}
                    onChange={(e) => setSubSourceInput(e.target.value)}
                    className="px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-xs"
                  >
                    <option value="black_friday_2026">Nov 27 Edit Reminder</option>
                    <option value="restock_the-twist-slide-pam">
                      Restock · The Twist
                    </option>
                    <option value="restock_the-ring-slide-pam">
                      Restock · The Ring
                    </option>
                    <option value="homepage_waitlist">General Priority List</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!subEmailInput.includes('@') || Boolean(busyAction)}
                    onClick={async () => {
                      const res = await runBotAction(
                        'add_subscriber',
                        { email: subEmailInput, source: subSourceInput },
                        `Added ${subEmailInput}.`
                      );
                      if (res) {
                        setSubEmailInput('');
                        onRefreshStoreData();
                      }
                    }}
                    className="px-4 py-2 bg-ink-black text-warm-white rounded-full font-semibold cursor-pointer disabled:opacity-40"
                  >
                    Add Contact
                  </button>
                  <button
                    type="button"
                    disabled={!subEmailInput.includes('@') || Boolean(busyAction)}
                    onClick={async () => {
                      const res = await runBotAction(
                        'remove_subscriber',
                        { email: subEmailInput },
                        `Removed ${subEmailInput}.`
                      );
                      if (res) {
                        setSubEmailInput('');
                        onRefreshStoreData();
                      }
                    }}
                    className="px-4 py-2 border border-oxblood/30 text-oxblood rounded-full font-semibold hover:bg-oxblood/10 cursor-pointer disabled:opacity-40"
                  >
                    Remove Contact
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-cocoa/15 space-y-2.5">
                <h3 className="font-semibold text-ink-black">
                  Quick Style Availability Switch
                </h3>
                <div className="space-y-2">
                  {products.map((prod) => (
                    <div
                      key={prod.slug}
                      className="p-3 bg-bone/50 border border-cocoa/15 rounded-xl flex items-center justify-between gap-3"
                    >
                      <span className="font-semibold text-ink-black">
                        {prod.name}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          await runBotAction(
                            'toggle_product_restocking',
                            {
                              slugOrName: prod.slug,
                              restocking: !prod.restocking,
                            },
                            `${prod.name} updated.`
                          );
                          onRefreshStoreData();
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold border cursor-pointer ${
                          prod.restocking
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        {prod.restocking ? 'Restocking (Tap to Open)' : 'Open (Tap to Pause)'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Bot Activity Feed (Pin / Edit / Stop Poll / Delete Sent Messages) */}
        <div className="lg:col-span-5 bg-warm-white border border-cocoa/12 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cocoa/12 pb-3.5">
            <div>
              <h3 className="font-editorial text-xl font-normal text-ink-black">
                Recent Bot Actions
              </h3>
              <p className="text-[11px] text-muted-taupe">
                Pin, edit, close polls, or delete messages right here.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                runBotAction('check_orders_summary', {}, 'Summary posted to group.')
              }
              className="press-tactile px-3 py-1.5 rounded-full bg-bone/70 border border-cocoa/18 text-[11px] font-medium hover:bg-bone transition-colors cursor-pointer"
            >
              Post Summary
            </button>
          </div>

          {activity.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-taupe border border-dashed border-cocoa/20 rounded-xl space-y-1.5">
              <Bot className="w-7 h-7 text-cocoa/40 mx-auto" />
              <p className="font-semibold text-ink-black">No recent Bot Studio messages yet</p>
              <p>Anything you send or post from here will appear with 1-click Pin / Edit / Delete buttons.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    item.deleted
                      ? 'bg-bone/30 border-cocoa/15 opacity-55'
                      : 'bg-bone/50 border-cocoa/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-cocoa">
                      {item.kind.replace('_', ' ')}
                      {item.messageId ? ` · #${item.messageId}` : ''}
                      {item.pinned ? ' · Pinned' : ''}
                      {item.deleted ? ' · Deleted' : ''}
                    </span>
                    <span className="text-[10px] text-muted-taupe font-mono shrink-0">
                      {new Date(item.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {editingMsgId === item.messageId && item.messageId ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingMsgText}
                        onChange={(e) => setEditingMsgText(e.target.value)}
                        className="w-full px-3 py-1.5 bg-warm-white border border-cocoa/30 rounded-lg text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await runBotAction(
                              'edit_message',
                              { messageId: item.messageId, text: editingMsgText },
                              'Message edited.'
                            );
                            setEditingMsgId(null);
                          }}
                          className="px-3 py-1 bg-ink-black text-warm-white rounded-full text-[11px] cursor-pointer"
                        >
                          Save Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMsgId(null)}
                          className="px-3 py-1 border border-cocoa/30 rounded-full text-[11px] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-ink-black leading-relaxed break-words">
                      {item.summary}
                    </p>
                  )}

                  {item.messageId && !item.deleted && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-cocoa/10">
                      <button
                        type="button"
                        onClick={() =>
                          runBotAction(
                            item.pinned ? 'unpin_message' : 'pin_message',
                            { messageId: item.messageId },
                            item.pinned ? 'Message unpinned.' : 'Message pinned.'
                          )
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-espresso hover:underline cursor-pointer"
                      >
                        <Pin className="w-3 h-3" />
                        <span>{item.pinned ? 'Unpin' : 'Pin'}</span>
                      </button>

                      {item.kind === 'message' && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMsgId(item.messageId!);
                            setEditingMsgText(item.summary);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-cocoa hover:underline cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}

                      {item.kind === 'poll' && (
                        <button
                          type="button"
                          onClick={() =>
                            runBotAction(
                              'stop_poll',
                              { messageId: item.messageId },
                              'Closed poll.'
                            )
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-cocoa hover:underline cursor-pointer"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Close Poll</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          runBotAction(
                            'delete_message',
                            { messageId: item.messageId },
                            `Removed message #${item.messageId}.`
                          )
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-oxblood hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
