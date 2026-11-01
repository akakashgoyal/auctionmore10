import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../context/ApiContext';
import { NoticeItem } from '../services/api';
import { X, Bell } from 'lucide-react';

export const NoticeModal: React.FC = () => {
  const { notices } = useApi();
  const [activeNotice, setActiveNotice] = useState<NoticeItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!notices || notices.length === 0) {
      setIsOpen(false);
      return;
    }

    // Filter valid notices that haven't been dismissed in this session
    const validNotices = notices.filter((n) => {
      if (!n || !n.status || !n.image) return false;
      try {
        const isDismissed = sessionStorage.getItem(`dismissed_notice_${n.id}`);
        return !isDismissed;
      } catch {
        return true;
      }
    });

    if (validNotices.length > 0) {
      // Pick the lowest sort_order notice (highest priority)
      const selected = validNotices[0];
      setActiveNotice(selected);
      // Small timeout so modal doesn't flash jarringly on immediate mount
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
      setActiveNotice(null);
    }
  }, [notices]);

  const handleClose = useCallback(() => {
    if (activeNotice) {
      try {
        sessionStorage.setItem(`dismissed_notice_${activeNotice.id}`, 'true');
      } catch {
        // ignore
      }
    }
    setIsOpen(false);
  }, [activeNotice]);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // If no notice, not open, or image failed, render nothing (no reserved space)
  if (!isOpen || !activeNotice || imageError) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeNotice.title || 'Important Auction Notice'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#142533] text-white">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Bell className="w-4 h-4 text-[#D89B30] shrink-0" />
            <span className="font-serif font-semibold text-xs sm:text-sm text-slate-100 truncate">
              {activeNotice.title || 'Important Auction Notice'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close Notice"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Image Container - Preserving Aspect Ratio */}
        <div className="relative bg-slate-900 flex items-center justify-center max-h-[78vh] overflow-hidden">
          <img
            src={activeNotice.image}
            alt={activeNotice.title || 'Auction Notice'}
            onError={() => {
              setImageError(true);
              handleClose();
            }}
            className="w-auto h-auto max-h-[78vh] max-w-full object-contain mx-auto block select-none"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-mono">
            Auctions &amp; More · Official Notice
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
