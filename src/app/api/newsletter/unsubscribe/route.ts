import { NextResponse } from 'next/server';
import { deleteSubscriber } from '@/lib/subscribers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    await deleteSubscriber(cleanEmail);

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed from NOVEQ email updates.',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your unsubscribe request.' },
      { status: 500 }
    );
  }
}
