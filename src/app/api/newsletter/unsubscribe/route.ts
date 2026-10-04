import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await supabaseAdmin
        .from('subscribers')
        .delete()
        .eq('email', cleanEmail);
    }

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from NOVEQ email updates.',
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
