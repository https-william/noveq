import { NextRequest, NextResponse } from 'next/server';
import { buildBlackFridayCampaignEmail } from '@/services/emailService';

/**
 * Read-only HTML email preview endpoint so the founding team can visually
 * inspect the rendered email layout and graphics in the browser before approving a send.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || 'preview@noveq.com.ng';
  const useLocalAssets = searchParams.get('prodImages') !== '1';

  const { html } = buildBlackFridayCampaignEmail({
    recipientEmail: email,
    useLocalAssets,
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
