import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Scale, AlertTriangle, FileText, CheckCircle2, Lock } from 'lucide-react';
import { useApi } from '../context/ApiContext';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: 'privacy' | 'terms';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose,
}) => {
  const { settings } = useApi();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  // Sync initialTab if changed when opened
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#142533] text-white px-6 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF1DE] border border-[#D89B30] flex items-center justify-center text-[#142533] shrink-0">
              {activeTab === 'privacy' ? (
                <ShieldCheck className="w-5 h-5 text-[#9A6007]" />
              ) : (
                <Scale className="w-5 h-5 text-[#9A6007]" />
              )}
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base sm:text-lg font-bold font-serif text-white">
                {activeTab === 'privacy' ? 'Statutory Privacy Policy' : 'Terms & Conditions of Use'}
              </h2>
              <p className="text-xs text-slate-300">
                Auctions &amp; More Pvt Ltd · Formerly Eagle Capital Services
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#D89B30] text-[#142533] font-bold bg-white -mb-[1px]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D89B30]" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#D89B30] text-[#142533] font-bold bg-white -mb-[1px]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4 text-[#D89B30]" />
            <span>Terms &amp; Conditions</span>
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'privacy' ? (
            /* Privacy Policy Document */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D5] flex items-center justify-between gap-3 text-xs">
                <span className="font-mono text-[#9A6007] font-bold">
                  COMPLIANCE: DPDP ACT 2023 &amp; IT ACT 2000
                </span>
                <span className="text-slate-500">Effective: September 2026</span>
              </div>

              <section className="space-y-2.5">
                <h3 className="font-serif font-bold text-base text-[#142533]">
                  1. Overview &amp; Commitment to Confidentiality
                </h3>
                <p>
                  Auctions &amp; More Pvt Ltd ("we", "our", or "the Company", formerly Eagle Capital Services), operating
                  at <strong>auctionsandmore.in</strong>, is committed to safeguarding the confidentiality and data
                  integrity of all users evaluating bank auction assets, downloading due diligence dossiers, or
                  registering for live bidding deadline alerts.
                </p>
                <p>
                  We operate in compliance with the Digital Personal Data Protection Act 2023 (DPDP) and applicable RBI
                  regulatory frameworks for institutional asset facilitation.
                </p>
              </section>

              <section className="space-y-2.5">
                <h3 className="font-serif font-bold text-base text-[#142533]">
                  2. Information We Collect
                </h3>
                <p>When you utilize our platform or request advisory support, we collect:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Contact Credentials:</strong> Full Name, Email Address, and Phone/WhatsApp number submitted
                    via inquiry forms or property mandate desks.
                  </li>
                  <li>
                    <strong>Property Interests:</strong> Selected auction asset categories (Residential, Commercial,
                    Industrial, Land), target geographic zones, and indicative investment budgets.
                  </li>
                  <li>
                    <strong>Communication Preferences:</strong> Explicit opt-ins for live auction deadline alerts, EMD
                    cutoff notifications, and physical site visit coordination.
                  </li>
                </ul>
              </section>

              <section className="space-y-2.5">
                <h3 className="font-serif font-bold text-base text-[#142533]">
                  3. Strictly No Sale or Unauthorized Sharing of Data
                </h3>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero Commercial Brokerage Resale:</strong> We do not sell, rent, or trade your contact or
                    financial information to any third-party marketing companies, advertisers, or unsolicited lead
                    brokers under any circumstances.
                  </span>
                </div>
                <p>
                  Data is only disclosed to official banking authorities (such as the Bank Authorised Officer or court
                  receiver) when strictly necessary to register your tender bid or facilitate an accompanied physical site
                  inspection that you have explicitly authorized.
                </p>
              </section>

              <section className="space-y-2.5">
                <h3 className="font-serif font-bold text-base text-[#142533]">
                  4. Data Security &amp; Encryption
                </h3>
                <p>
                  All submitted inquiries and investor details are encrypted in transit via SSL/TLS protocols and stored
                  in restricted-access database environments. Only credentialed advisory counsel have operational access to
                  client records.
                </p>
              </section>

              <section className="space-y-2.5">
                <h3 className="font-serif font-bold text-base text-[#142533]">
                  5. Grievance Redressal Officer
                </h3>
                <p>
                  For any privacy inquiries or to request complete deletion of your registered contact data, please contact
                  our designated counsel:
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <p><strong>Officer:</strong> Anju Singh (Advisory Counsel)</p>
                  <p><strong>Email:</strong> {settings.primary_email || 'auctions1.more@gmail.com'}</p>
                  <p><strong>Website:</strong> auctionsandmore.in</p>
                  <p><strong>Direct Helpline:</strong> {settings.primary_phone || '+91 9899897647'}{settings.alternate_phone ? ` / ${settings.alternate_phone}` : ''}</p>
                  <p><strong>Office:</strong> {settings.primary_address || 'KD 170, Metro Apartment, Kohat Enclave, Pitampura, New Delhi 110034'}</p>
                </div>
              </section>
            </div>
          ) : (
            /* Terms & Conditions Document */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Statutory Notice under SARFAESI Act 2002 &amp; IBC 2016:</strong> All properties featured are auctioned
                  on an "As is where is", "As is what is", and "Whatever there is" basis without independent recourse against financial institutions.
                </span>
              </div>

              <section className="space-y-2.5">
                <h3 className="font-serif font-bold text-base text-[#142533]">
                  1. Advisory Scope &amp; Role of Auctions &amp; More
                </h3>
                <p>
                  By accessing <strong>auctionsandmore.in</strong>, you acknowledge that Auctions &amp; More Pvt Ltd
                  operates as an independent specialized auction advisory, due diligence, and investor facilitation firm.
                  The platform assists prospective buyers, institutions, and HNIs in identifying, evaluating, and
                  participating in public bank auctions and judicial liquidation sales across India.
                </p>
                <p>
                  Auctions &amp; More is not an auctioning bank or liquidator. The legal title transfer, price
                  determination, and certificate of sale are executed directly by the respective Authorised Bank Officer,
                  Recovery Officer, or NCLT Liquidator.
                </p>
              </section>

              <section className="space-y-2.5">
                <h3 className="font-serif font-bold text-base text-[#142533]">
                  2. Due Diligence &amp; Pre-Bid Responsibilities
                </h3>
                <p>
                  While our empanelled advocates conduct rigorous 30-year sub-registrar search reports and inspect pending
                  litigation records, prospective bidders are required to independently:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Physically inspect the property during the designated bank inspection window.</li>
                  <li>Verify municipal taxes, society maintenance dues, and utility arrears with the local bodies.</li>
                  <li>Review the statutory Bank Sale Notice and terms published in national dailies and e-auction portals.</li>
                </ul>
              </section>

              <section className="space-y-2.5">
                <h3 className="font-serif font-bold text-base text-[#142533]">
                  3. Earnest Money Deposit (EMD) &amp; Payment Timelines
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong>EMD Submission:</strong> The EMD (typically 10% of Price) must be submitted directly to
                    the bank's designated nodal account or e-auction portal before the advertised deadline.
                  </li>
                  <li>
                    <strong>Payment Schedule (SARFAESI Rule 9):</strong> Successful highest bidders must pay 25% of the bid
                    amount (including EMD) on the auction date or next working day. The remaining 75% is payable within 15 days
                    (or statutory extension granted by the AO).
                  </li>
                  <li>
                    <strong>Refund for Unsuccessful Bidders:</strong> EMD of unsuccessful participants is refunded directly by
                    the bank or e-auction portal as per statutory banking norms.
                  </li>
                </ul>
              </section>

              <section className="space-y-2.5">
                <h3 className="font-serif font-bold text-base text-[#142533]">
                  4. Limitation of Liability &amp; Jurisdiction
                </h3>
                <p>
                  Auctions &amp; More Pvt Ltd shall not be held liable for any decisions, portal server downtimes, postponement
                  of auctions by Authorized Officers, or settlement claims between the borrower and financial institutions.
                </p>
                <p>
                  Any statutory disputes relating to the advisory services of Auctions &amp; More Pvt Ltd are subject to the
                  exclusive jurisdiction of the competent courts of New Delhi, India.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 text-center sm:text-left">
            Have questions? Call our Advisory Desk: <a href={`tel:${settings.primary_phone}`} className="text-[#142533] font-bold hover:underline">{settings.primary_phone}</a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
