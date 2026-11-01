import React, { useState, useEffect } from 'react';
import { AuthorityProperty } from '../types';
import { postAuthorityPropertyEnquiry } from '../services/api';
import { formatINR } from '../utils/storage';
import { formatAreaValue } from './AuthorityPropertyCard';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Landmark,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
  MapPin,
} from 'lucide-react';

export interface AuthorityPropertyEnquiryModalProps {
  property: AuthorityProperty | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ENQUIRY_PURPOSES = [
  'Bidding & Registration Support',
  'Site Inspection Request',
  'Brochure & Allotment Terms',
  'EMD & Payment Schedule Query',
];

export const AuthorityPropertyEnquiryModal: React.FC<AuthorityPropertyEnquiryModalProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [enquiryPurpose, setEnquiryPurpose] = useState(ENQUIRY_PURPOSES[0]);
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (property) {
      const codeStr = property.property_code ? `Code: ${property.property_code}` : `ID #${property.id}`;
      const authStr = property.authority?.short_name || property.authority?.name || '';
      setMessage(
        `I am interested in this authority property (${property.title}${authStr ? `, ${authStr}` : ''}, ${codeStr}). Please share allotment details, site inspection schedule, and e-auction bidding assistance.`
      );
      setIsSubmitted(false);
      setErrorMessage(null);
      setFieldErrors({});
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const locationText = [property.city_name, property.state_name].filter(Boolean).join(', ');
  const areaText = formatAreaValue(property.area, property.area_unit);
  const hasReservePrice = property.reserve_price !== null && property.reserve_price !== undefined;
  const hasEmdAmount = property.emd_amount !== null && property.emd_amount !== undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await postAuthorityPropertyEnquiry({
        property,
        name,
        email,
        phone,
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
              <Landmark className="w-5 h-5 text-[#9A6007]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-title">Authority Property Enquiry</h3>
              <p className="text-[11px] text-slate-300">
                Allotment Dossier, Site Visit &amp; E-Auction Assistance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close authority property enquiry form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[82vh] space-y-5">
          {/* Authority Property Context Card */}
          <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E5E0D5] space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] flex-wrap">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#D89B30]">
                Authority Property Context
              </span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0] truncate max-w-[240px]">
                Code:{' '}
                <strong className="text-[#142533]">
                  {property.property_code || `AP-${property.id}`}
                </strong>
              </span>
            </div>

            <div className="space-y-1">
              {property.title && (
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#142533] leading-snug">
                  {property.title}
                </h4>
              )}
              <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-x-2 gap-y-1">
                {property.authority?.name && (
                  <span className="font-semibold text-[#9A6007]">
                    {property.authority.name}
                    {property.authority.short_name ? ` (${property.authority.short_name})` : ''}
                  </span>
                )}
                {property.authority?.name && (locationText || areaText) && <span>·</span>}
                {locationText && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#D89B30]" />
                    <span>{locationText}</span>
                  </span>
                )}
                {locationText && areaText && <span>·</span>}
                {areaText && <span className="font-mono text-[#142533] font-semibold">{areaText}</span>}
              </div>
            </div>

            {(hasReservePrice || hasEmdAmount) && (
              <div className="pt-2 border-t border-[#E5E0D5] flex flex-wrap items-center justify-between gap-2 text-xs">
                {hasReservePrice && (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[#64748B]">Reserve Price:</span>
                    <span className="font-bold text-[#142533] font-mono text-sm tabular-nums">
                      {formatINR(property.reserve_price!)}
                    </span>
                  </div>
                )}
                {hasEmdAmount && (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[#64748B]">EMD:</span>
                    <span className="font-bold text-[#9A6007] font-mono text-xs tabular-nums">
                      {formatINR(property.emd_amount!)}
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
                  Thank you. Your authority property enquiry has been registered. Our advisory team will contact you shortly with complete allotment and bidding details.
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

              {/* Full Name */}
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
                  Enquiry Purpose
                </label>
                <select
                  value={enquiryPurpose}
                  disabled={isSubmitting}
                  onChange={(e) => setEnquiryPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                >
                  {ENQUIRY_PURPOSES.map((purpose) => (
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
                    placeholder="Specify your questions regarding allotment eligibility, site visit, or bidding..."
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
                      <span>Submit Authority Property Enquiry</span>
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
