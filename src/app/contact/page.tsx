import { Metadata } from 'next';
import { Mail, MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { WhatsAppLink } from '@/components/Analytics/WhatsAppLink';
import { InstagramLink } from '@/components/Analytics/InstagramLink';

export const metadata: Metadata = {
  title: 'Contact Support — Sizing, Inquiries & Dispatch',
  description:
    'Direct inquiries, sizing assistance, and Drop 001 dispatch updates from the NOVEQ team.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Support | NOVEQ Contemporary Leather Footwear',
    description:
      'Direct inquiries, sizing assistance, and Drop 001 dispatch updates from the NOVEQ team.',
    url: '/contact',
    siteName: 'NOVEQ',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Support | NOVEQ',
    description:
      'Direct inquiries, sizing assistance, and Drop 001 dispatch updates from the NOVEQ team.',
  },
};

export default function ContactPage() {
  const { supportContact, socialLinks } = SITE_SETTINGS;

  const whatsAppHref = `https://wa.me/${supportContact.phone}?text=${encodeURIComponent(
    supportContact.supportPrompt || supportContact.conciergePrompt || 'Hello NOVEQ team'
  )}`;

  return (
    <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pb-8 border-b border-cocoa/20">
        <span className="text-xs uppercase tracking-[0.2em] text-cocoa block mb-2 font-medium">
          Customer Care
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink-black">
          Contact Support
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-taupe leading-relaxed">
          For sizing guidance, Drop 001 reservations, or leather care recommendations, reach our team directly.
        </p>
      </div>

      {/* Primary Channels (Derived from SITE_SETTINGS single source of truth) */}
      <div className="pt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WhatsApp Channel */}
        <div className="p-6 bg-warm-white border border-cocoa/20 rounded-xs flex flex-col justify-between">
          <div>
            <MessageCircle className="w-5 h-5 text-espresso mb-3" />
            <h2 className="text-sm font-bold text-ink-black uppercase tracking-wider mb-1">
              WhatsApp Support
            </h2>
            <p className="text-xs text-muted-taupe mb-4 leading-relaxed">
              Direct chat for sizing consultations, leather close-ups, and dispatch tracking.
            </p>
          </div>
          <div>
            <WhatsAppLink
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              placement="contact_page"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cocoa hover:text-ink-black underline underline-offset-4 focus-dark"
            >
              <span>Message on WhatsApp</span>
            </WhatsAppLink>
          </div>
        </div>

        {/* Email Channel */}
        <div className="p-6 bg-warm-white border border-cocoa/20 rounded-xs flex flex-col justify-between">
          <div>
            <Mail className="w-5 h-5 text-espresso mb-3" />
            <h2 className="text-sm font-bold text-ink-black uppercase tracking-wider mb-1">
              Direct Email
            </h2>
            <p className="text-xs text-muted-taupe mb-4 leading-relaxed">
              Written inquiries, order changes, and formal press requests.
            </p>
          </div>
          <div>
            <a
              href={`mailto:${supportContact.email}`}
              className="text-xs font-semibold text-espresso hover:underline focus-dark block truncate"
            >
              {supportContact.email}
            </a>
          </div>
        </div>

        {/* Instagram Channel */}
        <div className="p-6 bg-warm-white border border-cocoa/20 rounded-xs flex flex-col justify-between">
          <div>
            <InstagramIcon className="w-5 h-5 text-espresso mb-3" />
            <h2 className="text-sm font-bold text-ink-black uppercase tracking-wider mb-1">
              Community & Visuals
            </h2>
            <p className="text-xs text-muted-taupe mb-4 leading-relaxed">
              Campaign previews, behind-the-scenes craft stories, and drop announcements.
            </p>
          </div>
          <div>
            <InstagramLink
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              placement="contact_page"
              className="text-xs font-semibold text-espresso hover:underline focus-dark"
            >
              {socialLinks.instagramHandle}
            </InstagramLink>
          </div>
        </div>
      </div>

      {/* Operating Hours & Dispatch Notice */}
      <div className="mt-8 p-6 bg-bone border border-cocoa/25 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-ink-black/85">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-cocoa shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-[11px] text-cocoa mb-0.5">
              Operating Hours
            </span>
            <span>{supportContact.operatingHours}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-taupe text-[11px]">
          <ShieldCheck className="w-4 h-4 text-cocoa" />
          <span>Responses typically provided within 2 business hours.</span>
        </div>
      </div>

      {/* Architectural Client Decision Callout */}
      {supportContact.isPendingClientConfirmation && (
        <div className="mt-8 p-4 bg-warm-white border border-dashed border-cocoa/40 rounded-xs text-xs text-muted-taupe space-y-1">
          <span className="font-semibold text-cocoa uppercase tracking-wider text-[10px] block">
            System Note // Client Support Decision
          </span>
          <p>
            The final customer communication channel (WhatsApp-first vs. Email-first vs. Hybrid Phone) is configured globally in <code className="font-mono text-ink-black">src/config/siteSettings.ts</code>. Modifying this single record updates this Contact page, the post-purchase notification dispatcher, and the order confirmation screen.
          </p>
        </div>
      )}
    </div>
  );
}
