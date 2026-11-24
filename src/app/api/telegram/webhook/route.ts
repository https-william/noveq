import { NextRequest, NextResponse } from 'next/server';
import {
  getTelegramBotConfig,
  callTelegramApi,
  sendTelegramGroupMessage,
  sendTelegramGroupPoll,
  pinTelegramGroupMessage,
  deleteTelegramGroupMessage,
  createTelegramGroupInviteLink,
  TelegramChatAdmin,
  escapeHtml,
} from '@/services/telegramService';
import { recordTelegramActivity } from '@/lib/telegramLog';
import { getAllOrders } from '@/lib/orders';
import {
  saveSubscriber,
  deleteSubscriber,
  getAllSubscribersAsync,
} from '@/lib/subscribers';
import {
  getAllAdminProductsAsync,
  toggleProductRestocking,
} from '@/lib/productStore';
import { sendCustomBrandEmails } from '@/services/emailService';

interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name?: string; username?: string; is_bot?: boolean };
  chat: { id: number; type: string; title?: string };
  text?: string;
  reply_to_message?: { message_id: number; text?: string };
}

async function isAuthorizedSender(userId?: number): Promise<boolean> {
  if (!userId) return false;

  const envAllowed = (process.env.TELEGRAM_ALLOWED_USER_IDS || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (envAllowed.includes(userId)) {
    return true;
  }

  const { primaryChatId } = getTelegramBotConfig();
  const adminsRes = await callTelegramApi<TelegramChatAdmin[]>(
    'getChatAdministrators',
    { chat_id: primaryChatId }
  );
  if (adminsRes.ok && Array.isArray(adminsRes.result)) {
    return adminsRes.result.some(
      (admin) => !admin.user.is_bot && admin.user.id === userId
    );
  }
  return false;
}

async function replyToSender(chatId: number | string, text: string, replyToId?: number) {
  return callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...(replyToId ? { reply_to_message_id: replyToId } : {}),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { primaryChatId, webhookSecret } = getTelegramBotConfig();
    const headerSecret = req.headers.get('x-telegram-bot-api-secret-token');
    if (headerSecret !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized webhook token' }, { status: 401 });
    }

    const update = await req.json();
    const msg: TelegramMessage | undefined = update.message || update.edited_message;
    if (!msg?.text || msg.from?.is_bot) {
      return NextResponse.json({ ok: true });
    }

    const rawText = msg.text.trim();
    if (!rawText.startsWith('/')) {
      return NextResponse.json({ ok: true });
    }

    const allowed = await isAuthorizedSender(msg.from?.id);
    if (!allowed) {
      return NextResponse.json({ ok: true });
    }

    // Parse command cleanly (handles `/say@noveq_orders_bot hello`)
    const spaceIdx = rawText.search(/\s/);
    const rawCmd = (spaceIdx === -1 ? rawText : rawText.slice(0, spaceIdx)).toLowerCase();
    const cmd = rawCmd.split('@')[0];
    const argsText = spaceIdx === -1 ? '' : rawText.slice(spaceIdx + 1).trim();
    const sourceChatId = msg.chat.id;

    switch (cmd) {
      case '/help':
      case '/start': {
        await replyToSender(
          sourceChatId,
          `<b>NOVEQ Bot Studio Commands</b>\n` +
            `• <code>/say message</code> — Bot posts cleanly in noveqthebrand\n` +
            `• <code>/poll Question | Option A | Option B</code> — Post a vote\n` +
            `• <code>/orders</code> — Check active orders &amp; queue\n` +
            `• <code>/stats</code> — Live sales, pairs &amp; waitlists\n` +
            `• <code>/stock twist restocking</code> or <code>/stock twist open</code>\n` +
            `• <code>/email addr@mail.com | Subject | Message</code>\n` +
            `• <code>/addsub email@mail.com [source]</code> / <code>/removesub email</code>\n` +
            `• <code>/invite</code> — Generate a group invite link\n` +
            `• <code>/pin</code> or <code>/delete</code> (reply to a message in group)`,
          msg.message_id
        );
        break;
      }

      case '/say': {
        if (!argsText) {
          await replyToSender(sourceChatId, 'Type what I should say, e.g. <code>/say Delivery riders are out.</code>', msg.message_id);
          break;
        }
        const sent = await sendTelegramGroupMessage({
          chatId: primaryChatId,
          text: escapeHtml(argsText),
        });
        if (sent.ok) {
          await recordTelegramActivity({
            kind: 'message',
            summary: argsText,
            messageId: sent.result?.message_id,
          });
          if (String(sourceChatId) !== String(primaryChatId)) {
            await replyToSender(sourceChatId, 'Sent to noveqthebrand.', msg.message_id);
          }
        }
        break;
      }

      case '/poll': {
        const parts = argsText.split('|').map((p) => p.trim()).filter(Boolean);
        if (parts.length < 3) {
          await replyToSender(
            sourceChatId,
            'Format: <code>/poll Who speaks? | Preye | Amanda | Both</code>',
            msg.message_id
          );
          break;
        }
        const sent = await sendTelegramGroupPoll({
          chatId: primaryChatId,
          question: parts[0],
          options: parts.slice(1, 11),
          isAnonymous: false,
        });
        if (sent.ok) {
          await recordTelegramActivity({
            kind: 'poll',
            summary: `Poll: "${parts[0]}"`,
            messageId: sent.result?.message_id,
            pollId: sent.result?.poll?.id,
          });
        }
        break;
      }

      case '/orders': {
        const orders = await getAllOrders();
        const active = orders.filter((o) => o.status !== 'cancelled');
        const pending = active.filter((o) =>
          ['paid', 'sourcing', 'processing', 'out for delivery', 'shipped'].includes(o.status)
        );
        const topList = pending
          .slice(0, 5)
          .map(
            (o) =>
              `• <code>${escapeHtml(o.id)}</code> — ${escapeHtml(o.customer.fullName)} (${escapeHtml(o.status)}, ₦${o.total.toLocaleString()})`
          )
          .join('\n');
        await replyToSender(
          sourceChatId,
          `<b>NOVEQ Orders Queue</b>\n${pending.length} active orders waiting delivery (${active.length} total).\n${topList || 'All caught up.'}`,
          msg.message_id
        );
        break;
      }

      case '/stats': {
        const [orders, subs] = await Promise.all([
          getAllOrders(),
          getAllSubscribersAsync(),
        ]);
        const active = orders.filter((o) => o.status !== 'cancelled');
        const revenue = active.reduce((s, o) => s + o.total, 0);
        const pairs = active.reduce(
          (s, o) => s + o.items.reduce((iS, it) => iS + it.quantity, 0),
          0
        );
        await replyToSender(
          sourceChatId,
          `<b>NOVEQ Snapshot</b>\n• Gross Sales: <b>₦${revenue.toLocaleString()}</b>\n• Orders: <b>${active.length}</b> (${pairs} pairs)\n• Email Contacts: <b>${subs.length}</b>`,
          msg.message_id
        );
        break;
      }

      case '/stock': {
        const tokens = argsText.split(/\s+/).filter(Boolean);
        if (tokens.length < 2) {
          await replyToSender(
            sourceChatId,
            'Format: <code>/stock twist open</code> or <code>/stock ring restocking</code>',
            msg.message_id
          );
          break;
        }
        const statusWord = tokens[tokens.length - 1].toLowerCase();
        const query = tokens.slice(0, -1).join(' ').toLowerCase();
        const allProducts = await getAllAdminProductsAsync();
        const target = allProducts.find(
          (p) =>
            p.slug.toLowerCase().includes(query) ||
            p.name.toLowerCase().includes(query)
        );
        if (!target) {
          await replyToSender(sourceChatId, `No style matched "${escapeHtml(query)}".`, msg.message_id);
          break;
        }
        const restocking = statusWord.includes('restock') || statusWord === 'pause';
        await toggleProductRestocking(target.slug, restocking);
        await recordTelegramActivity({
          kind: 'store_action',
          summary: `${target.name} set to ${restocking ? 'Restocking Soon' : 'Open'} via Telegram`,
        });
        await replyToSender(
          sourceChatId,
          `Updated <b>${escapeHtml(target.name)}</b> to <b>${restocking ? 'Restocking Soon' : 'Open for Orders'}</b>.`,
          msg.message_id
        );
        break;
      }

      case '/email': {
        const parts = argsText.split('|').map((s) => s.trim());
        if (parts.length < 3 || !parts[0].includes('@')) {
          await replyToSender(
            sourceChatId,
            'Format: <code>/email name@gmail.com | Subject | Message text</code>',
            msg.message_id
          );
          break;
        }
        const dispatch = await sendCustomBrandEmails({
          recipients: parts[0].split(',').map((s) => s.trim()),
          subject: parts[1],
          body: parts.slice(2).join(' | '),
        });
        await recordTelegramActivity({
          kind: 'email',
          summary: `Sent email via Telegram: "${parts[1]}" (${dispatch.sent}/${dispatch.total})`,
        });
        await replyToSender(
          sourceChatId,
          `Email sent (${dispatch.sent}/${dispatch.total} delivered).`,
          msg.message_id
        );
        break;
      }

      case '/addsub': {
        const [rawEmail, ...rest] = argsText.split(/\s+/).filter(Boolean);
        if (!rawEmail || !rawEmail.includes('@')) {
          await replyToSender(sourceChatId, 'Format: <code>/addsub person@gmail.com</code>', msg.message_id);
          break;
        }
        const source = rest[0] || 'telegram_bot';
        await saveSubscriber(rawEmail, source, { tags: [source] });
        await recordTelegramActivity({
          kind: 'store_action',
          summary: `Added subscriber ${rawEmail} via Telegram`,
        });
        await replyToSender(sourceChatId, `Saved <code>${escapeHtml(rawEmail)}</code>.`, msg.message_id);
        break;
      }

      case '/removesub': {
        const targetEmail = argsText.split(/\s+/)[0];
        if (!targetEmail || !targetEmail.includes('@')) {
          await replyToSender(sourceChatId, 'Format: <code>/removesub person@gmail.com</code>', msg.message_id);
          break;
        }
        await deleteSubscriber(targetEmail);
        await recordTelegramActivity({
          kind: 'store_action',
          summary: `Removed subscriber ${targetEmail} via Telegram`,
        });
        await replyToSender(sourceChatId, `Removed <code>${escapeHtml(targetEmail)}</code>.`, msg.message_id);
        break;
      }

      case '/invite': {
        const res = await createTelegramGroupInviteLink({
          chatId: primaryChatId,
          name: 'Bot Invite',
        });
        if (res.ok && res.result?.invite_link) {
          await replyToSender(
            sourceChatId,
            `Group invite link:\n${res.result.invite_link}`,
            msg.message_id
          );
        } else {
          await replyToSender(
            sourceChatId,
            `Could not create invite link (${res.description || 'promote bot to Admin first'}).`,
            msg.message_id
          );
        }
        break;
      }

      case '/pin': {
        if (!msg.reply_to_message?.message_id) {
          await replyToSender(sourceChatId, 'Reply directly to the message you want me to pin.', msg.message_id);
          break;
        }
        const res = await pinTelegramGroupMessage({
          chatId: String(sourceChatId),
          messageId: msg.reply_to_message.message_id,
        });
        if (!res.ok) {
          await replyToSender(sourceChatId, `Could not pin (${res.description || 'need Admin pin permission'}).`, msg.message_id);
        }
        break;
      }

      case '/delete': {
        if (!msg.reply_to_message?.message_id) {
          await replyToSender(sourceChatId, 'Reply to a message you want me to delete.', msg.message_id);
          break;
        }
        await deleteTelegramGroupMessage({
          chatId: String(sourceChatId),
          messageId: msg.reply_to_message.message_id,
        });
        await deleteTelegramGroupMessage({
          chatId: String(sourceChatId),
          messageId: msg.message_id,
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Telegram Webhook] Error:', err);
    return NextResponse.json({ ok: true });
  }
}
