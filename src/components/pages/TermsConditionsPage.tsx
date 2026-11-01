import React from 'react';
import { ShieldCheck, Scale, AlertTriangle, FileText } from 'lucide-react';

export const TermsConditionsPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 pb-6 sm:pb-8">
      {/* Header */}
      <div className="space-y-3 pt-4 border-b border-[#E2E8F0] pb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF1DE] border border-[#D89B30]/40 text-[#9A6007] text-xs font-mono font-bold tracking-wide">
          <Scale className="w-4 h-4 text-[#D89B30]" />
          <span>STATUTORY TERMS &amp; CONDITIONS</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#142533]">
          Terms &amp; Conditions of Use — Auctions &amp; More
        </h1>
        <p className="text-xs text-[#64748B]">
          Effective Date: September 2026 · Corporate Entity: Auctions &amp; More Pvt Ltd
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-[#334155] leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            1. Acceptance of Terms &amp; Advisory Scope
          </h2>
          <p>
            By accessing and utilizing the website <strong>auctionsandmore.in</strong> (operated by Auctions &amp; More
            Pvt Ltd, formerly Eagle Capital Services), you agree to be bound by these statutory Terms and Conditions.
          </p>
          <p>
            Auctions &amp; More Pvt Ltd operates as an independent specialized auction advisory, due diligence, and
            investor facilitation firm. The platform assists prospective buyers, institutions, and HNIs in identifying,
            evaluating, and participating in public bank auctions and judicial liquidation sales across India.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            2. "As Is Where Is" Statutory Auction Disclaimer
          </h2>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Mandatory Legal Notice under SARFAESI Act 2002 &amp; IBC 2016</span>
            </div>
            <p className="text-xs leading-relaxed">
              All properties, plant and machinery, commercial assets, and land listed on this platform are auctioned by
              their respective Authorised Bank Officers, Debt Recovery Tribunals (DRT), or NCLT Court Liquidators on an
              <strong> "As is where is", "As is what is", and "Whatever there is"</strong> basis without any recourse
              against the financial institutions.
            </p>
          </div>
          <p>
            While Auctions &amp; More conducts rigorous 30-year advocate title searches and physical verifications to
            clarify encumbrance and possession status, prospective bidders are strongly advised to independently inspect
            the physical premises, examine municipal records, and verify pending society/utility dues prior to
            submitting an Earnest Money Deposit (EMD).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            3. Earnest Money Deposit (EMD) &amp; Bidding Process
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
            <li>
              <strong>EMD Submission:</strong> The EMD (typically 10% of Price) must be submitted strictly in
              accordance with the official Bank Sale Notice. EMD amounts for unsuccessful bidders are refunded by the
              respective auction portal/bank within statutory periods.
            </li>
            <li>
              <strong>Payment Schedule:</strong> Successful bidders are required to pay 25% of the accepted bid amount
              (including EMD) on the day of auction or by the next business day, and the remaining 75% within 15 days
              (extendable up to statutory limits upon written approval from the Authorized Officer).
            </li>
            <li>
              <strong>Forfeiture Rules:</strong> Failure to pay the balance statutory amount within the stipulated
              timeframe may result in forfeiture of the deposited amount by the Bank Authorised Officer in accordance
              with SARFAESI Rule 9.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            4. Notifications, Live Bid Updates &amp; Deadlines
          </h2>
          <p>
            When you show interest in an auction, you consent to receive live bid increments, closing deadline alerts,
            and inspection updates via WhatsApp, SMS, phone, or email. While we make every endeavor to transmit timely
            real-time updates, users acknowledge that portal network latencies or telecommunication downtime remain
            outside our direct control, and bidders must monitor the bank auction portal directly during the live
            window.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            5. Intellectual Property &amp; Branding
          </h2>
          <p>
            All website trademarks, logos, graphical assets, valuation methodologies, and proprietary due diligence
            formats are the exclusive intellectual property of Auctions &amp; More Pvt Ltd. Unauthorized copying,
            scraping, or redistribution is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif-title font-bold text-lg text-[#142533]">
            6. Governing Law &amp; Jurisdiction
          </h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any
            legal proceedings or disputes arising hereunder shall be subject to the exclusive jurisdiction of the
            courts located in New Delhi, India.
          </p>
        </section>
      </div>
    </div>
  );
};
