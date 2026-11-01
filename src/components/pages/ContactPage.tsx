import React, { useState, useMemo } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  ShieldCheck,
  Building,
  Loader2,
  AlertCircle,
  IndianRupee,
  Sparkles,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useApi } from '../../context/ApiContext';
import { OFFICIAL_DOMAIN, OFFICIAL_SITE_URL } from '../../utils/routes';
import { postCustomerRequirement, formatMapEmbedUrl } from '../../services/api';
import { BACKEND_PROPERTY_TYPES, getSubTypesForPropertyType } from '../../data/propertyTypes';

export const ContactPage: React.FC = () => {
  const { settings } = useApi();

  // Source Google Maps and Map Embed URLs directly from the settings model
  const googleMapsUrl =
    settings.google_maps_url ||
    settings.google_map_url ||
    settings.map_url ||
    (settings as any).map_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.primary_address || 'Barakhamba Road, Connaught Place, New Delhi')}`;

  const mapEmbedUrl =
    settings.map_embed_url ||
    settings.embed_map_url ||
    (settings as any).embed_map_url ||
    formatMapEmbedUrl(settings.map_embed_url, googleMapsUrl, settings.primary_address);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [propertySubType, setPropertySubType] = useState('');
  const [location, setLocation] = useState('Delhi NCR');
  const [minBudget, setMinBudget] = useState<number | ''>(5000000);
  const [maxBudget, setMaxBudget] = useState<number | ''>(15000000);
  const [notes, setNotes] = useState('');

  const availableSubTypes = useMemo(() => {
    return getSubTypesForPropertyType(propertyType);
  }, [propertyType]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    const parsedAreas = location
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await postCustomerRequirement({
        name: fullName,
        phone,
        email,
        preferred_areas: parsedAreas.length > 0 ? parsedAreas : ['Delhi NCR'],
        min_budget: Number(minBudget) || 0,
        max_budget: Number(maxBudget) || 0,
        property_type: propertyType,
        property_sub_type: propertySubType || undefined,
        source: 'website',
        notes: (propertySubType && !notes.includes(propertySubType)
          ? `[Sub-Type: ${propertySubType}] ${notes || ''}`
          : notes
        ).trim(),
      });

      if (res.success) {
        setSubmitted(true);
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

  const whatsappHref = `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    settings.whatsapp_message || 'Hi Auctions & More team, I would like to enquire regarding bank auction properties.'
  )}`;

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 pt-4 sm:pt-6 pb-4 sm:pb-6 space-y-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-1.5 pt-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF1DE] border border-[#D89B30]/40 text-[#9A6007] text-xs font-mono font-bold tracking-wide">
          <Phone className="w-3.5 h-3.5 text-[#D89B30]" />
          <span>DIRECT CONTACT &amp; ADVISORY DESK</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142533] leading-tight">
          Let's Discuss Your Next Auction Opportunity
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
          Whether you are an individual home buyer, an HNI investor, or a corporate institution — our advisory team
          is ready to assist across all bank auctions nationwide.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 max-w-6xl mx-auto items-start">
        {/* Left Column: Direct Contact Details & Mandate Information */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#142533] text-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl border border-white/10 relative overflow-hidden group">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 transition-transform duration-700 group-hover:scale-105 pointer-events-none"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#142533] via-[#142533]/85 to-[#142533]/90 pointer-events-none" />

            <div className="relative z-10 space-y-1.5">
              <span className="text-xs font-mono text-[#D89B30] uppercase font-bold tracking-wider">
                {settings.company_name}
              </span>
              <h2 className="font-serif text-2xl font-bold">Mandate Helpline</h2>
              <p className="text-xs text-slate-300">
                {settings.tagline}
              </p>
            </div>

            <div className="relative z-10 space-y-3.5 pt-1 text-xs sm:text-sm text-slate-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-[#D89B30] mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
                    Primary Phone / Desk
                  </span>
                  <a href={`tel:${settings.primary_phone}`} className="font-mono font-bold text-white hover:text-[#D89B30]">
                    {settings.primary_phone}
                  </a>
                </div>
              </div>

              {settings.alternate_phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/10 text-[#D89B30] mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
                      Alternate Line
                    </span>
                    <a href={`tel:${settings.alternate_phone}`} className="font-mono font-bold text-white hover:text-[#D89B30]">
                      {settings.alternate_phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-[#D89B30] mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
                    Official Email
                  </span>
                  <a
                    href={`mailto:${settings.primary_email}`}
                    className="font-medium text-white hover:text-[#D89B30]"
                  >
                    {settings.primary_email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-[#D89B30] mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
                    Official Website
                  </span>
                  <a
                    href={OFFICIAL_SITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-medium text-white hover:text-[#D89B30]"
                  >
                    {OFFICIAL_DOMAIN}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-[#D89B30] mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
                    Registered Office
                  </span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-200 hover:text-white block transition-colors leading-relaxed group cursor-pointer text-xs"
                    title="Open address in Google Maps"
                  >
                    <span>{settings.primary_address}</span>
                  </a>

                  {mapEmbedUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/15 my-2">
                      <div className="h-28 sm:h-32 w-full">
                        <iframe
                          title="Office Location Map"
                          src={mapEmbedUrl}
                          className="w-full h-full border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  )}

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D89B30] hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {settings.office_timings && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/10 text-[#D89B30] mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
                      Advisory Hours
                    </span>
                    <span className="text-slate-200 block text-xs">
                      {typeof settings.office_timings === 'string'
                        ? settings.office_timings
                        : 'Mon – Sat: 9:30 AM – 7:00 PM IST'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Direct WhatsApp CTA */}
            <div className="pt-3 border-t border-white/15 relative z-10">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Instantly on WhatsApp ({settings.whatsapp_number})</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Requirement / Contact Form wired to POST /customers */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-7 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-[#142533]">Requirement Received</h3>
                <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
                  Thank you! Your property requirement has been submitted successfully. Our team will review your requirement and contact you shortly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFullName('');
                  setPhone('');
                  setEmail('');
                  setNotes('');
                  setErrorMessage(null);
                  setFieldErrors({});
                }}
                className="px-6 py-2.5 rounded-xl bg-[#142533] text-white text-xs font-semibold hover:bg-[#203545] transition-colors cursor-pointer"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FAF1DE] text-[#9A6007] text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3 text-[#D89B30]" />
                  <span>PROPERTY INQUIRY &amp; REQUIREMENTS</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#142533]">Tell Us What You're Looking For</h2>
                <p className="text-xs text-[#64748B]">
                  Submit your property search requirements or questions directly to our bank mandate team.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Submission Notice</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#142533] block mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. Akash Goyal"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-sm text-[#142533] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                  />
                  {fieldErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name.join(', ')}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#142533] block mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      disabled={isSubmitting}
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-sm text-[#142533] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.phone.join(', ')}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#142533] block mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      disabled={isSubmitting}
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-sm text-[#142533] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email.join(', ')}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#142533] block mb-1">
                      Property Type
                    </label>
                    <select
                      disabled={isSubmitting}
                      value={propertyType}
                      onChange={(e) => {
                        setPropertyType(e.target.value);
                        setPropertySubType('');
                      }}
                      className="w-full px-4 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      {BACKEND_PROPERTY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type === 'Any' ? 'Any Property Type' : type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#142533] block mb-1">
                      Sub Type {propertyType && propertyType !== 'Any' ? `(${propertyType})` : ''}
                    </label>
                    <select
                      disabled={isSubmitting}
                      value={propertySubType}
                      onChange={(e) => setPropertySubType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] focus:bg-white focus:outline-hidden cursor-pointer"
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

                <div>
                  <label className="text-xs font-semibold text-[#142533] block mb-1">
                    Preferred Location(s)
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. Delhi NCR, Gurugram, Mumbai (comma separated)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-sm text-[#142533] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#142533] block mb-1">
                      Minimum Budget (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        disabled={isSubmitting}
                        placeholder="5000000"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value ? Number(e.target.value) : '')}
                        className="w-full pl-8 pr-3 py-2 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#142533] block mb-1">
                      Maximum Budget (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        disabled={isSubmitting}
                        placeholder="15000000"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : '')}
                        className="w-full pl-8 pr-3 py-2 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#142533] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#142533] block mb-1">
                    Specific Requirements or Questions
                  </label>
                  <textarea
                    rows={3}
                    disabled={isSubmitting}
                    placeholder="Provide details such as size, preferred possession status, or specific inquiries..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-sm text-[#142533] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D89B30]/30 focus:border-[#D89B30] transition-all disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-xl bg-[#142533] hover:bg-[#203545] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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

                <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-[#64748B] text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Confidentiality Guaranteed · Inquiries handled strictly under SARFAESI &amp; IBC legal protocols</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
