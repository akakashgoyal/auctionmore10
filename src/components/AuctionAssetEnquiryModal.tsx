import React, { useState, useEffect } from 'react';
import { AuctionAsset } from '../types';
import { postAuctionAssetEnquiry } from '../services/api';
import { formatINR } from '../utils/storage';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Building2,
  Recycle,
  Cog,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
  MapPin,
  Scale,
} from 'lucide-react';

export interface AuctionAssetEnquiryModalProps {
  asset: AuctionAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ASSET_ENQUIRY_PURPOSES = [
  'Lot Inspection & Site Visit',
  'EMD & Bidding Registration',
  'Technical Specifications & Notice',
  'Full Lot Valuation & Lifting Terms',
];

export const AuctionAssetEnquiryModal: React.FC<AuctionAssetEnquiryModalProps> = ({
  asset,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [enquiryPurpose, setEnquiryPurpose] = useState(ASSET_ENQUIRY_PURPOSES[0]);
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (asset) {
      const refLabel = asset.reference_no ? `Ref: ${asset.reference_no}` : `ID #${asset.id}`;
      const catLabel = (asset.category || 'Auction Asset').toLowerCase();
      setMessage(
        `I am interested in this ${catLabel} lot (${asset.title}, ${refLabel}). Please share physical inspection schedule, tender terms, and EMD bidding procedure.`
      );
      setIsSubmitted(false);
      setErrorMessage(null);
      setFieldErrors({});
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const isScrap = (asset.category || '').toLowerCase().includes('scrap');
  const locationText = [asset.city, asset.state].filter(Boolean).join(', ');
  const reserveNum =
    asset.reserve_price !== null && asset.reserve_price !== undefined
      ? Number(asset.reserve_price)
      : NaN;
  const emdNum =
    asset.emd_amount !== null && asset.emd_amount !== undefined ? Number(asset.emd_amount) : NaN;
  const hasReserve = !isNaN(reserveNum) && reserveNum > 0;
  const hasEmd = !isNaN(emdNum) && emdNum > 0;
  const hasQuantity =
    asset.quantity !== null &&
    asset.quantity !== undefined &&
    String(asset.quantity).trim() !== '' &&
    Number(asset.quantity) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await postAuctionAssetEnquiry({
        asset,
        name,
        email,
        phone,
        company_name: companyName,
        enquiry_purpose: enquiryPurpose,
        message,
      });

      if (res.success) {
        setIsSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message);
        if (res.errors) {
          setFieldErrors(res.errors);
        }
      }
    } catch {
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
    setFieldErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={handleResetAndClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#142533] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF1DE] text-[#D89B30] flex items-center justify-center shadow-xs shrink-0">
              {isScrap ? (
                <Recycle className="w-5 h-5 text-[#9A6007]" />
              ) : (
                <Cog className="w-5 h-5 text-[#9A6007]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-title">
                {isScrap ? 'Scrap Auction Enquiry' : 'Plant & Machinery Enquiry'}
              </h3>
              <p className="text-[11px] text-slate-300">
                Lot Inspection, Tender Document &amp; E-Auction Bidding Support
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close auction asset enquiry form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[82vh] space-y-5">
          {/* Asset Context Box */}
          <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E5E0D5] space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] flex-wrap">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#D89B30]">
                {[asset.category, asset.sub_type].filter(Boolean).join(' · ') || 'Auction Asset'}
              </span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                Ref:{' '}
                <strong className="text-[#142533]">
                  {asset.reference_no || `AST-${asset.id}`}
                </strong>
              </span>
            </div>

            <div className="space-y-1">
              {asset.title && (
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#142533] leading-snug">
                  {asset.title}
                </h4>
              )}
              <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-x-2 gap-y-1">
                {asset.bank_name && (
                  <span className="font-semibold text-[#142533]">{asset.bank_name}</span>
                )}
                {asset.bank_name && (locationText || hasQuantity) && <span>·</span>}
                {locationText && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#D89B30]" />
                    <span>{locationText}</span>
                  </span>
                )}
                {locationText && hasQuantity && <span>·</span>}
                {hasQuantity && (
                  <span className="inline-flex items-center gap-1 font-mono text-[#142533] font-semibold">
                    <Scale className="w-3 h-3 text-slate-400" />
                    <span>
                      {Number(asset.quantity).toLocaleString('en-IN', {
                        maximumFractionDigits: 3,
                      })}{' '}
                      {asset.unit || ''}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {(hasReserve || hasEmd) && (
              <div className="pt-2 border-t border-[#E5E0D5] flex flex-wrap items-center justify-between gap-2 text-xs">
                {hasReserve && (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[#64748B]">Reserve Price:</span>
                    <span className="font-bold text-[#142533] font-mono text-sm tabular-nums">
                      {formatINR(reserveNum)}
                    </span>
                  </div>
                )}
                {hasEmd && (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[#64748B]">EMD:</span>
                    <span className="font-bold text-[#9A6007] font-mono text-xs tabular-nums">
                      {formatINR(emdNum)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Success State */}
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="font-serif text-xl font-bold text-[#142533]">
                  Enquiry Submitted Successfully
                </h4>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Thank you. Your {isScrap ? 'scrap lot' : 'plant & machinery'} enquiry has been registered. Our industrial auction team will contact you shortly with inspection and bidding details.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-[#142533] text-white text-xs font-semibold hover:bg-[#203545] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Submission Notice</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Full Name & Company Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      disabled={isSubmitting}
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name.join(', ')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                    Company / Firm Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="Your firm or company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      disabled={isSubmitting}
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.phone.join(', ')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      disabled={isSubmitting}
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email.join(', ')}</p>
                  )}
                </div>
              </div>

              {/* Enquiry Purpose */}
              <div>
                <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                  Enquiry Type
                </label>
                <select
                  value={enquiryPurpose}
                  disabled={isSubmitting}
                  onChange={(e) => setEnquiryPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                >
                  {ASSET_ENQUIRY_PURPOSES.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                  Message / Requirements <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    required
                    disabled={isSubmitting}
                    placeholder="Specify lot inspection request, compliance certificates, or bidding query..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Confidentiality Note */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#64748B]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your details are kept strictly confidential under DPDP Act 2023 norms.</span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D89B30]" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#D89B30]" />
                      <span>
                        {isScrap ? 'Submit Scrap Enquiry' : 'Submit Machinery Enquiry'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
