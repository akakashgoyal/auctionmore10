import React, { useState, useMemo } from 'react';
import { useApi } from '../context/ApiContext';
import { postCustomerRequirement } from '../services/api';
import { BACKEND_PROPERTY_TYPES, getSubTypesForPropertyType } from '../data/propertyTypes';
import {
  CheckCircle2,
  Phone,
  Mail,
  User,
  Building,
  Send,
  Loader2,
  AlertCircle,
  MapPin,
  IndianRupee,
  FileText,
  ShieldCheck,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

interface CustomerRequirementSectionProps {
  className?: string;
  onSuccess?: () => void;
}

export const CustomerRequirementSection: React.FC<CustomerRequirementSectionProps> = ({
  className = '',
  onSuccess,
}) => {
  const { settings } = useApi();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [propertySubType, setPropertySubType] = useState('');
  const [minBudget, setMinBudget] = useState<number | ''>(5000000);
  const [maxBudget, setMaxBudget] = useState<number | ''>(15000000);
  const [preferredAreas, setPreferredAreas] = useState<string[]>(['Delhi NCR', 'Noida']);
  const [areaInput, setAreaInput] = useState('');
  const [notes, setNotes] = useState('');

  const availableSubTypes = useMemo(() => {
    return getSubTypesForPropertyType(propertyType);
  }, [propertyType]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleAddArea = () => {
    const trimmed = areaInput.trim();
    if (trimmed && !preferredAreas.includes(trimmed)) {
      setPreferredAreas([...preferredAreas, trimmed]);
      setAreaInput('');
    }
  };

  const handleRemoveArea = (area: string) => {
    setPreferredAreas(preferredAreas.filter((a) => a !== area));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    const finalAreas = [...preferredAreas];
    if (areaInput.trim() && !finalAreas.includes(areaInput.trim())) {
      finalAreas.push(areaInput.trim());
    }

    try {
      const res = await postCustomerRequirement({
        name,
        phone,
        email,
        preferred_areas: finalAreas.length > 0 ? finalAreas : ['Any Location'],
        min_budget: Number(minBudget) || 0,
        max_budget: Number(maxBudget) || 0,
        property_type: propertyType,
        property_sub_type: propertySubType || undefined,
        source: 'website',
        notes: propertySubType && !notes.includes(propertySubType)
          ? `[Sub-Type: ${propertySubType}] ${notes || ''}`.trim()
          : notes,
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

  return (
    <div className={`bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Contextual Value & Advisory Desk Panel */}
        <div className="lg:col-span-5 bg-[#142533] p-6 sm:p-7 lg:p-8 text-white flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#D89B30]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-slate-700/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D89B30] text-xs font-mono font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TAILORED AUCTION SEARCH</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
                Tell Us What You're Looking For
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Can't find your ideal asset in public listings? Submit your budget, location, and requirements for direct bank alerts.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-1.5 rounded-lg bg-[#D89B30]/20 text-[#D89B30] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white">Pre-Public Mandate Alerts</h5>
                  <p className="text-[11px] text-slate-300 pt-0.5 leading-snug">
                    150+ PSU bank notices tracked daily before public e-auctions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-1.5 rounded-lg bg-[#D89B30]/20 text-[#D89B30] shrink-0 mt-0.5">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white">25% – 50% Below Market</h5>
                  <p className="text-[11px] text-slate-300 pt-0.5 leading-snug">
                    Distress realization pricing with transparent prices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-1.5 rounded-lg bg-[#D89B30]/20 text-[#D89B30] shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white">End-to-End Handholding</h5>
                  <p className="text-[11px] text-slate-300 pt-0.5 leading-snug">
                    From 30-year title search to physical possession within 60 days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Concierge Call */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-mono">Immediate Desk:</span>
            <a
              href={`tel:${settings.primary_phone}`}
              className="inline-flex items-center gap-1.5 font-bold text-[#D89B30] hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{settings.primary_phone}</span>
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Requirement Form */}
        <div className="lg:col-span-7 p-6 sm:p-7 lg:p-8 bg-white">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-2xl font-bold text-[#142533]">Thank you!</h4>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Your property requirement has been submitted successfully. Our team will review your requirement and contact you shortly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-[#142533] text-white text-xs font-semibold hover:bg-[#203545] transition-colors cursor-pointer"
              >
                Submit Another Requirement
              </button>
            </div>
          ) : (
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

              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      placeholder="e.g. Rahul Sharma"
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
              </div>

              {/* Row 2: Email */}
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

              {/* Row 3: Property Type & Sub Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                    Property Type
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      disabled={isSubmitting}
                      value={propertyType}
                      onChange={(e) => {
                        setPropertyType(e.target.value);
                        setPropertySubType('');
                      }}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {BACKEND_PROPERTY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type === 'Any' ? 'Any Property Type' : type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                    Sub Type {propertyType && propertyType !== 'Any' ? `(${propertyType})` : ''}
                  </label>
                  <select
                    disabled={isSubmitting}
                    value={propertySubType}
                    onChange={(e) => setPropertySubType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">Any Sub Type / All</option>
                    {availableSubTypes.map((subType) => (
                      <option key={subType} value={subType}>
                        {subType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Budget Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                    Minimum Budget (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      disabled={isSubmitting}
                      placeholder="e.g. 5000000"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-8 pr-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                    Maximum Budget (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      disabled={isSubmitting}
                      placeholder="e.g. 15000000"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-8 pr-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Preferred Locations */}
              <div>
                <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                  Preferred Location(s)
                </label>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="Add city or locality (e.g. Gurugram, Delhi NCR)..."
                      value={areaInput}
                      onChange={(e) => setAreaInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddArea();
                        }
                      }}
                      className="w-full pl-10 pr-3 py-2 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddArea}
                    className="px-4 py-2 bg-[#142533] text-white rounded-xl text-xs font-semibold hover:bg-[#203545] transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {preferredAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {preferredAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF1DE] border border-[#D89B30]/30 text-[#9A6007] text-xs font-medium"
                      >
                        <span>{area}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveArea(area)}
                          className="hover:text-rose-600 ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 5: Additional Requirements */}
              <div>
                <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                  Additional Requirements / Specific Preferences
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    disabled={isSubmitting}
                    placeholder="Mention configuration (e.g. 3 BHK, Penthouse, Corner Plot, Highway frontage, etc.)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Submit & Trust */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Direct PSU Mandate Scans · Zero Brokerage</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D89B30]" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#D89B30]" />
                      <span>Submit Requirement</span>
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
