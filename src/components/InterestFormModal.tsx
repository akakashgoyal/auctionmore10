import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { Property, InterestSubmission } from '../types';
import { saveInterestSubmission, formatINR } from '../utils/storage';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Building,
  CheckSquare,
  Square,
  ArrowRight,
  MessageCircle,
  FileCheck,
} from 'lucide-react';

interface InterestFormModalProps {
  property: Property | null;
  onClose: () => void;
  onSuccess: (submission: InterestSubmission) => void;
  defaultContact?: {
    fullName: string;
    phone: string;
    email: string;
  };
}

export const InterestFormModal: React.FC<InterestFormModalProps> = ({
  property,
  onClose,
  onSuccess,
  defaultContact,
}) => {
  const { settings } = useApi();
  if (!property) return null;

  const [fullName, setFullName] = useState(defaultContact?.fullName || '');
  const [phone, setPhone] = useState(defaultContact?.phone || '');
  const [email, setEmail] = useState(defaultContact?.email || '');
  const [investorType, setInvestorType] = useState<InterestSubmission['investorType']>(
    'Individual First-Time Buyer'
  );
  const [bidCapacityBracket, setBidCapacityBracket] = useState('Up to Price + 15%');
  const [services, setServices] = useState({
    siteInspection: true,
    legalDueDiligence: true,
    emdPortalAssistance: true,
    biddingRepresentation: false,
    possessionHandover: true,
  });
  const [notes, setNotes] = useState('');
  const [submittedData, setSubmittedData] = useState<InterestSubmission | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submission: InterestSubmission = {
      id: `AM-${Math.floor(100000 + Math.random() * 900000)}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: `${property.location.locality}, ${property.location.city}`,
      reservePrice: property.reservePrice,
      applicantName: fullName,
      phone,
      email,
      investorType,
      bidCapacityBracket,
      requestedServices: services,
      additionalNotes: notes,
      submittedAt: new Date().toISOString(),
      status: 'Pending Review',
    };

    saveInterestSubmission(submission);
    setSubmittedData(submission);
    onSuccess(submission);
  };

  const toggleService = (key: keyof typeof services) => {
    setServices((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#142533] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D89B30] flex items-center justify-center text-[#142533]">
              <FileCheck className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-title">Expression of Interest</h3>
              <p className="text-[11px] text-slate-300">
                Pre-bid clarity, legal dossier &amp; mandate advisory support
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {submittedData ? (
          /* Confirmation State */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#FAF1DE] border border-[#D89B30]/40 text-[#9A6007] text-xs font-mono font-bold">
                Reference ID: {submittedData.id}
              </span>
              <h4 className="font-serif text-2xl font-bold text-[#142533]">
                Interest Registered Successfully!
              </h4>
              <p className="text-sm text-[#64748B] max-w-md mx-auto">
                Thank you, <strong className="text-[#142533]">{submittedData.applicantName}</strong>. Our
                Associate team led by <strong className="text-[#142533]">Anju Singh</strong> will review your
                request and dispatch the legal due diligence summary.
              </p>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-[#E2E8F0] text-left text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Target Asset:</span>
                <span className="font-semibold text-slate-800">{property.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Price:</span>
                <span className="font-semibold text-slate-800">{formatINR(property.reservePrice)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Alert Status:</span>
                <span className="font-semibold text-emerald-700">
                  ✓ Live Bid &amp; Deadline Alerts Subscribed
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-mono text-slate-800">{submittedData.phone}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/${(settings.whatsapp_number || settings.primary_phone || '919899897647').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello Auctions & More, I have submitted Interest Ref #${submittedData.id} for "${property.title}". Please share the legal title dossier.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Priority WhatsApp Follow-Up</span>
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
            {/* Property Summary Strip */}
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E5E0D5] flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-[#D89B30] uppercase tracking-wider block">
                  Selected Mandate
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-[#142533] line-clamp-1">{property.title}</h4>
                <span className="text-[11px] text-[#64748B]">
                  {property.bankName} · Reserve: {formatINR(property.reservePrice)}
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-lg border border-[#E2E8F0] text-emerald-700 whitespace-nowrap">
                {property.possessionStatus}
              </span>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#142533]">
                1. Your Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1">Full Legal Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="interest-form-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Akash Goyal"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="interest-form-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#475569] mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="interest-form-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="akakashgoyal123@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Investor Classification & Budget Bracket */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">Investor Category</label>
                <select
                  id="interest-form-category"
                  value={investorType}
                  onChange={(e) => setInvestorType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
                >
                  <option value="Individual First-Time Buyer">Individual First-Time Buyer</option>
                  <option value="High Net-worth Investor (HNI)">High Net-worth Investor (HNI)</option>
                  <option value="Corporate / Institutional">Corporate / Institutional</option>
                  <option value="Builder / Real Estate Fund">Builder / Real Estate Fund</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">Bid Capacity Readiness</label>
                <select
                  id="interest-form-readiness"
                  value={bidCapacityBracket}
                  onChange={(e) => setBidCapacityBracket(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
                >
                  <option value="Ready with 10% EMD (Immediate)">Ready with 10% EMD (Immediate)</option>
                  <option value="Up to Price + 15%">Up to Price + 15%</option>
                  <option value="High Capacity (Aggressive Bidding)">High Capacity (Aggressive Bidding)</option>
                  <option value="Subject to Physical Site Inspection">Subject to Physical Site Inspection</option>
                </select>
              </div>
            </div>

            {/* Service Checkbox Handholding */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#142533]">
                2. Select Required Advisory Services (Eagle Capital Protocol)
              </label>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => toggleService('siteInspection')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8F9FA] text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {services.siteInspection ? (
                      <CheckSquare className="w-4 h-4 text-[#D89B30]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-[#142533] block">
                        Physical Site Inspection Accompaniment
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Field associate accompanies you to the property with Bank Authorised Officer
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleService('legalDueDiligence')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8F9FA] text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {services.legalDueDiligence ? (
                      <CheckSquare className="w-4 h-4 text-[#D89B30]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-[#142533] block">
                        Title Search &amp; Non-Encumbrance Legal Dossier
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Detailed 30-year revenue search, municipal tax clearance, and advocate report
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleService('emdPortalAssistance')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8F9FA] text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {services.emdPortalAssistance ? (
                      <CheckSquare className="w-4 h-4 text-[#D89B30]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-[#142533] block">
                        EMD DD Preparation &amp; E-Auction Portal KYC Registration
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Help registering DSC / digital signature and submitting Annexure II/III forms
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleService('possessionHandover')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8F9FA] text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {services.possessionHandover ? (
                      <CheckSquare className="w-4 h-4 text-[#D89B30]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-[#142533] block">
                        Sale Certificate &amp; 60-Day Physical Possession Handover
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Post-auction coordination with Bank SAMB branch till registered sale deed
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Specific queries */}
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">
                Specific Inquiries or Requirements (Optional)
              </label>
              <textarea
                id="interest-form-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please confirm if society transfer NOC is available, or arrange Sunday morning inspection..."
                className="w-full p-2.5 text-xs bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] focus:bg-white focus:outline-hidden focus:border-[#D89B30]"
              ></textarea>
            </div>

            {/* Notification Subscription Notice */}
            <div className="flex items-start gap-2 text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
              <ShieldCheck className="w-4 h-4 text-[#D89B30] flex-shrink-0 mt-0.5" />
              <span>
                By submitting this form, you will automatically receive live bid increments and countdown deadline
                notifications for this asset via WhatsApp &amp; In-App.
              </span>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#E2E8F0] text-xs font-medium text-[#64748B]"
              >
                Cancel
              </button>
              <button
                id="btn-submit-interest-form"
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center gap-2"
              >
                <span>Submit Expression of Interest</span>
                <ArrowRight className="w-4 h-4 text-[#D89B30]" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
