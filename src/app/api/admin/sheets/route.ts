import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, getOrderById } from '@/lib/orders';
import {
  syncOrderToGoogleSheets,
  testGoogleSheetsWebhook,
  DEFAULT_WEBHOOK_URL,
} from '@/services/googleSheetsService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customUrl = searchParams.get('webhookUrl') || undefined;

    const testResult = await testGoogleSheetsWebhook(customUrl);

    return NextResponse.json({
      success: testResult.success,
      webhookUrl: customUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_WEBHOOK_URL,
      status: testResult.status,
      message: testResult.message,
      data: testResult.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to test Google Sheets webhook';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, orderId, webhookUrl } = body;

    // Action 1: Test Connection
    if (action === 'test') {
      const result = await testGoogleSheetsWebhook(webhookUrl);
      return NextResponse.json(result);
    }

    // Action 2: Sync single order
    if (action === 'sync_order' && orderId) {
      const order = getOrderById(orderId);
      if (!order) {
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      }
      const syncResult = await syncOrderToGoogleSheets(order, webhookUrl);
      return NextResponse.json(syncResult);
    }

    // Action 3: Sync all orders
    if (action === 'sync_all') {
      const allOrders = getAllOrders();
      const results: Array<{ orderId: string; success: boolean; message: string }> = [];

      for (const order of allOrders) {
        const res = await syncOrderToGoogleSheets(order, webhookUrl);
        results.push({
          orderId: order.id,
          success: res.success,
          message: res.message,
        });
      }

      const succeeded = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      return NextResponse.json({
        success: failed === 0,
        total: allOrders.length,
        succeeded,
        failed,
        results,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action specified' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Google Sheets sync request failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
