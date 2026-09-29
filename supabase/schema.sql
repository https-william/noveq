-- ==============================================================================
-- NOVEQ AUTHORITATIVE SUPABASE SCHEMA
-- Drop 001 Commerce Engine, Realtime Order Ledger, & VIP Retention
-- Project: noveqthebrand (yyugbhkisjhqatwntpgt)
-- ==============================================================================

-- 1. SUBSCRIBERS TABLE (VIP Waitlist, Newsletter, Drop Notifications)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'homepage_waitlist',
  campaign_state TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[] DEFAULT ARRAY['vip_waitlist']
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers (email);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON public.subscribers (subscribed_at DESC);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to register email
CREATE POLICY "Allow public insert to subscribers" ON public.subscribers
  FOR INSERT WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service_role full control on subscribers" ON public.subscribers
  FOR ALL USING (true);


-- 2. ORDERS TABLE (Realtime Authoritative Commerce Ledger)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending_payment',
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  delivery_expectation TEXT,
  payment JSONB NOT NULL,
  notes TEXT
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Allow service_role full control on orders" ON public.orders
  FOR ALL USING (true);


-- 3. ENABLE SUPABASE REALTIME (Instant admin updates without refreshing)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscribers;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;
