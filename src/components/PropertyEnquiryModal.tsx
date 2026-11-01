import React, { useState } from 'react';
import { Property } from '../types';
import { postPropertyEnquiry } from '../services/api';
import { formatINR } from '../utils/storage';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Building,
  Send,
  Loader2,
  AlertCircle,
  Landmark,
  MessageSquare,
} from 'lucide-react';

interface PropertyEnquiryModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PropertyEnquiryModal: React.FC<PropertyEnquiryModalProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !property) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    `I am interested in this auction property (${property.title}, Ref: ${property.borrowerRef || property.id}). Please share pre-bid due diligence dossier and bidding procedure.`
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await postPropertyEnquiry({
        property_id: property.id,
        name,
        email,
        phone,
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
            <div className="w-9 h-9 rounded-xl bg-[#FAF1DE] text-[#D89B30] flex items-center justify-center shadow-xs">
              <Building className="w-5 h-5 text-[#9A6007]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-title">Property Enquiry</h3>
              <p className="text-[11px] text-slate-300">
                Official Bank Auction Dossier &amp; Bidding Assistance
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close enquiry form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
          {/* Property Context Box (Mandated by Section 9) */}
          <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E5E0D5] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#D89B30]">
                Property Context
              </span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                Reference: <strong className="text-[#142533]">{property.borrowerRef || `AM-${property.id}`}</strong>
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#142533] leading-snug">
                {property.title}
              </h4>
              <p className="text-xs text-[#64748B] flex items-center gap-1">
                <span>{property.location.locality}, {property.location.city}</span>
                <span>·</span>
                <span className="font-semibold text-[#142533]">{property.authority}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-[#E5E0D5] flex items-center justify-between text-xs">
              <span className="text-[#64748B]">
                {property.postAuctionPrice ? 'Bank Sale Price:' : 'Price:'}
              </span>
              <div className="flex items-baseline gap-1.5">
                {property.postAuctionPrice ? (
                  <>
                    <span className="font-bold text-[#142533] font-sans text-sm">
                      {formatINR(property.postAuctionPrice)}
                    </span>
                    {property.reservePrice > 0 && (
                      <span className="text-xs text-slate-400 line-through decoration-red-400/80 font-mono">
                        {formatINR(property.reservePrice)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-bold text-[#142533] font-sans text-sm">
                    {formatINR(property.reservePrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Success State Screen */}
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
                  Thank you. Your enquiry has been submitted successfully. Our team will contact you shortly.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-[#142533] text-white text-xs font-semibold hover:bg-[#203545] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Enquiry Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
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
                    placeholder="Specify your inquiry details or inspection request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                  />
                </div>
                {fieldErrors.message && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.message.join(', ')}</p>
                )}
              </div>

              {/* Statutory Guarantee note */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#64748B]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
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
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#D89B30]" />
                      <span>Submit Property Enquiry</span>
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
