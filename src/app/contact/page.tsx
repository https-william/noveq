import { Metadata } from 'next';
import { Mail, MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { WhatsAppLink } from '@/components/Analytics/WhatsAppLink';
import { InstagramLink } from '@/components/Analytics/InstagramLink';

export const metadata: Metadata = {
  title: 'Contact Support - Sizing, Inquiries & Dispatch',
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
    <div className="py-10 sm:py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pb-8 border-b border-cocoa/20">
        <span className="text-xs uppercase tracking-[0.2em] text-cocoa block mb-2 font-medium">
          Customer Care
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-normal tracking-[-0.015em] text-ink-black">
          Contact Support
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-taupe leading-relaxed">
          For sizing guidance, Drop 001 reservations, or leather care recommendations, reach our team directly.
        </p>
      </div>

      {/* Primary Channels (Derived from SITE_SETTINGS single source of truth) */}
      <div className="pt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* WhatsApp Channel */}
        <div className="p-6 sm:p-8 bg-warm-white border border-cocoa/12 hover:border-cocoa/25 rounded-2xl flex flex-col justify-between transition-[border-color,background-color] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)]">
          <div>
            <div className="w-9 h-9 rounded-full bg-bone border border-cocoa/12 flex items-center justify-center mb-5">
              <MessageCircle className="w-4 h-4 text-espresso" />
            </div>
            <h2 className="font-editorial text-2xl font-normal text-ink-black mb-1.5">
              WhatsApp Studio
            </h2>
            <p className="text-xs text-muted-taupe mb-6 leading-relaxed">
              Direct chat for sizing consultations, leather close-ups, and dispatch tracking.
            </p>
          </div>
          <div>
            <WhatsAppLink
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              placement="contact_page"
              className="press-tactile inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bone hover:bg-ink-black hover:text-warm-white border border-cocoa/15 text-xs font-medium text-ink-black transition-[background-color,color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] focus-dark"
            >
              <span>Message on WhatsApp</span>
            </WhatsAppLink>
          </div>
        </div>

        {/* Email Channel */}
        <div className="p-6 sm:p-8 bg-warm-white border border-cocoa/12 hover:border-cocoa/25 rounded-2xl flex flex-col justify-between transition-[border-color,background-color] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)]">
          <div>
            <div className="w-9 h-9 rounded-full bg-bone border border-cocoa/12 flex items-center justify-center mb-5">
              <Mail className="w-4 h-4 text-espresso" />
            </div>
            <h2 className="font-editorial text-2xl font-normal text-ink-black mb-1.5">
              Direct Email
            </h2>
            <p className="text-xs text-muted-taupe mb-6 leading-relaxed">
              Written inquiries, order updates, and formal press or stockist requests.
            </p>
          </div>
          <div>
            <a
              href={`mailto:${supportContact.email}`}
              className="press-tactile inline-flex items-center px-4 py-2 rounded-full bg-bone hover:bg-ink-black hover:text-warm-white border border-cocoa/15 text-xs font-medium text-ink-black transition-[background-color,color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] focus-dark truncate max-w-full"
            >
              {supportContact.email}
            </a>
          </div>
        </div>

        {/* Instagram Channel */}
        <div className="p-6 sm:p-8 bg-warm-white border border-cocoa/12 hover:border-cocoa/25 rounded-2xl flex flex-col justify-between transition-[border-color,background-color] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)]">
          <div>
            <div className="w-9 h-9 rounded-full bg-bone border border-cocoa/12 flex items-center justify-center mb-5">
              <InstagramIcon className="w-4 h-4 text-espresso" />
            </div>
            <h2 className="font-editorial text-2xl font-normal text-ink-black mb-1.5">
              Community &amp; Visuals
            </h2>
            <p className="text-xs text-muted-taupe mb-6 leading-relaxed">
              Campaign previews, studio craft notes, and Drop 001 release notices.
            </p>
          </div>
          <div>
            <InstagramLink
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              placement="contact_page"
              className="press-tactile inline-flex items-center px-4 py-2 rounded-full bg-bone hover:bg-ink-black hover:text-warm-white border border-cocoa/15 text-xs font-medium text-ink-black transition-[background-color,color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] focus-dark"
            >
              {socialLinks.instagramHandle}
            </InstagramLink>
          </div>
        </div>
      </div>

      {/* Operating Hours & Dispatch Notice */}
      <div className="mt-6 p-5 sm:p-6 bg-warm-white border border-cocoa/12 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-ink-black/85">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-full bg-bone border border-cocoa/12 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-cocoa" />
          </div>
          <div>
            <span className="font-medium block text-[11px] text-cocoa mb-0.5">
              Studio Operating Hours
            </span>
            <span>{supportContact.operatingHours}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-taupe text-[11px]">
          <ShieldCheck className="w-4 h-4 text-cocoa shrink-0" />
          <span>Replies typically sent within 2 business hours.</span>
        </div>
      </div>
    </div>
  );
}
