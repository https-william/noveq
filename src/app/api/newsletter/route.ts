import { NextResponse } from 'next/server';
import { saveSubscriber, getAllSubscribers, getSubscriberCount } from '@/lib/subscribers';

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
        ? 'Thank you for registering. You are on the private priority allocation list.'
        : 'Welcome back. Your priority status is already confirmed.',
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
  const subscribers = getAllSubscribers();
  const total = getSubscriberCount();
  return NextResponse.json({
    subscribers,
    total,
  });
}
