import React from 'react';
import { ShieldCheck, Lock, Eye, Server, UserCheck } from 'lucide-react';
import { useApi } from '../../context/ApiContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useApi();
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 pb-6 sm:pb-8">
      {/* Header */}
      <div className="space-y-3 pt-4 border-b border-[#E2E8F0] pb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF1DE] border border-[#D89B30]/40 text-[#9A6007] text-xs font-mono font-bold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-[#D89B30]" />
          <span>STATUTORY PRIVACY POLICY</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#142533]">
          Privacy Policy — Auctions &amp; More Pvt Ltd
        </h1>
        <p className="text-xs text-[#64748B]">
          Last Updated: September 2026 · Corporate Identity: Formerly Eagle Capital Services
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-[#334155] leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            1. Overview &amp; Commitment to Confidentiality
          </h2>
          <p>
            Auctions &amp; More Pvt Ltd ("we", "our", or "the Company"), operating via <strong>auctionsandmore.in</strong>,
            values your trust and is dedicated to safeguarding the personal and financial information of users who
            browse our listed properties, express interest in bank auction assets, or subscribe to auction notifications
            and bidding deadline alerts.
          </p>
          <p>
            This Privacy Policy sets out how we collect, handle, utilize, and protect your information in full
            compliance with the Information Technology Act 2000, the Digital Personal Data Protection Act (DPDP), and
            applicable RBI guidelines on financial asset resolution.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            2. Information We Collect
          </h2>
          <p>When you interact with our platform, we may collect the following information:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
            <li>
              <strong>Contact Data:</strong> Full Name, Email Address, and Phone/WhatsApp number when you submit an
              inquiry or express interest in a listed property.
            </li>
            <li>
              <strong>Property Interests:</strong> Specific property listings, target cities, property categories
              (Residential, Commercial, Industrial, Land), and bid capacity brackets indicated in your requests.
            </li>
            <li>
              <strong>Alert Preferences:</strong> Your selected preferences for receiving live bid increment alerts,
              inspection schedule notices, and EMD closing deadline updates.
            </li>
            <li>
              <strong>Technical Logs:</strong> Standard web server logs, browser type, device information, and IP
              address for security auditing and abuse prevention.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            3. How We Use Your Information
          </h2>
          <p>The information collected is used exclusively for legitimate business and mandate purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
            <li>
              To dispatch requested Pre-Bid Legal Due Diligence Summaries and 30-year title verification reports.
            </li>
            <li>
              To notify you about real-time bid updates, counter-bids, and auto-extension windows for auctions you have
              expressed interest in.
            </li>
            <li>
              To alert you to crucial statutory deadlines, including EMD submission cutoffs and bank portal
              registration windows.
            </li>
            <li>
              To coordinate on-site physical property visits with the respective Bank Authorised Officers or NCLT
              Liquidators.
            </li>
            <li>To respond to your inquiries submitted via our contact forms or phone lines.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            4. No Selling or Unauthorized Sharing of User Data
          </h2>
          <p>
            We adhere to strict institutional ethics: <strong>we do not sell, rent, lease, or trade</strong> your
            personal information to third-party telemarketers or advertisers under any circumstances.
          </p>
          <p>
            Information is only shared with official banking authorities (such as the Authorized Officer or court
            receiver) when strictly necessary to register your tender bid or facilitate an accompanied physical site
            inspection that you have explicitly requested.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            5. Data Retention &amp; Security
          </h2>
          <p>
            We implement industry-standard encryption protocols (SSL/TLS) and restricted server access controls to
            protect all submitted contact details and expressions of interest from unauthorized access, alteration, or
            disclosure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            6. Contacting the Grievance Officer
          </h2>
          <p>
            If you have questions, would like to opt out of auction notifications, or wish to request data correction,
            please write to our grievance desk:
          </p>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D5] font-mono text-xs space-y-1 text-[#142533]">
            <p><strong>{settings.company_name || 'Auctions & More Pvt Ltd'}</strong></p>
            <p>Attn: Legal Compliance Officer</p>
            <p>{settings.primary_address || 'KD 170, Metro Apartment, Kohat Enclave, Pitampura, New Delhi 110034'}</p>
            <p>Email: {settings.primary_email || 'auctions1.more@gmail.com'} | Helpline: {settings.primary_phone || '+91 9899897647'}</p>
            <p>Website: auctionsandmore.in</p>
          </div>
        </section>
      </div>
    </div>
  );
};
