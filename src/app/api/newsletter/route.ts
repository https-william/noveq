import { NextResponse } from 'next/server';
import {
  saveSubscriber,
  getAllSubscribersAsync,
  deleteSubscriber,
} from '@/lib/subscribers';
import { sendSubscriberConfirmationEmail } from '@/services/emailService';

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

    const cleanSource = (source || 'homepage_waitlist').trim();
    const result = await saveSubscriber(email, cleanSource, {
      name,
      campaignState,
      tags: ['vip_waitlist', cleanSource],
    });

    // Send a branded confirmation letter for new signups or new campaign/restock requests
    let emailSent = false;
    if ((result.isNew || result.isNewIntent) && cleanSource !== 'checkout') {
      const dispatch = await sendSubscriberConfirmationEmail({
        email,
        source: cleanSource,
        name,
      });
      emailSent = dispatch.sent;
    }

    return NextResponse.json({
      success: true,
      isNew: result.isNew,
      emailSent,
      syncedToCloud: result.syncedToCloud,
      message: result.isNew
        ? 'You are on the list. Check your inbox for a note from NOVEQ.'
        : 'Welcome back. Your preferences are up to date.',
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
    const subscribers = await getAllSubscribersAsync();
    return NextResponse.json({
      subscribers,
      total: subscribers.length,
      source: 'merged_cloud_and_local',
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Subscribers fetch warning:', err);
    return NextResponse.json(
      { subscribers: [], total: 0, source: 'error' },
      { status: 500 }
    );
  }
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

    const removed = await deleteSubscriber(email);
    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, removedEmail: email });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to delete subscriber';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
