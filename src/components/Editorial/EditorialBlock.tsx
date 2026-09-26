import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export interface EditorialBlockProps {
  id?: string;
  eyebrow?: string;
  heading: string;
  body: string[] | React.ReactNode;
  accentQuote?: string;
  image?: {
    src: string;
    alt: string;
    aspectRatio?: '4/3' | '16/9' | '1/1' | '3/4';
    caption?: string;
  };
  imagePosition?: 'left' | 'right';
  cta?: {
    text: string;
    href: string;
    variant?: 'button' | 'underline';
  };
  className?: string;
}

export function EditorialBlock({
  id,
  eyebrow,
  heading,
  body,
  accentQuote,
  image,
  imagePosition = 'right',
  cta,
  className = '',
}: EditorialBlockProps) {
  const isImageLeft = imagePosition === 'left';

  const aspectClass =
    image?.aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : image?.aspectRatio === '1/1'
      ? 'aspect-square'
      : image?.aspectRatio === '3/4'
      ? 'aspect-[3/4]'
      : 'aspect-[4/3]';

  return (
    <ScrollReveal className={className}>
      <article
        id={id}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
      >
      {/* Visual Column */}
      {image && (
        <div
          className={`lg:col-span-6 w-full ${
            isImageLeft ? 'order-1' : 'order-1 lg:order-2'
          }`}
        >
          <figure className="space-y-2">
            <div
              className={`relative ${aspectClass} w-full bg-espresso/30 border border-cocoa/20 rounded-xs overflow-hidden shadow-md group`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={
                  image.src.endsWith('.svg')
                    ? 'object-contain p-6 sm:p-8'
                    : 'object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                }
              />
            </div>
            {image.caption && (
              <figcaption className="text-[11px] uppercase tracking-wider text-muted-taupe px-1">
                {image.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}

      {/* Copy Column */}
      <div
        className={`${
          image ? 'lg:col-span-6' : 'lg:col-span-10 lg:col-start-2'
        } space-y-6 ${
          isImageLeft ? 'order-2' : 'order-2 lg:order-1'
        }`}
      >
        {eyebrow && (
          <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
            {eyebrow}
          </span>
        )}

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-black leading-tight">
          {heading}
        </h2>

        {accentQuote && (
          <blockquote className="border-l-2 border-cocoa/40 pl-4 py-1">
            <p className="font-serif text-xl sm:text-2xl text-espresso italic font-normal leading-snug">
              “{accentQuote}”
            </p>
          </blockquote>
        )}

        {Array.isArray(body) ? (
          <div className="space-y-4 text-sm sm:text-base text-ink-black/85 leading-relaxed font-normal">
            {body.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="text-sm sm:text-base text-ink-black/85 leading-relaxed font-normal">
            {body}
          </div>
        )}

        {cta && (
          <div className="pt-2">
            {cta.variant === 'button' ? (
              <Link
                href={cta.href}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px]"
              >
                <span>{cta.text}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={cta.href}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-espresso hover:text-ink-black underline underline-offset-4 focus-dark min-h-[44px]"
              >
                <span>{cta.text}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
    </ScrollReveal>
  );
}
