import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { BankItem } from '../services/api';
import { Landmark, ExternalLink } from 'lucide-react';

export const BankLogosSection: React.FC = () => {
  const { banks } = useApi();
  const [failedImageIds, setFailedImageIds] = useState<Set<number | string>>(new Set());

  // 1. Filter banks: must have status === true, a valid non-empty logo, and not failed image load
  const validBanks: BankItem[] = (banks || [])
    .filter((b) => b && b.status && b.logo && typeof b.logo === 'string' && b.logo.trim() !== '')
    .filter((b) => !failedImageIds.has(b.id))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  // Requirement: If zero valid banks, hide section completely. Never show empty container/whitespace.
  if (validBanks.length === 0) {
    return null;
  }

  const handleImageError = (id: number | string) => {
    setFailedImageIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Duplicate for smooth seamless infinite continuous marquee scroll
  const scrollLoop = [...validBanks, ...validBanks];

  return (
    <section
      className="w-full bg-white border-y border-slate-200 py-6 sm:py-8 overflow-hidden select-none"
      aria-label="Partner Banks & Financial Institutions"
    >
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 mb-5">
        {/* Section Header - Simplified, clear, customer-friendly words */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF1DE] border border-[#D89B30]/30 flex items-center justify-center text-[#9A6007] shrink-0">
            <Landmark className="w-4 h-4 text-[#D89B30]" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#9A6007] block">
              PARTNER BANKS &amp; FINANCIAL INSTITUTIONS
            </span>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#142533]">
              Empaneled Banks &amp; Statutory Auction Authorities
            </h3>
          </div>
        </div>
      </div>

      {/* Infinite Continuous Scrolling Track */}
      <div className="relative w-full overflow-hidden group">
        {/* Soft edge gradients for seamless look */}
        <div className="absolute left-0 inset-y-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="animate-bank-scroll flex items-center gap-3 sm:gap-4 py-1">
          {scrollLoop.map((bank, index) => {
            const displayName = bank.name
              ? bank.name.replace(/\b\w/g, (char) => char.toUpperCase())
              : 'Empaneled Bank';

            const cardContent = (
              <div className="h-16 sm:h-20 w-36 sm:w-44 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50/90 hover:bg-white border border-slate-200/80 hover:border-[#D89B30]/60 hover:shadow-md transition-all duration-300 flex items-center justify-center group/card relative shrink-0">
                <img
                  src={bank.logo!}
                  alt={`${displayName} Logo`}
                  onError={() => handleImageError(bank.id)}
                  className="max-h-9 sm:max-h-11 max-w-[85%] object-contain transition-transform duration-300 group-hover/card:scale-105"
                  loading="lazy"
                />
                {bank.website_url && (
                  <ExternalLink className="w-3 h-3 text-[#D89B30] absolute top-1.5 right-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                )}
              </div>
            );

            if (bank.website_url) {
              return (
                <a
                  key={`${bank.id}-${index}`}
                  href={bank.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block shrink-0 focus:outline-hidden focus:ring-2 focus:ring-[#D89B30] rounded-xl"
                  title={`Visit official portal of ${displayName}`}
                  aria-label={`Visit official portal of ${displayName}`}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div key={`${bank.id}-${index}`} className="shrink-0" title={displayName}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
