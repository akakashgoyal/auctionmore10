import React, { useState, useMemo } from 'react';
import { postCustomerRequirement } from '../services/api';
import { BACKEND_PROPERTY_TYPES, getSubTypesForPropertyType } from '../data/propertyTypes';
import {
  X,
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
} from 'lucide-react';

interface CustomerRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CustomerRequirementModal: React.FC<CustomerRequirementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [propertySubType, setPropertySubType] = useState('');
  const [minBudget, setMinBudget] = useState<number | ''>(5000000);
  const [maxBudget, setMaxBudget] = useState<number | ''>(15000000);
  const [preferredAreas, setPreferredAreas] = useState<string[]>(['Delhi NCR', 'Gurugram']);
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

    // If user typed an area but didn't click add, add it now
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
      setErrorMessage('Network request failed. Please try again.');
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
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#142533] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF1DE] text-[#D89B30] flex items-center justify-center shadow-xs">
              <Building className="w-5 h-5 text-[#9A6007]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-title">Tell Us What You're Looking For</h3>
              <p className="text-[11px] text-slate-300">
                Tailored Bank Auction Matches Across India
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close requirement form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[82vh] space-y-5">
          {isSubmitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="font-serif text-xl font-bold text-[#142533]">
                  Thank you!
                </h4>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Your property requirement has been submitted successfully.
                  Our team will review your requirement and contact you shortly.
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

              {/* Phone & Email */}
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

              {/* Property Type & Sub Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                    Property Type
                  </label>
                  <select
                    disabled={isSubmitting}
                    value={propertyType}
                    onChange={(e) => {
                      setPropertyType(e.target.value);
                      setPropertySubType('');
                    }}
                    className="w-full py-2.5 px-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {BACKEND_PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type === 'Any' ? 'Any Property Type' : type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                    Sub Type {propertyType && propertyType !== 'Any' ? `(${propertyType})` : ''}
                  </label>
                  <select
                    disabled={isSubmitting}
                    value={propertySubType}
                    onChange={(e) => setPropertySubType(e.target.value)}
                    className="w-full py-2.5 px-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50 cursor-pointer"
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

              {/* Budget Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

              {/* Preferred Locations (Supports Multiple Values) */}
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
                      placeholder="Add city/area (e.g. Delhi, Noida, Mumbai)..."
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
                    className="px-3.5 py-2 bg-[#142533] text-white rounded-xl text-xs font-semibold hover:bg-[#203545] transition-colors flex items-center gap-1 cursor-pointer"
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF1DE] border border-[#D89B30]/30 text-[#9A6007] text-xs font-medium"
                      >
                        <span>{area}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveArea(area)}
                          className="hover:text-rose-600 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Requirements / Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#142533] mb-1.5">
                  Additional Requirements / Specific Preferences
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    disabled={isSubmitting}
                    placeholder="e.g. Looking for a 3 BHK property near metro station with clear physical possession..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#64748B]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Submitted directly to our Mandate Advisory Desk. No spam or third-party sharing.</span>
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
                      <span>Submit Property Requirement</span>
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
