import React, { useEffect } from 'react';
import { TeamMember } from '../types';
import {
  X,
  Award,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  Scale,
  Landmark,
  Building,
} from 'lucide-react';

interface TeamMemberModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  primaryPhone?: string;
  primaryEmail?: string;
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  member,
  isOpen,
  onClose,
  primaryPhone,
  primaryEmail,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !member) return null;

  // Split about text by paragraphs for clean readable typography
  const paragraphs = member.about
    ? member.about.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : [];

  const cleanExperience = member.experience ? member.experience.trim() : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#0a131c]/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-modal-name"
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-8 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="relative bg-gradient-to-r from-[#142533] via-[#1a3042] to-[#142533] px-6 sm:px-8 py-4 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D89B30] ring-4 ring-[#D89B30]/20" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#FAF1DE] uppercase">
              Auctions &amp; More · Executive Leadership Profile
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 sm:p-8 sm:py-9 overflow-y-auto space-y-8">
          {/* Executive Split Profile (Portrait Column + Primary Header) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start pb-6 border-b border-slate-200">
            {/* Left Column: Dignified Portrait Frame */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-b from-[#1c3346] via-[#142533] to-[#0b1622] border-2 border-slate-200 shadow-xl flex items-center justify-center group">
                {/* Subtle warm backlight glow */}
                <div className="absolute inset-0 bg-radial from-[#D89B30]/15 via-transparent to-black/40 pointer-events-none" />

                <img
                  src={member.profile_image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'}
                  alt={member.name}
                  className="w-full h-full object-cover object-top relative z-10 transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {/* Experience Tag floating at bottom */}
                {cleanExperience && (
                  <div className="absolute bottom-3 left-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-[#142533] text-xs font-bold font-mono shadow-md flex items-center justify-center gap-1.5">
                    <Award className="w-4 h-4 text-[#9A6007]" />
                    <span>{cleanExperience} Experience</span>
                  </div>
                )}
              </div>

              {/* Verified Mandate Seal */}
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Key Personnel</span>
              </div>
            </div>

            {/* Right Column: Name, Designation & Executive Stats */}
            <div className="md:col-span-7 space-y-4 text-left">
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#9A6007] uppercase block">
                  AUCTIONS &amp; MORE PRIVATE LIMITED
                </span>
                <h2
                  id="team-modal-name"
                  className="font-serif text-3xl sm:text-4xl font-extrabold text-[#142533] leading-tight"
                >
                  {member.name}
                </h2>
                <p className="text-base sm:text-lg font-semibold text-[#9A6007]">
                  {member.designation}
                </p>
              </div>

              {/* Stat Chips */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                    Domain Practice
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-[#142533] block">
                    SARFAESI &amp; IBC 2016
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Stressed Asset Resolution
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                    Track Record
                  </span>
                  <span className="font-serif text-base sm:text-lg font-extrabold text-[#9A6007] block">
                    {cleanExperience || '15+ Years'}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Distressed Acquisitions
                  </span>
                </div>
              </div>

              {/* Direct Liaison Capabilities */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2 text-xs text-slate-700">
                <span className="font-mono text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  Advisory &amp; Transaction Mandates
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>30-Yr Sub-Registrar Audits</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-[#9A6007] shrink-0" />
                    <span>Bank AO &amp; Receiver Liaison</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#9A6007] shrink-0" />
                    <span>NCLT &amp; DRT Settlement Desk</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Section 14 Possession Warrant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Narrative Biography */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Professional Background &amp; Leadership Narrative
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {paragraphs.length > 0 ? (
              <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {member.about || 'Dedicated to facilitating institutional-grade distressed auction acquisitions with comprehensive legal protection.'}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Auctions &amp; More Private Limited · Leadership Desk
          </span>

          <div className="flex items-center gap-2">
            {primaryPhone && (
              <a
                href={`tel:${primaryPhone}`}
                className="px-4 py-2.5 rounded-xl bg-[#FAF1DE] hover:bg-[#F5E6C7] text-[#9A6007] border border-[#D89B30]/40 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Advisory</span>
              </a>
            )}

            {primaryEmail && (
              <a
                href={`mailto:${primaryEmail}`}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Email Advisory</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
