import { NextResponse } from 'next/server';
import { saveSubscriber, getAllSubscribers, getSubscriberCount, deleteSubscriber, Subscriber } from '@/lib/subscribers';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, source, name, campaignState } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const result = saveSubscriber(email, source || 'homepage_waitlist', {
      name,
      campaignState,
      tags: ['vip_waitlist', source || 'direct_signup'],
    });

    return NextResponse.json({
      success: true,
      isNew: result.isNew,
      message: result.isNew
        ? 'Thank you for subscribing. You will receive private drop releases and updates.'
        : 'Welcome back. Your subscription is active.',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'An error occurred while saving your registration.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 1. Fetch from Supabase first
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: supaSubs, error } = await supabaseAdmin
        .from('subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (!error && supaSubs && supaSubs.length > 0) {
        const mapped: Subscriber[] = supaSubs.map((s) => ({
          id: s.id || `SUB_${s.email}`,
          email: s.email,
          name: s.name || undefined,
          source: s.source || 'website',
          campaignState: s.campaign_state || undefined,
          subscribedAt: s.subscribed_at,
          tags: Array.isArray(s.tags) ? s.tags : [],
        }));

        return NextResponse.json({
          subscribers: mapped,
          total: mapped.length,
          source: 'supabase',
        });
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Supabase subscribers fetch fallback:', err);
  }

  // 2. Fallback to local store
  const subscribers = getAllSubscribers();
  const total = getSubscriberCount();
  return NextResponse.json({
    subscribers,
    total,
    source: 'local',
  });
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'email parameter is required.' },
        { status: 400 }
      );
    }

    const removed = deleteSubscriber(email);
    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, removedEmail: email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete subscriber';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

