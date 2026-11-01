import React from 'react';
import { Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { PageRoute } from './Navbar';
import { useApi } from '../context/ApiContext';

interface AuctionCtaBannerProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  onNavigate: (page: PageRoute, customUrl?: string) => void;
  className?: string;
}

export const AuctionCtaBanner: React.FC<AuctionCtaBannerProps> = ({
  title = 'Ready to participate in an upcoming bank auction?',
  subtitle = 'Speak directly with our senior associates for pre-bid title searches, inspection appointments, and tender submission guidance.',
  onNavigate,
  className = '',
}) => {
  const { settings } = useApi();
  return (
    <section className={`w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 ${className}`}>
      <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-xl group bg-[#0d1b26]">
        {/* Lazy-loaded Architectural Background Image */}
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=75"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
        />

        {/* Sophisticated Multi-layered Dark Overlay for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b26]/95 via-[#142533]/90 to-[#0d1b26]/95 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b26] via-transparent to-[#0d1b26]/60 pointer-events-none" />

        {/* Ambient Golden Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#D89B30]/15 blur-2xl pointer-events-none" />

        {/* Inner Content - Compact Height */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 text-center space-y-4 max-w-3xl mx-auto">
          {/* Heading */}
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white leading-snug">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a
              href={`tel:${settings.primary_phone}`}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#142533]" />
              <span>Primary Desk: {settings.primary_phone}</span>
            </a>

            <a
              href={`https://wa.me/${(settings.whatsapp_number || settings.primary_phone || '919899897647').replace(/[^0-9]/g, '')}?text=Hello%2C%20I%20am%20interested%20in%20upcoming%20bank%20auctions.`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Mandate Desk</span>
            </a>

            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('contact', '/contact');
              }}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all backdrop-blur-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Submit an Inquiry</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
