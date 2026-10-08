import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * NOVEQ Supabase Client Initialization
 * 
 * Credentials are strictly read from process.env with zero hardcoded fallbacks
 * to ensure security in production and clean isolation across environments.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Safe mock client to prevent module-level throw during CI/CD builds when env vars are unpopulated
const createFallbackClient = (): SupabaseClient => {
  const handler: ProxyHandler<object> = {
    get: (_target, prop) => {
      if (prop === 'storage') {
        return {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: new Error('Supabase Storage not configured') }),
            download: () => Promise.resolve({ data: null, error: new Error('Supabase Storage not configured') }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
            list: () => Promise.resolve({ data: [], error: null }),
          }),
          listBuckets: () => Promise.resolve({ data: [], error: null }),
        };
      }
      return () => ({
        from: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
          upsert: () => Promise.resolve({ data: null, error: null }),
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => Promise.resolve({ data: null, error: null }),
          delete: () => Promise.resolve({ data: null, error: null }),
        }),
        channel: () => ({
          on: function () {
            return this;
          },
          subscribe: () => ({}),
        }),
        removeChannel: () => {},
      });
    },
  };
  return new Proxy({}, handler) as unknown as SupabaseClient;
};

// Public client for browser / client-side queries with RLS
export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createFallbackClient();

// Authoritative server-side admin client (bypasses RLS, for API routes & webhooks)
export const supabaseAdmin: SupabaseClient =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : createFallbackClient();
