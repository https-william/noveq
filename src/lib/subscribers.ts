import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  source:
    | 'homepage_waitlist'
    | 'footer_newsletter'
    | 'checkout'
    | 'contact_inquiry'
    | 'black_friday_2026'
    | 'website'
    | (string & {});
  campaignState?: string;
  subscribedAt: string;
  tags: string[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const STORAGE_BUCKET = 'products';
const STORAGE_SUBSCRIBERS_PATH = 'subscribers/subscribers.json';

declare global {
  // eslint-disable-next-line no-var
  var __noveq_subscribers: Map<string, Subscriber> | undefined;
}

function loadInitialSubscribers(): Map<string, Subscriber> {
  const map = new Map<string, Subscriber>();
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      const list: Subscriber[] = JSON.parse(data);
      for (const item of list) {
        map.set(item.email.toLowerCase().trim(), item);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to read subscribers file, initialized in memory:', err);
  }
  return map;
}

const subscribersStore: Map<string, Subscriber> =
  global.__noveq_subscribers ?? loadInitialSubscribers();

if (process.env.NODE_ENV !== 'production') {
  global.__noveq_subscribers = subscribersStore;
}

function persistToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(subscribersStore.values()).sort(
      (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
    );
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // Ignore read-only filesystem errors on serverless runtimes
  }
}

function hasSupabaseCredentials(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function syncSubscriberToSupabaseTable(sub: Subscriber): Promise<boolean> {
  if (!hasSupabaseCredentials()) return false;
  try {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .upsert(
        {
          id: sub.id,
          email: sub.email,
          name: sub.name || null,
          source: sub.source,
          campaign_state: sub.campaignState || null,
          subscribed_at: sub.subscribedAt,
          tags: sub.tags,
        },
        { onConflict: 'email' }
      );

    if (error && !error.message?.includes('schema cache')) {
      // eslint-disable-next-line no-console
      console.error('[Subscribers] Supabase table sync error:', error.message);
      return false;
    }
    return !error;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Subscribers] Supabase upsert threw:', err);
    return false;
  }
}

async function syncSubscribersToCloudStorage(): Promise<void> {
  if (!hasSupabaseCredentials()) return;
  try {
    const list = Array.from(subscribersStore.values()).sort(
      (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
    );
    await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(
        STORAGE_SUBSCRIBERS_PATH,
        Buffer.from(JSON.stringify(list, null, 2), 'utf-8'),
        {
          contentType: 'application/json',
          cacheControl: 'no-cache, no-store, max-age=0',
          upsert: true,
        }
      );
  } catch {
    // Non-fatal backup warning
  }
}

async function hydrateFromCloudSources(): Promise<void> {
  if (!hasSupabaseCredentials()) return;

  // 1. Merge from Supabase Postgres subscribers table
  try {
    const { data: supaSubs, error } = await supabaseAdmin
      .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (!error && Array.isArray(supaSubs)) {
      for (const s of supaSubs) {
        if (!s?.email) continue;
        const clean = String(s.email).toLowerCase().trim();
        const existing = subscribersStore.get(clean);
        const tags = Array.isArray(s.tags) ? s.tags : [];
        subscribersStore.set(clean, {
          id: s.id || existing?.id || `SUB_${clean}`,
          email: clean,
          name: s.name || existing?.name || undefined,
          source: s.source || existing?.source || 'website',
          campaignState: s.campaign_state || existing?.campaignState || undefined,
          subscribedAt:
            s.subscribed_at || existing?.subscribedAt || new Date().toISOString(),
          tags: existing
            ? Array.from(new Set([...existing.tags, ...tags]))
            : tags,
        });
      }
    }
  } catch {
    // Ignore read error
  }

  // 2. Merge from Supabase Storage backup if present
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(STORAGE_SUBSCRIBERS_PATH);

    if (!error && data) {
      const text = await data.text();
      const parsed: Subscriber[] = JSON.parse(text);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (!item?.email) continue;
          const clean = item.email.toLowerCase().trim();
          const existing = subscribersStore.get(clean);
          if (!existing) {
            subscribersStore.set(clean, { ...item, email: clean });
          } else {
            existing.tags = Array.from(
              new Set([...(existing.tags || []), ...(item.tags || [])])
            );
          }
        }
      }
    }
  } catch {
    // Ignore when backup file does not exist yet
  }
}

/**
 * Saves or updates a subscriber and awaits cloud persistence before returning
 * so Vercel serverless invocations never drop signups mid-flight.
 */
export async function saveSubscriber(
  email: string,
  source: Subscriber['source'] = 'homepage_waitlist',
  meta?: {
    name?: string;
    campaignState?: string;
    tags?: string[];
  }
): Promise<{
  subscriber: Subscriber;
  isNew: boolean;
  isNewIntent: boolean;
  syncedToCloud: boolean;
}> {
  await hydrateFromCloudSources();

  const normalizedEmail = email.toLowerCase().trim();
  const existing = subscribersStore.get(normalizedEmail);
  const incomingTags = Array.from(new Set([source, ...(meta?.tags || [])]));

  if (existing) {
    const hadSourceTag =
      existing.source === source || (existing.tags || []).includes(source);
    if (meta?.name && !existing.name) existing.name = meta.name;
    if (source && (source === 'black_friday_2026' || source.startsWith('restock_'))) {
      existing.source = source;
    }
    existing.tags = Array.from(new Set([...(existing.tags || []), ...incomingTags]));

    subscribersStore.set(normalizedEmail, existing);
    persistToFile();

    const [tableOk] = await Promise.all([
      syncSubscriberToSupabaseTable(existing),
      syncSubscribersToCloudStorage(),
    ]);

    return {
      subscriber: existing,
      isNew: false,
      isNewIntent: !hadSourceTag,
      syncedToCloud: tableOk,
    };
  }

  const newSub: Subscriber = {
    id: `SUB_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    email: normalizedEmail,
    name: meta?.name,
    source,
    campaignState: meta?.campaignState,
    subscribedAt: new Date().toISOString(),
    tags: incomingTags,
  };

  subscribersStore.set(normalizedEmail, newSub);
  persistToFile();

  const [tableOk] = await Promise.all([
    syncSubscriberToSupabaseTable(newSub),
    syncSubscribersToCloudStorage(),
  ]);

  return {
    subscriber: newSub,
    isNew: true,
    isNewIntent: true,
    syncedToCloud: tableOk,
  };
}

export function getAllSubscribers(): Subscriber[] {
  return Array.from(subscribersStore.values()).sort(
    (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
  );
}

export async function getAllSubscribersAsync(): Promise<Subscriber[]> {
  await hydrateFromCloudSources();
  return getAllSubscribers();
}

export function getSubscriberCount(): number {
  return subscribersStore.size;
}

export async function deleteSubscriber(email: string): Promise<boolean> {
  await hydrateFromCloudSources();
  const normalizedEmail = email.toLowerCase().trim();
  const existed = subscribersStore.delete(normalizedEmail);

  persistToFile();
  await syncSubscribersToCloudStorage();

  let deletedFromSupabase = false;
  if (hasSupabaseCredentials()) {
    try {
      const { error } = await supabaseAdmin
        .from('subscribers')
        .delete()
        .eq('email', normalizedEmail);
      deletedFromSupabase = !error;
    } catch {
      deletedFromSupabase = false;
    }
  }

  return existed || deletedFromSupabase;
}
