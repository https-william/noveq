import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  source: 'homepage_waitlist' | 'footer_newsletter' | 'checkout' | 'contact_inquiry';
  campaignState?: string;
  subscribedAt: string;
  tags: string[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist subscribers to disk:', err);
  }
}

function syncSubscriberToSupabase(sub: Subscriber) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }
  try {
    supabaseAdmin
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
      )
      .then(({ error }) => {
        if (error && !error.message?.includes('schema cache')) {
          // eslint-disable-next-line no-console
          console.error('Supabase subscriber sync error:', error.message);
        }
      });
  } catch {
    // Non-blocking
  }
}

export function saveSubscriber(
  email: string,
  source: Subscriber['source'] = 'homepage_waitlist',
  meta?: {
    name?: string;
    campaignState?: string;
    tags?: string[];
  }
): { subscriber: Subscriber; isNew: boolean } {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = subscribersStore.get(normalizedEmail);

  if (existing) {
    // Update metadata/tags if provided
    if (meta?.name && !existing.name) existing.name = meta.name;
    if (meta?.tags) {
      existing.tags = Array.from(new Set([...existing.tags, ...meta.tags]));
    }
    subscribersStore.set(normalizedEmail, existing);
    persistToFile();
    syncSubscriberToSupabase(existing);
    return { subscriber: existing, isNew: false };
  }

  const newSub: Subscriber = {
    id: `SUB_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    email: normalizedEmail,
    name: meta?.name,
    source,
    campaignState: meta?.campaignState,
    subscribedAt: new Date().toISOString(),
    tags: meta?.tags || [source],
  };

  subscribersStore.set(normalizedEmail, newSub);
  persistToFile();
  syncSubscriberToSupabase(newSub);

  return { subscriber: newSub, isNew: true };
}

export function getAllSubscribers(): Subscriber[] {
  return Array.from(subscribersStore.values()).sort(
    (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
  );
}

export function getSubscriberCount(): number {
  return subscribersStore.size;
}
