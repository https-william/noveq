export type ParsedBotCommand =
  | {
      type: 'send_message';
      summary: string;
      payload: { text: string; pinImmediately?: boolean };
    }
  | {
      type: 'send_poll';
      summary: string;
      payload: { question: string; options: string[]; isAnonymous: boolean };
    }
  | {
      type: 'send_email';
      summary: string;
      payload: {
        recipients: string[];
        subject: string;
        body: string;
      };
    }
  | {
      type: 'add_subscriber';
      summary: string;
      payload: { email: string; source: string };
    }
  | {
      type: 'remove_subscriber';
      summary: string;
      payload: { email: string };
    }
  | {
      type: 'pin_message';
      summary: string;
      payload: { messageId: number };
    }
  | {
      type: 'delete_message';
      summary: string;
      payload: { messageId: number };
    }
  | {
      type: 'create_invite_link';
      summary: string;
      payload: { name?: string };
    }
  | {
      type: 'set_group_title';
      summary: string;
      payload: { title: string };
    }
  | {
      type: 'toggle_product_restocking';
      summary: string;
      payload: { slugOrName: string; restocking: boolean };
    }
  | {
      type: 'check_orders_summary';
      summary: string;
      payload: Record<string, never>;
    }
  | {
      type: 'unknown';
      summary: string;
      hint: string;
    };

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Interprets plain-English founder instructions typed in Bot Studio
 * into clear, confirmable actions without fragile AI guessing.
 */
export function parsePlainEnglishBotCommand(rawInput: string): ParsedBotCommand {
  const input = rawInput.trim();
  const lower = input.toLowerCase();

  if (!input) {
    return {
      type: 'unknown',
      summary: 'Type what you want the bot to do.',
      hint: 'Try: "Tell the group orders ship at 3pm" or "Create a poll: Lunch? Options: Jollof, Pasta, Shawarma".',
    };
  }

  // 1. Add / Remove subscriber or waitlist contact
  const foundEmails = Array.from(new Set(input.match(EMAIL_RE) || []));
  if (
    foundEmails.length > 0 &&
    (/\b(add|subscribe|waitlist|register|save)\b/.test(lower) && !/\bemail\s+.*\s+(saying|about|subject|:)\b/.test(lower))
  ) {
    let source = 'admin_bot_studio';
    if (lower.includes('nov 27') || lower.includes('black friday')) {
      source = 'black_friday_2026';
    } else if (lower.includes('twist')) {
      source = 'restock_the-twist-slide-pam';
    } else if (lower.includes('ring')) {
      source = 'restock_the-ring-slide-pam';
    }
    return {
      type: 'add_subscriber',
      summary: `Add ${foundEmails[0]} to ${source.replace(/_/g, ' ')}`,
      payload: { email: foundEmails[0], source },
    };
  }

  if (
    foundEmails.length > 0 &&
    /\b(remove|delete|unsubscribe)\b/.test(lower)
  ) {
    return {
      type: 'remove_subscriber',
      summary: `Remove ${foundEmails[0]} from subscribers & waitlists`,
      payload: { email: foundEmails[0] },
    };
  }

  // 2. Send Email to specific address(es)
  if (
    foundEmails.length > 0 &&
    /\b(email|mail|send email|write)\b/.test(lower)
  ) {
    const subjectMatch = input.match(/subject\s*:\s*([^|\n]+?)(?=\s+(?:saying|body|message|:)|$)/i);
    const bodyMatch = input.match(/(?:saying|message|body|note|about)\s*[:,-]?\s*([\s\S]+)$/i);
    const subject = subjectMatch?.[1]?.trim() || 'A quick note from NOVEQ';
    const body =
      bodyMatch?.[1]?.trim() ||
      input.replace(EMAIL_RE, '').replace(/\b(send|an|email|mail|to)\b/gi, '').trim() ||
      'Checking in from the NOVEQ studio in Lagos.';
    return {
      type: 'send_email',
      summary: `Email ${foundEmails.join(', ')} · Subject: "${subject}"`,
      payload: { recipients: foundEmails, subject, body },
    };
  }

  // 3. Create Poll
  if (/\b(poll|vote)\b/.test(lower)) {
    // Support: "Poll: Question | Opt1 | Opt2" OR "Create a poll: Question Options: A, B, C"
    if (input.includes('|')) {
      const parts = input
        .replace(/^(create\s+a\s+poll|poll|vote)\s*[:\-]?\s*/i, '')
        .split('|')
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length >= 3) {
        return {
          type: 'send_poll',
          summary: `Post group poll "${parts[0]}" (${parts.length - 1} choices)`,
          payload: {
            question: parts[0],
            options: parts.slice(1, 11),
            isAnonymous: lower.includes('anonymous'),
          },
        };
      }
    }

    const optSplit = input.split(/\boptions\s*[:\-]\s*/i);
    if (optSplit.length === 2) {
      const q = optSplit[0]
        .replace(/^(create\s+a\s+poll|start\s+a\s+vote|poll|vote)\s*[:\-]?\s*/i, '')
        .trim();
      const opts = optSplit[1]
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (q && opts.length >= 2) {
        return {
          type: 'send_poll',
          summary: `Post group poll "${q}" (${opts.length} choices)`,
          payload: {
            question: q,
            options: opts.slice(0, 10),
            isAnonymous: lower.includes('anonymous'),
          },
        };
      }
    }
  }

  // 4. Invite link (for adding people to group)
  if (
    /\b(invite|add\s+(?:someone|member|person|friend)|join\s+link)\b/.test(lower)
  ) {
    return {
      type: 'create_invite_link',
      summary: 'Generate a fresh group invite link to add someone to noveqthebrand',
      payload: { name: 'NOVEQ Invite' },
    };
  }

  // 5. Pin or Delete message by ID
  const idMatch = input.match(/\b(\d{1,8})\b/);
  if (/\bpin\b/.test(lower) && idMatch) {
    return {
      type: 'pin_message',
      summary: `Pin group message #${idMatch[1]}`,
      payload: { messageId: Number(idMatch[1]) },
    };
  }
  if (/\b(delete|remove)\s+(?:message|msg)\b/.test(lower) && idMatch) {
    return {
      type: 'delete_message',
      summary: `Delete bot message #${idMatch[1]}`,
      payload: { messageId: Number(idMatch[1]) },
    };
  }

  // 6. Rename Group Title
  const renameMatch = input.match(
    /(?:rename|change)\s+(?:the\s+)?group(?:\s+name|\s+title)?\s+(?:to|as)\s+["']?(.+?)["']?$/i
  );
  if (renameMatch?.[1]) {
    return {
      type: 'set_group_title',
      summary: `Rename group title to "${renameMatch[1].trim()}"`,
      payload: { title: renameMatch[1].trim() },
    };
  }

  // 7. Toggle Product Open / Restocking
  if (/\b(restocking|open\s+orders?|mark\s+.*\s+open|pause)\b/.test(lower)) {
    const restocking = /\b(restocking|pause|close)\b/.test(lower);
    let slugOrName = 'the-twist-slide-pam';
    if (lower.includes('ring')) slugOrName = 'the-ring-slide-pam';
    else if (lower.includes('weave')) slugOrName = 'the-weave-slide-pam';
    return {
      type: 'toggle_product_restocking',
      summary: `Set ${slugOrName.replace(/-/g, ' ')} to ${restocking ? 'Restocking Soon' : 'Open for Orders'}`,
      payload: { slugOrName, restocking },
    };
  }

  // 8. Check orders / store telemetry
  if (/\b(orders?|sales|revenue|stats|summary|how many)\b/.test(lower) && !/\b(tell|say|announce|group)\b/.test(lower)) {
    return {
      type: 'check_orders_summary',
      summary: 'Post a live NOVEQ orders & revenue summary into the group chat',
      payload: {},
    };
  }

  // 9. Send Message / Announcement to the group (default conversational catch)
  const cleanedMessage = input
    .replace(
      /^(?:tell\s+(?:the\s+)?group(?:\s+that)?|send\s+(?:a\s+)?(?:message|text)(?:\s+to\s+(?:the\s+)?group)?(?:\s+saying)?|say(?:\s+in\s+(?:the\s+)?group)?|announce(?:\s+that)?|post(?:\s+in\s+group)?)\s*[:,-]?\s*/i,
      ''
    )
    .replace(/^["']|["']$/g, '')
    .trim();

  if (cleanedMessage) {
    const pinImmediately = /\band\s+pin\b/i.test(input);
    return {
      type: 'send_message',
      summary: `Send message to noveqthebrand${pinImmediately ? ' & pin' : ''}`,
      payload: {
        text: cleanedMessage.replace(/\band\s+pin\b/gi, '').trim(),
        pinImmediately,
      },
    };
  }

  return {
    type: 'unknown',
    summary: 'Could not read that command clearly.',
    hint: 'Try starting with "Tell the group...", "Poll: Question | Option A | Option B", "Email person@gmail.com saying ...", or "Add person@gmail.com to waitlist".',
  };
}
