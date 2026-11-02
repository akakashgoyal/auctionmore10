import React from 'react';
import { PageRoute } from '../Navbar';
import { Home, Building2, Landmark, Phone, Search, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: PageRoute, customUrl?: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Error 404 &bull; Page Not Found</span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#142533] tracking-tight font-serif-title">
            Asset or Page Not Found
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            The page or property listing you requested does not exist, has expired after auction conclusion, or the URL might be mistyped.
          </p>
          {currentPath && (
            <div className="inline-block mt-2">
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 break-all">
                {currentPath}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('home', '/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#142533] hover:bg-[#1f374c] text-white font-medium text-sm transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#D89B30]" />
            <span>Return to Homepage</span>
          </button>

          <button
            onClick={() => onNavigate('property', '/properties')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D89B30] hover:bg-[#c58920] text-[#142533] font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Browse Active Auctions</span>
          </button>
        </div>

        {/* Helpful Direct Category Cards */}
        <div className="pt-6 border-t border-slate-100">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-600 mb-4">
            Popular Portals
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <button
              onClick={() => onNavigate('authority-properties', '/authority-properties')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Landmark className="w-4 h-4 text-emerald-600" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
              </div>
              <div className="text-xs font-bold text-[#142533]">Authority Properties</div>
              <div className="text-[11px] text-slate-600 mt-0.5">DDA, YEIDA, HUDA, UPSIDA</div>
            </button>

            <button
              onClick={() => onNavigate('scrap-auctions', '/scrap-auctions')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
              </div>
              <div className="text-xs font-bold text-[#142533]">Plant & Scrap Auctions</div>
              <div className="text-[11px] text-slate-600 mt-0.5">Machinery, Metal & Industrial</div>
            </button>

            <button
              onClick={() => onNavigate('contact', '/contact')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Phone className="w-4 h-4 text-blue-600" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
              </div>
              <div className="text-xs font-bold text-[#142533]">Help & Advisory Desk</div>
              <div className="text-[11px] text-slate-600 mt-0.5">Talk to Auction Specialist</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
