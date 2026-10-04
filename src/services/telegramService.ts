import { Order } from '@/types/commerce';

const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || '8764223051:AAGuANrd324aIoKLh8cosQXu_UWBc5zWgDk';
const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1ZLbOPcCztTgtxmKmWLW_BB_utKxS7-DpePflxXerA1I/edit?gid=79417387#gid=79417387';

/**
 * Sends a real-time order alert to Telegram (founders/team).
 * Supports single chat ID, comma-separated chat IDs, or private team groups.
 */
export async function sendTelegramOrderNotification(order: Order): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || BOT_TOKEN;
  const rawChatIds = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || '7924266517';

  if (!token || !rawChatIds) {
    return false;
  }

  // Parse comma-separated chat IDs so both co-founders receive alerts
  const chatIds = rawChatIds
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
  const whatsAppDirect = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${order.customer.fullName}, thank you for ordering with NOVEQ. We are preparing order ${order.id} for dispatch to ${order.customer.city}.`
  )}`;

  const itemsList = order.items
    .map(
      (item) =>
        `• <b>${item.product.name}</b>\n  Color: <b>${item.selectedColour || item.product.colour}</b> | Size: <b>${item.selectedSize}</b> | Qty: <b>${item.quantity}</b>`
    )
    .join('\n');

  const messageText = `
🚨 <b>NEW NOVEQ ORDER RECEIVED</b>
━━━━━━━━━━━━━━━━━━
<b>Order Reference:</b> <code>${order.id}</code>
<b>Date:</b> ${new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} WAT

👤 <b>Customer Details:</b>
• <b>Name:</b> ${escapeHtml(order.customer.fullName)}
• <b>Phone:</b> <code>${escapeHtml(order.customer.phone)}</code>
• <b>Email:</b> ${escapeHtml(order.customer.email)}

📍 <b>Dispatch Destination:</b>
• <b>Address:</b> ${escapeHtml(order.customer.address)}
• <b>City/State:</b> ${escapeHtml(order.customer.city)}, ${escapeHtml(order.customer.state)}
${order.customer.deliveryNotes ? `• <b>Note:</b> <i>“${escapeHtml(order.customer.deliveryNotes)}”</i>\n` : ''}
👞 <b>Items:</b>
${itemsList}

💰 <b>Financials:</b>
• <b>Total Paid:</b> ₦${order.total.toLocaleString()} (Verified)
• <b>Delivery Fee:</b> Pay on Delivery (to rider)
• <b>Payment:</b> Paystack Instant Settlement
━━━━━━━━━━━━━━━━━━
<i>Drop 001 inventory updated automatically.</i>
`.trim();

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: '💬 Message Customer (WhatsApp)',
          url: whatsAppDirect,
        },
      ],
      [
        {
          text: '📊 Open Google Sheet',
          url: GOOGLE_SHEET_URL,
        },
        {
          text: '🌐 Live Store',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'https://noveq.com.ng',
        },
      ],
    ],
  };

  let allSuccess = true;

  for (const chatId of chatIds) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard,
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        allSuccess = false;
        // eslint-disable-next-line no-console
        console.error(`[Telegram Alert] Failed for chat ID ${chatId}: ${response.statusText}`);
      }
    } catch (err) {
      allSuccess = false;
      // eslint-disable-next-line no-console
      console.error(`[Telegram Alert Error] Chat ID ${chatId}:`, err);
    }
  }

  return allSuccess;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
