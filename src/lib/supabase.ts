import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default project credentials for 'noveqthebrand' (ref: yyugbhkisjhqatwntpgt)
const DEFAULT_SUPABASE_URL = 'https://yyugbhkisjhqatwntpgt.supabase.co';
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dWdiaGtpc2pocWF0d250cGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2ODY4NTMsImV4cCI6MjEwNjI2Mjg1M30.ay-6YpaSodygrybavSu1ymI5FkoUmMjZEInqBjL623Y';
const DEFAULT_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dWdiaGtpc2pocWF0d250cGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDY4Njg1MywiZXhwIjoyMTA2MjYyODUzfQ.KL79dl70YBsVWWwl2Do9S_trGzE5m2S_n_RkjJ1IrFk';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_ROLE_KEY;

// Public client for browser / client-side queries with RLS
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Authoritative server-side admin client (bypasses RLS, for API routes & webhooks)
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
