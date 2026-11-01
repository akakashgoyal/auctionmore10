import React, { useState, useEffect, useRef } from 'react';
import { TESTIMONIALS } from '../data/testimonialsData';
import { useApi } from '../context/ApiContext';
import { ChevronLeft, ChevronRight, Star, Quote, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';

export const TestimonialsSlider: React.FC = () => {
  const { testimonials: apiTestimonials } = useApi();
  const list = apiTestimonials && apiTestimonials.length > 0 ? apiTestimonials : TESTIMONIALS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive card visibility: 1 on mobile, 2 on tablet, 3 on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalItems = list.length;
  const maxIndex = Math.max(0, totalItems - visibleCards);

  // Keep index within bounds if resized
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [visibleCards, maxIndex, currentIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Auto-play interval
  useEffect(() => {
    if (totalItems <= visibleCards || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalItems, visibleCards, isPaused, maxIndex]);

  return (
    <div
      id="testimonials-slider-section"
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Container inspired by Meglux International card architecture */}
      <div className="rounded-3xl bg-white border border-[#E2E8F0] shadow-xl shadow-slate-100/80 p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Subtle Ambient Background Accents */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#D89B30]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-slate-100 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-8 sm:mb-10 pb-6 border-b border-[#F1EFEA] relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF1DE] text-[#9A6007] border border-[#D89B30]/40 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>CLIENT &amp; INVESTOR ENDORSEMENTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#142533] font-serif tracking-tight">
              Verified Feedback from Auction Clients
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium leading-relaxed">
              Direct reviews from high-net-worth individuals, business owners, and corporate funds acquiring distressed
              bank assets across India with our advisory.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-shrink-0">
            <button
              id="testimonial-prev-btn"
              onClick={prevSlide}
              aria-label="Previous Testimonial Card"
              className="w-11 h-11 rounded-full bg-slate-50 hover:bg-[#D89B30] text-slate-700 hover:text-[#142533] border border-slate-200 hover:border-[#D89B30] flex items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-95 group"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              id="testimonial-next-btn"
              onClick={nextSlide}
              aria-label="Next Testimonial Card"
              className="w-11 h-11 rounded-full bg-slate-50 hover:bg-[#D89B30] text-slate-700 hover:text-[#142533] border border-slate-200 hover:border-[#D89B30] flex items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-95 group"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Multi-Card Sliding Track */}
        <div className="relative overflow-hidden relative z-10 py-1">
          <div
            className="flex transition-transform duration-500 ease-out -mx-3"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
            }}
          >
            {list.map((t) => (
              <div
                key={t.id}
                className="px-3 shrink-0 flex"
                style={{ width: `${100 / visibleCards}%` }}
              >
                <div className="w-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#D89B30] shadow-sm hover:shadow-xl transition-all duration-300 group relative">
                  {/* Top Golden Accent Line on Hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D89B30] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

                  {/* Card Body */}
                  <div className="space-y-4">
                    {/* Rating and Verified Pill */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < t.rating ? 'text-[#D89B30] fill-[#D89B30]' : 'text-slate-200'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-800 ml-1.5 font-mono">
                          {t.rating}.0
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Verified Buyer</span>
                      </span>
                    </div>

                    {/* Savings / Realization Highlight */}
                    <div className="bg-[#FAF8F5] border border-[#E5E0D5] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#9A6007]">
                      {t.savingsOrValue}
                    </div>

                    {/* Testimonial Quote */}
                    <blockquote className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic relative min-h-[96px]">
                      <Quote className="w-4 h-4 text-[#D89B30]/40 inline-block mr-1.5 -mt-1 rotate-180 flex-shrink-0" />
                      "{t.quote}"
                    </blockquote>
                  </div>

                  {/* Footer Author & Property Acquired Information */}
                  <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#142533] text-[#D89B30] border-2 border-[#D89B30] shrink-0 shadow-xs flex items-center justify-center font-mono font-bold text-xs">
                        {t.avatarText}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-950 truncate group-hover:text-[#9A6007] transition-colors">
                          {t.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate font-medium">
                          {t.role} · {t.city}
                        </p>
                      </div>
                    </div>

                    {/* Acquired Asset Badge */}
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#9A6007]">
                        <Building2 className="w-3 h-3 text-[#D89B30]" />
                        <span>Asset Acquired:</span>
                      </div>
                      <p className="text-xs font-semibold text-[#142533] line-clamp-1">
                        {t.propertyAcquired}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Authority: <span className="font-medium text-slate-700">{t.bankAuthority}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        {maxIndex > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-8 relative z-10">
            {[...Array(maxIndex + 1)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide group ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'w-7 bg-[#D89B30]'
                    : 'w-2 bg-slate-200 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
