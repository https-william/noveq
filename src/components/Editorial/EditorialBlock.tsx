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
      ? 'aspect-[4/3] sm:aspect-[3/4]'
      : 'aspect-[4/3]';

  return (
    <ScrollReveal className={className}>
      <article
        id={id}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center"
      >
        {/* Visual Column */}
        {image && (
          <div
            className={`lg:col-span-6 w-full ${
              isImageLeft ? 'order-1' : 'order-1 lg:order-2'
            }`}
          >
            <figure className="space-y-2.5">
              <div
                className={`relative ${aspectClass} w-full bg-bone border border-cocoa/20 rounded-2xl overflow-hidden shadow-apple-md group`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={
                    image.src.endsWith('.svg')
                      ? 'object-contain p-6 sm:p-8'
                      : 'object-cover hover-image-zoom'
                  }
                />
              </div>
              {image.caption && (
                <figcaption className="text-[11px] uppercase tracking-[0.14em] text-muted-taupe px-1 leading-relaxed">
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
          } space-y-4 sm:space-y-5 ${
            isImageLeft ? 'order-2' : 'order-2 lg:order-1'
          }`}
        >
          {eyebrow && (
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
              {eyebrow}
            </span>
          )}

          <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-normal tracking-[-0.015em] text-ink-black leading-[1.15] text-balance">
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
            <div className="space-y-3.5 text-[15px] sm:text-base text-ink-black/85 leading-[1.68] font-normal text-pretty">
              {body.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="text-[15px] sm:text-base text-ink-black/85 leading-[1.68] font-normal text-pretty">
              {body}
            </div>
          )}

          {cta && (
            <div className="pt-2">
              {cta.variant === 'button' ? (
                <Link
                  href={cta.href}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-[background-color,transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full focus-dark min-h-[46px] shadow-apple-sm hover:shadow-apple-md active:scale-[0.98]"
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
