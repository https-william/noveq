import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase';

export interface TelegramBotLogEntry {
  id: string;
  createdAt: string;
  kind:
    | 'message'
    | 'photo'
    | 'poll'
    | 'email'
    | 'group_action'
    | 'store_action'
    | 'webhook';
  summary: string;
  chatId?: string;
  messageId?: number;
  pollId?: string;
  pinned?: boolean;
  deleted?: boolean;
  meta?: Record<string, unknown>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const LOG_FILE = path.join(DATA_DIR, 'telegram-log.json');
const STORAGE_BUCKET = 'products';
const STORAGE_LOG_PATH = 'telegram/activity.json';

declare global {
  // eslint-disable-next-line no-var
  var __noveq_telegram_log: TelegramBotLogEntry[] | undefined;
}

function loadInitialLog(): TelegramBotLogEntry[] {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore read error
  }
  return [];
}

const logStore: TelegramBotLogEntry[] =
  global.__noveq_telegram_log ?? loadInitialLog();

if (process.env.NODE_ENV !== 'production') {
  global.__noveq_telegram_log = logStore;
}

function persistLocal() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      LOG_FILE,
      JSON.stringify(logStore.slice(0, 60), null, 2),
      'utf-8'
    );
  } catch {
    // Read-only filesystem in serverless
  }
}

async function syncLogToCloud(): Promise<void> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return;
  }
  try {
    await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(
        STORAGE_LOG_PATH,
        Buffer.from(JSON.stringify(logStore.slice(0, 60), null, 2), 'utf-8'),
        {
          contentType: 'application/json',
          cacheControl: 'no-cache, no-store, max-age=0',
          upsert: true,
        }
      );
  } catch {
    // Non-fatal
  }
}

export async function getTelegramActivityLogAsync(): Promise<
  TelegramBotLogEntry[]
> {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .download(STORAGE_LOG_PATH);
      if (!error && data) {
        const parsed = JSON.parse(await data.text());
        if (Array.isArray(parsed)) {
          const seen = new Set(logStore.map((i) => i.id));
          for (const item of parsed) {
            if (item?.id && !seen.has(item.id)) {
              logStore.push(item);
            }
          }
          logStore.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      }
    } catch {
      // ignore if file does not exist yet
    }
  }
  return logStore.slice(0, 40);
}

export async function recordTelegramActivity(
  entry: Omit<TelegramBotLogEntry, 'id' | 'createdAt'>
): Promise<TelegramBotLogEntry> {
  const full: TelegramBotLogEntry = {
    id: `BOT_${Date.now()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  logStore.unshift(full);
  if (logStore.length > 60) {
    logStore.length = 60;
  }
  persistLocal();
  await syncLogToCloud();
  return full;
}

export async function markTelegramMessageState(
  messageId: number,
  updates: Partial<Pick<TelegramBotLogEntry, 'pinned' | 'deleted' | 'summary'>>
): Promise<void> {
  const item = logStore.find((l) => l.messageId === messageId);
  if (item) {
    Object.assign(item, updates);
    persistLocal();
    await syncLogToCloud();
  }
}
