import { Order } from '@/types/commerce';

const DEFAULT_BOT_TOKEN = '8764223051:AAGuANrd324aIoKLh8cosQXu_UWBc5zWgDk';
const DEFAULT_CHAT_ID = '-5565319867';
const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1ZLbOPcCztTgtxmKmWLW_BB_utKxS7-DpePflxXerA1I/edit?gid=79417387#gid=79417387';

export function getTelegramBotConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  const rawChatIds =
    process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID;
  const chatIds = rawChatIds
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const primaryChatId = chatIds[0] || DEFAULT_CHAT_ID;
  const webhookSecret =
    process.env.TELEGRAM_WEBHOOK_SECRET ||
    `noveq_wh_${token.slice(-14).replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return { token, chatIds, primaryChatId, webhookSecret };
}

export async function callTelegramApi<T = unknown>(
  method: string,
  payload?: Record<string, unknown>
): Promise<{ ok: boolean; result?: T; description?: string; error_code?: number }> {
  const { token } = getTelegramBotConfig();
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  return res.json();
}

export interface TelegramChatAdmin {
  user: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  status: 'creator' | 'administrator';
  can_pin_messages?: boolean;
  can_delete_messages?: boolean;
  can_restrict_members?: boolean;
  can_promote_members?: boolean;
  can_invite_users?: boolean;
  can_change_info?: boolean;
}

export interface BotStudioOverview {
  bot: {
    id?: number;
    firstName: string;
    username: string;
    canJoinGroups?: boolean;
  };
  group: {
    id: string;
    title: string;
    type: string;
    description?: string;
    memberCount: number;
    isBotAdmin: boolean;
    permissions: {
      canSendMessages: boolean;
      canSendPolls: boolean;
      canPinMessages: boolean;
      canDeleteMessages: boolean;
      canRestrictMembers: boolean;
      canPromoteMembers: boolean;
      canInviteUsers: boolean;
      canChangeInfo: boolean;
    };
  };
  admins: TelegramChatAdmin[];
  webhook: {
    url: string;
    pendingUpdateCount: number;
    lastErrorMessage?: string;
  };
}

export async function getBotStudioOverview(
  chatIdOverride?: string
): Promise<BotStudioOverview> {
  const { primaryChatId } = getTelegramBotConfig();
  const chatId = chatIdOverride || primaryChatId;

  const [meRes, webhookRes, chatRes, countRes, adminsRes] = await Promise.all([
    callTelegramApi<{ id: number; first_name: string; username: string; can_join_groups?: boolean }>('getMe'),
    callTelegramApi<{ url: string; pending_update_count: number; last_error_message?: string }>('getWebhookInfo'),
    callTelegramApi<{ id: number; title?: string; type: string; description?: string; permissions?: Record<string, boolean> }>('getChat', { chat_id: chatId }),
    callTelegramApi<number>('getChatMemberCount', { chat_id: chatId }),
    callTelegramApi<TelegramChatAdmin[]>('getChatAdministrators', { chat_id: chatId }),
  ]);

  const botId = meRes.result?.id;
  const admins = Array.isArray(adminsRes.result) ? adminsRes.result : [];
  const botAdminEntry = admins.find((a) => a.user?.id === botId);
  const memberPerms = chatRes.result?.permissions || {};

  const isBotAdmin = Boolean(botAdminEntry);

  return {
    bot: {
      id: botId,
      firstName: meRes.result?.first_name || 'NOVEQ.the.bot',
      username: meRes.result?.username || 'noveq_orders_bot',
      canJoinGroups: meRes.result?.can_join_groups,
    },
    group: {
      id: chatId,
      title: chatRes.result?.title || 'noveqthebrand',
      type: chatRes.result?.type || 'group',
      description: chatRes.result?.description,
      memberCount: typeof countRes.result === 'number' ? countRes.result : 0,
      isBotAdmin,
      permissions: {
        canSendMessages: memberPerms.can_send_messages ?? true,
        canSendPolls: memberPerms.can_send_polls ?? true,
        canPinMessages: isBotAdmin
          ? Boolean(botAdminEntry?.can_pin_messages ?? true)
          : Boolean(memberPerms.can_pin_messages),
        canDeleteMessages: isBotAdmin
          ? Boolean(botAdminEntry?.can_delete_messages ?? false)
          : false,
        canRestrictMembers: isBotAdmin
          ? Boolean(botAdminEntry?.can_restrict_members ?? false)
          : false,
        canPromoteMembers: isBotAdmin
          ? Boolean(botAdminEntry?.can_promote_members ?? false)
          : false,
        canInviteUsers: isBotAdmin
          ? Boolean(botAdminEntry?.can_invite_users ?? true)
          : Boolean(memberPerms.can_invite_users),
        canChangeInfo: isBotAdmin
          ? Boolean(botAdminEntry?.can_change_info ?? true)
          : Boolean(memberPerms.can_change_info),
      },
    },
    admins,
    webhook: {
      url: webhookRes.result?.url || '',
      pendingUpdateCount: webhookRes.result?.pending_update_count || 0,
      lastErrorMessage: webhookRes.result?.last_error_message,
    },
  };
}

export async function sendTelegramGroupMessage(params: {
  text: string;
  chatId?: string;
  replyToMessageId?: number;
  pinImmediately?: boolean;
  silent?: boolean;
}) {
  const { primaryChatId } = getTelegramBotConfig();
  const chatId = params.chatId || primaryChatId;
  const res = await callTelegramApi<{ message_id: number }>('sendMessage', {
    chat_id: chatId,
    text: params.text,
    parse_mode: 'HTML',
    disable_notification: Boolean(params.silent),
    ...(params.replyToMessageId
      ? { reply_to_message_id: params.replyToMessageId }
      : {}),
  });

  if (res.ok && res.result?.message_id && params.pinImmediately) {
    await callTelegramApi('pinChatMessage', {
      chat_id: chatId,
      message_id: res.result.message_id,
      disable_notification: Boolean(params.silent),
    });
  }

  return res;
}

export async function sendTelegramGroupPhoto(params: {
  photoUrl: string;
  caption?: string;
  chatId?: string;
  pinImmediately?: boolean;
}) {
  const { primaryChatId } = getTelegramBotConfig();
  const chatId = params.chatId || primaryChatId;
  const res = await callTelegramApi<{ message_id: number }>('sendPhoto', {
    chat_id: chatId,
    photo: params.photoUrl,
    ...(params.caption ? { caption: params.caption, parse_mode: 'HTML' } : {}),
  });

  if (res.ok && res.result?.message_id && params.pinImmediately) {
    await callTelegramApi('pinChatMessage', {
      chat_id: chatId,
      message_id: res.result.message_id,
    });
  }

  return res;
}

export async function sendTelegramGroupPoll(params: {
  question: string;
  options: string[];
  isAnonymous?: boolean;
  allowsMultipleAnswers?: boolean;
  pinImmediately?: boolean;
  chatId?: string;
}) {
  const { primaryChatId } = getTelegramBotConfig();
  const chatId = params.chatId || primaryChatId;
  const res = await callTelegramApi<{ message_id: number; poll?: { id: string } }>(
    'sendPoll',
    {
      chat_id: chatId,
      question: params.question.slice(0, 300),
      options: params.options.slice(0, 10).map((opt) => ({
        text: opt.slice(0, 100),
      })),
      is_anonymous: Boolean(params.isAnonymous),
      allows_multiple_answers: Boolean(params.allowsMultipleAnswers),
    }
  );

  if (res.ok && res.result?.message_id && params.pinImmediately) {
    await callTelegramApi('pinChatMessage', {
      chat_id: chatId,
      message_id: res.result.message_id,
    });
  }

  return res;
}

export async function stopTelegramGroupPoll(params: {
  messageId: number;
  chatId?: string;
}) {
  const { primaryChatId } = getTelegramBotConfig();
  return callTelegramApi('stopPoll', {
    chat_id: params.chatId || primaryChatId,
    message_id: params.messageId,
  });
}

export async function editTelegramGroupMessage(params: {
  messageId: number;
  text: string;
  chatId?: string;
}) {
  const { primaryChatId } = getTelegramBotConfig();
  return callTelegramApi('editMessageText', {
    chat_id: params.chatId || primaryChatId,
    message_id: params.messageId,
    text: params.text,
    parse_mode: 'HTML',
  });
}

export async function deleteTelegramGroupMessage(params: {
  messageId: number;
  chatId?: string;
}) {
  const { primaryChatId } = getTelegramBotConfig();
  return callTelegramApi('deleteMessage', {
    chat_id: params.chatId || primaryChatId,
    message_id: params.messageId,
  });
}

export async function pinTelegramGroupMessage(params: {
  messageId: number;
  silent?: boolean;
  chatId?: string;
}) {
  const { primaryChatId } = getTelegramBotConfig();
  return callTelegramApi('pinChatMessage', {
    chat_id: params.chatId || primaryChatId,
    message_id: params.messageId,
    disable_notification: Boolean(params.silent),
  });
}

export async function unpinTelegramGroupMessage(params: {
  messageId?: number;
  chatId?: string;
}) {
  const { primaryChatId } = getTelegramBotConfig();
  if (params.messageId) {
    return callTelegramApi('unpinChatMessage', {
      chat_id: params.chatId || primaryChatId,
      message_id: params.messageId,
    });
  }
  return callTelegramApi('unpinAllChatMessages', {
    chat_id: params.chatId || primaryChatId,
  });
}

export async function setTelegramGroupTitle(title: string, chatId?: string) {
  const { primaryChatId } = getTelegramBotConfig();
  return callTelegramApi('setChatTitle', {
    chat_id: chatId || primaryChatId,
    title: title.slice(0, 128),
  });
}

export async function setTelegramGroupDescription(
  description: string,
  chatId?: string
) {
  const { primaryChatId } = getTelegramBotConfig();
  return callTelegramApi('setChatDescription', {
    chat_id: chatId || primaryChatId,
    description: description.slice(0, 255),
  });
}

export async function createTelegramGroupInviteLink(params?: {
  name?: string;
  memberLimit?: number;
  chatId?: string;
}) {
  const { primaryChatId } = getTelegramBotConfig();
  return callTelegramApi<{ invite_link: string; name?: string }>(
    'createChatInviteLink',
    {
      chat_id: params?.chatId || primaryChatId,
      ...(params?.name ? { name: params.name.slice(0, 32) } : {}),
      ...(params?.memberLimit ? { member_limit: params.memberLimit } : {}),
    }
  );
}

export async function manageTelegramGroupMember(params: {
  action: 'kick' | 'ban' | 'unban' | 'mute' | 'unmute' | 'promote' | 'demote';
  userId: number;
  muteHours?: number;
  chatId?: string;
}) {
  const { primaryChatId } = getTelegramBotConfig();
  const chatId = params.chatId || primaryChatId;

  if (params.action === 'kick') {
    const banned = await callTelegramApi('banChatMember', {
      chat_id: chatId,
      user_id: params.userId,
    });
    if (banned.ok) {
      await callTelegramApi('unbanChatMember', {
        chat_id: chatId,
        user_id: params.userId,
        only_if_banned: true,
      });
    }
    return banned;
  }

  if (params.action === 'ban') {
    return callTelegramApi('banChatMember', {
      chat_id: chatId,
      user_id: params.userId,
    });
  }

  if (params.action === 'unban') {
    return callTelegramApi('unbanChatMember', {
      chat_id: chatId,
      user_id: params.userId,
      only_if_banned: true,
    });
  }

  if (params.action === 'mute' || params.action === 'unmute') {
    const allow = params.action === 'unmute';
    const untilDate =
      !allow && params.muteHours
        ? Math.floor(Date.now() / 1000) + params.muteHours * 3600
        : undefined;
    return callTelegramApi('restrictChatMember', {
      chat_id: chatId,
      user_id: params.userId,
      permissions: {
        can_send_messages: allow,
        can_send_audios: allow,
        can_send_documents: allow,
        can_send_photos: allow,
        can_send_videos: allow,
        can_send_video_notes: allow,
        can_send_voice_notes: allow,
        can_send_polls: allow,
        can_send_other_messages: allow,
        can_add_web_page_previews: allow,
      },
      ...(untilDate ? { until_date: untilDate } : {}),
    });
  }

  const makeAdmin = params.action === 'promote';
  return callTelegramApi('promoteChatMember', {
    chat_id: chatId,
    user_id: params.userId,
    can_manage_chat: makeAdmin,
    can_delete_messages: makeAdmin,
    can_pin_messages: makeAdmin,
    can_invite_users: makeAdmin,
    can_restrict_members: makeAdmin,
    can_change_info: makeAdmin,
  });
}

export async function registerTelegramBotCommands() {
  return callTelegramApi('setMyCommands', {
    commands: [
      { command: 'help', description: 'See all NOVEQ bot commands' },
      { command: 'say', description: 'Make the bot post a message in the group' },
      { command: 'poll', description: 'Start a vote: Question | Opt 1 | Opt 2' },
      { command: 'orders', description: 'Check pending orders and queue' },
      { command: 'stats', description: 'Live revenue, pairs sold, waitlists' },
      { command: 'stock', description: 'Toggle style open or restocking' },
      { command: 'email', description: 'Send a NOVEQ note: addr | subj | msg' },
      { command: 'addsub', description: 'Add an email to subscribers' },
      { command: 'removesub', description: 'Remove an email from subscribers' },
      { command: 'invite', description: 'Create a group invite link' },
      { command: 'pin', description: 'Reply to any message to pin it' },
      { command: 'delete', description: 'Reply to a bot message to remove it' },
    ],
  });
}

export async function setTelegramWebhook(webhookUrl: string) {
  const { webhookSecret } = getTelegramBotConfig();
  return callTelegramApi('setWebhook', {
    url: webhookUrl,
    secret_token: webhookSecret,
    allowed_updates: ['message', 'edited_message', 'poll'],
  });
}

export async function removeTelegramWebhook() {
  return callTelegramApi('deleteWebhook', { drop_pending_updates: false });
}

/**
 * Sends a real-time order alert to Telegram (founders/team).
 * Supports single chat ID, comma-separated chat IDs, or private team groups.
 */
export async function sendTelegramOrderNotification(order: Order): Promise<boolean> {
  const { token, chatIds } = getTelegramBotConfig();

  if (!token || chatIds.length === 0) {
    return false;
  }

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
• <b>Delivery Fee:</b> ₦${order.deliveryFee.toLocaleString()} (Paid Online)
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

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
