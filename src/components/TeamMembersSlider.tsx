import React, { useState, useRef, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { TeamMember } from '../types';
import { TeamMemberModal } from './TeamMemberModal';
import {
  ChevronLeft,
  ChevronRight,
  Award,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Sparkles,
} from 'lucide-react';

interface TeamMembersSliderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

export const TeamMembersSlider: React.FC<TeamMembersSliderProps> = ({
  title = 'Meet Our Leadership & Advisory Team',
  subtitle = 'Seasoned corporate bankers, legal strategists, and distressed asset specialists guiding your high-value auction acquisitions with 100% statutory diligence.',
  badge = 'EXECUTIVE LEADERSHIP & TRANSACTION DESK',
}) => {
  const { teamMembers, isLoadingTeamMembers, settings } = useApi();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Slider container ref
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Check scroll capabilities
  const updateScrollButtons = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

    if (clientWidth > 0) {
      const approxItemWidth = clientWidth >= 1024 ? clientWidth / 2 : clientWidth;
      const index = Math.round(scrollLeft / approxItemWidth);
      setActiveIndex(Math.max(0, Math.min(index, (teamMembers?.length || 1) - 1)));
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const current = sliderRef.current;
    if (current) {
      current.addEventListener('scroll', updateScrollButtons, { passive: true });
      window.addEventListener('resize', updateScrollButtons);
    }
    return () => {
      if (current) {
        current.removeEventListener('scroll', updateScrollButtons);
      }
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [teamMembers]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const { clientWidth } = sliderRef.current;
    const scrollAmount = clientWidth >= 1024 ? clientWidth * 0.52 : clientWidth * 0.88;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleOpenMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  // If loading and no team members yet, display an elegant skeleton
  if (isLoadingTeamMembers && (!teamMembers || teamMembers.length === 0)) {
    return (
      <section className="w-full bg-[#FAFAFA] py-12 sm:py-16 border-t border-slate-200">
        <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="h-6 w-48 bg-slate-200 rounded-full mx-auto animate-pulse" />
            <div className="h-10 w-96 max-w-full bg-slate-200 rounded-2xl mx-auto animate-pulse" />
            <div className="h-4 w-full bg-slate-100 rounded mx-auto animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse flex flex-col sm:flex-row gap-6 items-center"
              >
                <div className="w-44 h-56 rounded-2xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-3 w-full">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-7 w-48 bg-slate-200 rounded" />
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-20 w-full bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no team members returned from API, do not display broken content
  if (!teamMembers || teamMembers.length === 0) {
    return null;
  }

  // Sorted strictly by sort_order
  const sortedMembers = [...teamMembers].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return (
    <section className="relative w-full bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] py-12 sm:py-16 border-t border-slate-200 overflow-hidden">
      {/* Subtle architectural backdrop lines */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#D89B30]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] rounded-full bg-slate-200/40 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 space-y-10">
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF1DE] border border-[#F3DFB4] text-[#9A6007] text-xs font-mono font-bold tracking-wide shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D89B30]" />
              <span>{badge}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142533] leading-[1.15]">
              {title}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </div>

          {/* Slider Arrow Controls */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                canScrollLeft
                  ? 'bg-white hover:bg-[#FAF1DE] text-[#142533] hover:text-[#9A6007] border-slate-300 hover:border-[#D89B30] active:scale-95'
                  : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50'
              }`}
              aria-label="Previous Team Member"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                canScrollRight
                  ? 'bg-[#142533] hover:bg-[#203545] text-white border-[#142533] hover:border-[#D89B30] active:scale-95'
                  : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50'
              }`}
              aria-label="Next Team Member"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Slider Track */}
        <div
          ref={sliderRef}
          className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 -mx-2 px-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sortedMembers.map((member, index) => {
            const cleanExperience = member.experience ? member.experience.trim() : '';

            return (
              <div
                key={member.id || index}
                onClick={() => handleOpenMember(member)}
                className="w-full sm:w-[540px] lg:w-[620px] shrink-0 snap-start bg-white rounded-3xl border border-slate-200 hover:border-[#D89B30] shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col sm:flex-row overflow-hidden group cursor-pointer relative"
              >
                {/* Gold Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D89B30]/40 to-transparent group-hover:via-[#D89B30] transition-colors" />

                {/* Left: Dignified Executive Portrait Stage */}
                <div className="w-full sm:w-52 lg:w-56 shrink-0 relative bg-gradient-to-b from-[#1c3346] via-[#142533] to-[#0c1722] flex flex-col items-center justify-center p-6 sm:p-4 overflow-hidden border-b sm:border-b-0 sm:border-r border-slate-200">
                  {/* Subtle inner radial spotlight */}
                  <div className="absolute inset-0 bg-radial from-[#D89B30]/20 via-transparent to-black/50 pointer-events-none" />

                  <div className="relative w-36 h-44 sm:w-44 sm:h-52 rounded-2xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={member.profile_image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>

                  {/* Experience Badge on Portrait */}
                  {cleanExperience && (
                    <div className="mt-3 sm:absolute sm:bottom-3 sm:left-3 sm:right-3 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-[#142533] text-[11px] font-bold font-mono shadow-md flex items-center justify-center gap-1.5 border border-slate-200/80">
                      <Award className="w-3.5 h-3.5 text-[#9A6007]" />
                      <span>{cleanExperience}</span>
                    </div>
                  )}
                </div>

                {/* Right: Narrative & Credentials */}
                <div className="flex-1 p-6 sm:p-7 lg:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Quiet Kicker */}
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-wider text-[#9A6007] uppercase">
                      <span>Executive Leadership</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">Auctions &amp; More</span>
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533] group-hover:text-[#9A6007] transition-colors leading-tight">
                      {member.name}
                    </h3>

                    <p className="text-xs sm:text-sm font-semibold text-[#9A6007] leading-snug">
                      {member.designation}
                    </p>

                    {/* About Snippet */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 pt-2">
                      {member.about || 'Dedicated to facilitating institutional-grade distressed auction acquisitions with comprehensive legal protection.'}
                    </p>
                  </div>

                  {/* Card Footer: Clean "Read Full Bio" Trigger */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#142533] transition-colors">
                      View Bio &amp; Credentials
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMember(member);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 group-hover:bg-[#142533] text-[#142533] group-hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D89B30] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Slider Indicator Dots */}
        {sortedMembers.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {sortedMembers.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (!sliderRef.current) return;
                  const { clientWidth } = sliderRef.current;
                  const itemWidth = clientWidth >= 1024 ? clientWidth * 0.52 : clientWidth;
                  sliderRef.current.scrollTo({
                    left: idx * itemWidth,
                    behavior: 'smooth',
                  });
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx ? 'w-8 bg-[#D89B30]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Team Member Detail Modal Popup */}
      <TeamMemberModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMember(null);
        }}
        primaryPhone={settings?.primary_phone}
        primaryEmail={settings?.primary_email}
      />
    </section>
  );
};
