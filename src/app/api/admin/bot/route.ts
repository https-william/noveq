import { NextRequest, NextResponse } from 'next/server';
import {
  getBotStudioOverview,
  sendTelegramGroupMessage,
  sendTelegramGroupPhoto,
  sendTelegramGroupPoll,
  stopTelegramGroupPoll,
  editTelegramGroupMessage,
  deleteTelegramGroupMessage,
  pinTelegramGroupMessage,
  unpinTelegramGroupMessage,
  setTelegramGroupTitle,
  setTelegramGroupDescription,
  createTelegramGroupInviteLink,
  manageTelegramGroupMember,
  registerTelegramBotCommands,
  setTelegramWebhook,
  removeTelegramWebhook,
  escapeHtml,
} from '@/services/telegramService';
import {
  getTelegramActivityLogAsync,
  recordTelegramActivity,
  markTelegramMessageState,
} from '@/lib/telegramLog';
import { sendCustomBrandEmails } from '@/services/emailService';
import {
  saveSubscriber,
  deleteSubscriber,
  getAllSubscribersAsync,
} from '@/lib/subscribers';
import {
  getAllAdminProductsAsync,
  toggleProductRestocking,
} from '@/lib/productStore';
import { getAllOrders } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId') || undefined;

    const [overview, activity] = await Promise.all([
      getBotStudioOverview(chatId),
      getTelegramActivityLogAsync(),
    ]);

    return NextResponse.json({
      success: true,
      overview,
      activity,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Could not inspect bot status.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload = {} } = body;

    switch (action) {
      case 'send_message': {
        const text = String(payload.text || '').trim();
        if (!text) {
          return NextResponse.json(
            { success: false, error: 'Message text cannot be empty.' },
            { status: 400 }
          );
        }
        const res = await sendTelegramGroupMessage({
          text,
          chatId: payload.chatId,
          replyToMessageId: payload.replyToMessageId
            ? Number(payload.replyToMessageId)
            : undefined,
          pinImmediately: Boolean(payload.pinImmediately),
          silent: Boolean(payload.silent),
        });
        if (!res.ok) {
          return NextResponse.json(
            { success: false, error: res.description || 'Telegram rejected the message.' },
            { status: 400 }
          );
        }
        await recordTelegramActivity({
          kind: 'message',
          summary: text,
          messageId: res.result?.message_id,
          pinned: Boolean(payload.pinImmediately),
        });
        return NextResponse.json({ success: true, result: res.result });
      }

      case 'send_photo': {
        const photoUrl = String(payload.photoUrl || '').trim();
        const caption = payload.caption ? String(payload.caption).trim() : undefined;
        if (!photoUrl) {
          return NextResponse.json(
            { success: false, error: 'Photo URL is required.' },
            { status: 400 }
          );
        }
        const res = await sendTelegramGroupPhoto({
          photoUrl,
          caption,
          chatId: payload.chatId,
          pinImmediately: Boolean(payload.pinImmediately),
        });
        if (!res.ok) {
          return NextResponse.json(
            { success: false, error: res.description || 'Telegram could not send photo.' },
            { status: 400 }
          );
        }
        await recordTelegramActivity({
          kind: 'photo',
          summary: caption ? `Photo: ${caption}` : `Photo sent (${photoUrl})`,
          messageId: res.result?.message_id,
          pinned: Boolean(payload.pinImmediately),
        });
        return NextResponse.json({ success: true, result: res.result });
      }

      case 'send_poll': {
        const question = String(payload.question || '').trim();
        const options = Array.isArray(payload.options)
          ? payload.options.map((o: unknown) => String(o).trim()).filter(Boolean)
          : [];
        if (!question || options.length < 2) {
          return NextResponse.json(
            {
              success: false,
              error: 'A poll needs a question and at least 2 options.',
            },
            { status: 400 }
          );
        }
        const res = await sendTelegramGroupPoll({
          question,
          options,
          isAnonymous: Boolean(payload.isAnonymous),
          allowsMultipleAnswers: Boolean(payload.allowsMultipleAnswers),
          pinImmediately: Boolean(payload.pinImmediately),
          chatId: payload.chatId,
        });
        if (!res.ok) {
          return NextResponse.json(
            { success: false, error: res.description || 'Failed to post poll.' },
            { status: 400 }
          );
        }
        await recordTelegramActivity({
          kind: 'poll',
          summary: `Poll: "${question}" (${options.join(' / ')})`,
          messageId: res.result?.message_id,
          pollId: res.result?.poll?.id,
          pinned: Boolean(payload.pinImmediately),
        });
        return NextResponse.json({ success: true, result: res.result });
      }

      case 'stop_poll': {
        const messageId = Number(payload.messageId);
        const res = await stopTelegramGroupPoll({ messageId, chatId: payload.chatId });
        if (!res.ok) {
          return NextResponse.json(
            { success: false, error: res.description || 'Could not close poll.' },
            { status: 400 }
          );
        }
        await recordTelegramActivity({
          kind: 'group_action',
          summary: `Closed poll #${messageId}`,
        });
        return NextResponse.json({ success: true, result: res.result });
      }

      case 'edit_message': {
        const messageId = Number(payload.messageId);
        const text = String(payload.text || '').trim();
        if (!messageId || !text) {
          return NextResponse.json(
            { success: false, error: 'Message ID and new text are required.' },
            { status: 400 }
          );
        }
        const res = await editTelegramGroupMessage({
          messageId,
          text,
          chatId: payload.chatId,
        });
        if (!res.ok) {
          return NextResponse.json(
            { success: false, error: res.description || 'Could not edit message.' },
            { status: 400 }
          );
        }
        await markTelegramMessageState(messageId, { summary: text });
        return NextResponse.json({ success: true });
      }

      case 'delete_message': {
        const messageId = Number(payload.messageId);
        const res = await deleteTelegramGroupMessage({
          messageId,
          chatId: payload.chatId,
        });
        if (!res.ok) {
          return NextResponse.json(
            {
              success: false,
              error:
                res.description ||
                'Could not delete message. Make sure NOVEQ.the.bot is a group Admin with Delete permission.',
            },
            { status: 400 }
          );
        }
        await markTelegramMessageState(messageId, { deleted: true });
        return NextResponse.json({ success: true });
      }

      case 'pin_message': {
        const messageId = Number(payload.messageId);
        const res = await pinTelegramGroupMessage({
          messageId,
          silent: Boolean(payload.silent),
          chatId: payload.chatId,
        });
        if (!res.ok) {
          return NextResponse.json(
            {
              success: false,
              error:
                res.description ||
                'Could not pin message. Check that NOVEQ.the.bot is a group Admin.',
            },
            { status: 400 }
          );
        }
        await markTelegramMessageState(messageId, { pinned: true });
        return NextResponse.json({ success: true });
      }

      case 'unpin_message': {
        const messageId = payload.messageId ? Number(payload.messageId) : undefined;
        const res = await unpinTelegramGroupMessage({
          messageId,
          chatId: payload.chatId,
        });
        if (!res.ok) {
          return NextResponse.json(
            { success: false, error: res.description || 'Could not unpin.' },
            { status: 400 }
          );
        }
        if (messageId) {
          await markTelegramMessageState(messageId, { pinned: false });
        }
        return NextResponse.json({ success: true });
      }

      case 'set_group_title': {
        const title = String(payload.title || '').trim();
        const res = await setTelegramGroupTitle(title, payload.chatId);
        if (!res.ok) {
          return NextResponse.json(
            { success: false, error: res.description || 'Could not rename group.' },
            { status: 400 }
          );
        }
        await recordTelegramActivity({
          kind: 'group_action',
          summary: `Renamed group to "${title}"`,
        });
        return NextResponse.json({ success: true });
      }

      case 'set_group_description': {
        const description = String(payload.description || '').trim();
        const res = await setTelegramGroupDescription(description, payload.chatId);
        if (!res.ok) {
          return NextResponse.json(
            { success: false, error: res.description || 'Could not update group bio.' },
            { status: 400 }
          );
        }
        await recordTelegramActivity({
          kind: 'group_action',
          summary: `Updated group description`,
        });
        return NextResponse.json({ success: true });
      }

      case 'create_invite_link': {
        const res = await createTelegramGroupInviteLink({
          name: payload.name,
          memberLimit: payload.memberLimit ? Number(payload.memberLimit) : undefined,
          chatId: payload.chatId,
        });
        if (!res.ok || !res.result?.invite_link) {
          return NextResponse.json(
            {
              success: false,
              error:
                res.description ||
                'Could not generate invite link. Bot needs Invite permission.',
            },
            { status: 400 }
          );
        }
        await recordTelegramActivity({
          kind: 'group_action',
          summary: `Created invite link: ${res.result.invite_link}`,
        });
        return NextResponse.json({
          success: true,
          inviteLink: res.result.invite_link,
        });
      }

      case 'manage_member': {
        const memberAction = payload.memberAction;
        const userId = Number(payload.userId);
        if (!userId || !memberAction) {
          return NextResponse.json(
            { success: false, error: 'Member user ID and action are required.' },
            { status: 400 }
          );
        }
        const res = await manageTelegramGroupMember({
          action: memberAction,
          userId,
          muteHours: payload.muteHours ? Number(payload.muteHours) : undefined,
          chatId: payload.chatId,
        });
        if (!res.ok) {
          return NextResponse.json(
            {
              success: false,
              error:
                res.description ||
                'Telegram rejected this member change. Make sure the bot is an Admin with member permissions and you cannot restrict the group owner.',
            },
            { status: 400 }
          );
        }
        await recordTelegramActivity({
          kind: 'group_action',
          summary: `Member ${userId}: ${memberAction}`,
        });
        return NextResponse.json({ success: true });
      }

      case 'send_email': {
        const recipients = Array.isArray(payload.recipients)
          ? payload.recipients.map((e: unknown) => String(e).trim()).filter(Boolean)
          : [];
        const subject = String(payload.subject || '').trim();
        const emailBody = String(payload.body || '').trim();
        if (recipients.length === 0 || !subject || !emailBody) {
          return NextResponse.json(
            {
              success: false,
              error: 'Recipients, subject, and message body are required.',
            },
            { status: 400 }
          );
        }
        const dispatch = await sendCustomBrandEmails({
          recipients,
          subject,
          heading: payload.heading,
          body: emailBody,
          ctaLabel: payload.ctaLabel,
          ctaUrl: payload.ctaUrl,
        });
        await recordTelegramActivity({
          kind: 'email',
          summary: `Emailed ${dispatch.sent}/${dispatch.total} contact(s): "${subject}"`,
        });
        return NextResponse.json({ success: true, dispatch });
      }

      case 'add_subscriber': {
        const email = String(payload.email || '').trim().toLowerCase();
        const source = String(payload.source || 'admin_bot_studio').trim();
        if (!email.includes('@')) {
          return NextResponse.json(
            { success: false, error: 'Valid email is required.' },
            { status: 400 }
          );
        }
        const saved = await saveSubscriber(email, source, {
          name: payload.name,
          tags: [source],
        });
        await recordTelegramActivity({
          kind: 'store_action',
          summary: `Added ${email} to ${source.replace(/_/g, ' ')}`,
        });
        return NextResponse.json({ success: true, result: saved });
      }

      case 'remove_subscriber': {
        const email = String(payload.email || '').trim().toLowerCase();
        if (!email.includes('@')) {
          return NextResponse.json(
            { success: false, error: 'Valid email is required.' },
            { status: 400 }
          );
        }
        const removed = await deleteSubscriber(email);
        await recordTelegramActivity({
          kind: 'store_action',
          summary: `Removed ${email} from subscribers`,
        });
        return NextResponse.json({ success: true, removed });
      }

      case 'toggle_product_restocking': {
        const query = String(payload.slugOrName || '').toLowerCase();
        const allProducts = await getAllAdminProductsAsync();
        const target = allProducts.find(
          (p) =>
            p.slug.toLowerCase().includes(query) ||
            p.name.toLowerCase().includes(query)
        );
        if (!target) {
          return NextResponse.json(
            { success: false, error: `Could not find a style matching "${query}".` },
            { status: 404 }
          );
        }
        const updated = await toggleProductRestocking(
          target.slug,
          Boolean(payload.restocking)
        );
        await recordTelegramActivity({
          kind: 'store_action',
          summary: `${target.name} marked ${payload.restocking ? 'Restocking Soon' : 'Open'}`,
        });
        return NextResponse.json({ success: true, product: updated });
      }

      case 'check_orders_summary': {
        const [orders, subs] = await Promise.all([
          getAllOrders(),
          getAllSubscribersAsync(),
        ]);
        const active = orders.filter((o) => o.status !== 'cancelled');
        const revenue = active.reduce((s, o) => s + o.total, 0);
        const pending = active.filter((o) =>
          ['paid', 'sourcing', 'processing', 'out for delivery', 'shipped'].includes(
            o.status
          )
        ).length;
        const summaryText =
          `<b>NOVEQ Live Studio Summary</b>\n` +
          `• Orders: <b>${active.length}</b> (${pending} in progress)\n` +
          `• Total Sales: <b>₦${revenue.toLocaleString()}</b>\n` +
          `• Waitlist &amp; Email Contacts: <b>${subs.length}</b>\n` +
          `• Newest: ${
            active[0]
              ? `<code>${escapeHtml(active[0].id)}</code> (${escapeHtml(active[0].customer.fullName)})`
              : 'None yet'
          }`;
        const res = await sendTelegramGroupMessage({ text: summaryText });
        if (!res.ok) {
          return NextResponse.json(
            { success: false, error: res.description || 'Could not post summary.' },
            { status: 400 }
          );
        }
        await recordTelegramActivity({
          kind: 'message',
          summary: 'Posted live NOVEQ studio summary to group',
          messageId: res.result?.message_id,
        });
        return NextResponse.json({ success: true, result: res.result });
      }

      case 'connect_webhook': {
        const siteBase = (
          payload.baseUrl ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          'https://www.noveq.com.ng'
        )
          .trim()
          .replace(/\/$/, '');
        const webhookUrl = `${siteBase}/api/telegram/webhook`;
        const [whRes, cmdRes] = await Promise.all([
          setTelegramWebhook(webhookUrl),
          registerTelegramBotCommands(),
        ]);
        if (!whRes.ok) {
          return NextResponse.json(
            {
              success: false,
              error:
                whRes.description ||
                'Telegram rejected webhook URL (note: Telegram requires an HTTPS public URL such as https://www.noveq.com.ng).',
            },
            { status: 400 }
          );
        }
        await recordTelegramActivity({
          kind: 'webhook',
          summary: `Connected two-way chat webhook (${webhookUrl}) & commands`,
        });
        return NextResponse.json({
          success: true,
          webhookUrl,
          commandsRegistered: cmdRes.ok,
        });
      }

      case 'disconnect_webhook': {
        const res = await removeTelegramWebhook();
        await recordTelegramActivity({
          kind: 'webhook',
          summary: 'Disconnected two-way Telegram webhook',
        });
        return NextResponse.json({ success: res.ok });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown bot action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Bot action failed unexpectedly.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
