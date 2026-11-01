import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Phone, Mail, MapPin, ArrowRight, Clock, ExternalLink, Globe } from 'lucide-react';
import { PageRoute } from './Navbar';
import { OFFICIAL_DOMAIN, OFFICIAL_SITE_URL } from '../utils/routes';
import { useApi } from '../context/ApiContext';
import { Property } from '../types';

interface FooterProps {
  onNavigate: (page: PageRoute, customUrl?: string) => void;
  onOpenLegal?: (type: 'privacy' | 'terms') => void;
  onSelectProperty?: (property: Property) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal, onSelectProperty }) => {
  const { settings, properties } = useApi();
  const recentProperties: Property[] = (properties || []).slice(0, 4);

  const formatCurrency = (val?: number) => {
    if (!val || val <= 0) return 'Price on Request';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lac`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleNav = (route: PageRoute, href?: string) => {
    onNavigate(route, href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLegalClick = (type: 'privacy' | 'terms') => {
    if (onOpenLegal) {
      onOpenLegal(type);
    } else {
      handleNav(type, `/${type}`);
    }
  };

  const handleHowWeWorkClick = () => {
    onNavigate('home', '/');
    setTimeout(() => {
      const el = document.getElementById('how-we-work');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <footer className="bg-[#142533] text-slate-300 border-t border-white/10">
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 pt-10 sm:pt-12 pb-20 sm:pb-24 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNav('home', '/');
              }}
              className="cursor-pointer inline-block"
              aria-label={`${settings.company_name} Home`}
            >
              <Logo size="md" variant="light" />
            </a>
            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.footer_text || "India's premier distressed asset and bank auction platform. Connecting individual buyers, HNIs, and institutions with verified SARFAESI properties, IBC liquidations, and DRT orders."}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D89B30]">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-medium">{settings.tagline}</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('home', '/');
                  }}
                  className="hover:text-white transition-colors block py-0.5"
                >
                  • Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('about', '/about');
                  }}
                  className="hover:text-white transition-colors block py-0.5"
                >
                  • About Us
                </a>
              </li>
              <li>
                <a
                  href="/properties"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('property', '/properties');
                  }}
                  className="hover:text-white transition-colors block py-0.5"
                >
                  • Auction Properties
                </a>
              </li>
              <li>
                <a
                  href="/authority-properties"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('authority-properties', '/authority-properties');
                  }}
                  className="hover:text-white transition-colors block py-0.5"
                >
                  • Authority Properties
                </a>
              </li>
              <li>
                <a
                  href="/authority-properties/authority"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('authority-wise-properties', '/authority-properties/authority');
                  }}
                  className="hover:text-white transition-colors block py-0.5"
                >
                  • Authority-wise Properties
                </a>
              </li>
              <li>
                <a
                  href="/scrap-auctions"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('scrap-auctions', '/scrap-auctions');
                  }}
                  className="hover:text-white transition-colors block py-0.5"
                >
                  • Scrap Auctions
                </a>
              </li>
              <li>
                <a
                  href="/plant-machinery-auctions"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('plant-machinery-auctions', '/plant-machinery-auctions');
                  }}
                  className="hover:text-white transition-colors block py-0.5"
                >
                  • Plant &amp; Machinery Auctions
                </a>
              </li>
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleHowWeWorkClick();
                  }}
                  className="hover:text-[#D89B30] transition-colors text-left block py-0.5"
                >
                  • How We Work (5-Step Process)
                </a>
              </li>
              <li>
                <a
                  href="/blogs"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('blogs', '/blogs');
                  }}
                  className="hover:text-white transition-colors block py-0.5"
                >
                  • Blogs &amp; Market Insights
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('faq', '/faq');
                  }}
                  className="hover:text-white transition-colors block py-0.5"
                >
                  • Frequently Asked Questions (FAQ)
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('contact', '/contact');
                  }}
                  className="hover:text-white transition-colors block py-0.5"
                >
                  • Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Recent Properties (Replaced Legal & Compliance) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Recent Properties
              </h4>
              <button
                type="button"
                onClick={() => handleNav('property', '/properties')}
                className="text-[11px] font-mono text-[#D89B30] hover:text-amber-300 transition-colors cursor-pointer"
              >
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {recentProperties.map((prop: Property) => (
                <a
                  key={prop.id}
                  href={`/property/${prop.slug || prop.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSelectProperty) {
                      onSelectProperty(prop);
                    } else {
                      handleNav('property-detail', `/property/${prop.slug || prop.id}`);
                    }
                  }}
                  className="group block p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#D89B30]/40 transition-all cursor-pointer"
                >
                  <div className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-1">
                    {prop.title}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3 text-[#D89B30] shrink-0" />
                      <span className="truncate max-w-[100px]">
                        {prop.location?.city || prop.location?.state || 'India'}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-[#D89B30]">
                      {formatCurrency(prop.reservePrice)}
                    </span>
                  </div>
                </a>
              ))}
              {recentProperties.length === 0 && (
                <p className="text-xs text-slate-400">Loading auction properties...</p>
              )}
            </div>
          </div>

          {/* Contact Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Direct Contact Desk
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D89B30] flex-shrink-0" />
                <a href={`tel:${settings.primary_phone}`} className="hover:text-white font-mono">
                  {settings.primary_phone} (Primary)
                </a>
              </div>
              {settings.alternate_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#D89B30] flex-shrink-0" />
                  <a href={`tel:${settings.alternate_phone}`} className="hover:text-white font-mono">
                    {settings.alternate_phone} (Alternate)
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D89B30] flex-shrink-0" />
                <a href={`mailto:${settings.primary_email}`} className="hover:text-white">
                  {settings.primary_email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D89B30] flex-shrink-0" />
                <a
                  href={OFFICIAL_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white font-mono"
                >
                  {OFFICIAL_DOMAIN}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D89B30] flex-shrink-0 mt-0.5" />
                <a
                  href={settings.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.primary_address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors group flex items-center gap-1 leading-snug"
                  title="Open location in Google Maps"
                >
                  <span>{settings.primary_address}</span>
                  <ExternalLink className="w-3 h-3 text-[#D89B30] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>
              </div>
              {settings.office_timings && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-[#D89B30] flex-shrink-0" />
                  <span>
                    {typeof settings.office_timings === 'string'
                      ? settings.office_timings
                      : 'Mon – Sat: 9:30 AM – 7:00 PM IST'}
                  </span>
                </div>
              )}
              <div className="pt-2">
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('contact', '/contact');
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Contact Our Office</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D89B30]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Notice */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-400 leading-relaxed">
          <p>
            <strong className="text-slate-200">Statutory Notice:</strong> All properties featured on Auctions &amp; More
            ({OFFICIAL_DOMAIN}) are sold under statutory provisions of the SARFAESI Act 2002, Insolvency &amp; Bankruptcy Code 2016, or Debt
            Recovery Tribunal rules on an "As is where is", "As is what is", and "Whatever there is" basis. Reserve
            prices, earnest money deposits (EMD), and eligibility criteria are determined strictly by the respective
            Authorized Bank Officers, Recovery Officers, and NCLT Liquidators.
          </p>
        </div>

        {/* Copyright & Legals */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-center md:text-left">
            <div>
              {settings.copyright || `© ${new Date().getFullYear()} ${settings.company_name}. All rights reserved.`}
            </div>
            <span className="hidden sm:inline text-slate-600">|</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleLegalClick('privacy')}
                className="text-slate-300 hover:text-[#D89B30] transition-colors cursor-pointer font-medium hover:underline underline-offset-4"
              >
                Privacy Policy
              </button>
              <span className="text-slate-600">·</span>
              <button
                type="button"
                onClick={() => handleLegalClick('terms')}
                className="text-slate-300 hover:text-[#D89B30] transition-colors cursor-pointer font-medium hover:underline underline-offset-4"
              >
                Terms &amp; Conditions
              </button>
            </div>
          </div>

          {/* Institutional Compliance Label with safe margin on the right so WhatsApp button never overlaps */}
          <div className="text-[11px] text-slate-400 font-mono hidden lg:flex items-center gap-2 pr-44 xl:pr-56">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D89B30]" />
            <span>SARFAESI &amp; IBC Compliant Advisory</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

