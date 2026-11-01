export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  avatarText: string;
  propertyAcquired: string;
  savingsOrValue: string;
  quote: string;
  bankAuthority: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Rajesh K. Singhania',
    role: 'Managing Director, Apex Logistics',
    city: 'Gurugram, Haryana',
    avatarText: 'RS',
    propertyAcquired: 'Industrial Manufacturing Unit (2,400 sq.yd), Manesar',
    savingsOrValue: 'Acquired at ₹6.80 Cr · Saved ₹2.1 Cr vs Market',
    quote:
      'Buying an industrial property under SARFAESI seemed risky until I engaged Auctions & More. Their team did a comprehensive 30-year advocate title search, coordinated the physical inspection with the SBI Authorized Officer, and got our Sale Certificate registered within 52 days without a single hitch.',
    bankAuthority: 'State Bank of India (SAMB)',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Dr. Sunita & Arvind Narang',
    role: 'Consultant Surgeon & Investors',
    city: 'Mumbai, Maharashtra',
    avatarText: 'SN',
    propertyAcquired: 'Luxury 4 BHK Sea-Facing Penthouse, Worli',
    savingsOrValue: 'Acquired at ₹8.40 Cr · Market Value ₹11.50 Cr',
    quote:
      'We had been tracking South Mumbai properties for two years. Auctions & More guided us step-by-step through the e-auction portal, alerted us about bidding deadlines, and handled the municipal dues verification. The 15 years of Eagle Capital legacy really shows in their professionalism.',
    bankAuthority: 'Bank of Baroda Mandate',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'Vikramaditya Rao',
    role: 'Angel Investor & Tech Entrepreneur',
    city: 'Bengaluru, Karnataka',
    avatarText: 'VR',
    propertyAcquired: 'Grade-A Commercial Office Floor (5,200 sq.ft), Indiranagar',
    savingsOrValue: '32% Below Prevailing Commercial Rates',
    quote:
      'The pre-bid due diligence dossier prepared by Anju Singh and the team was thorough down to every rupee of society maintenance. Their transparent advisory gave our family office the confidence to bid assertively. Truly India’s premier auction partner.',
    bankAuthority: 'Punjab National Bank',
    rating: 5,
  },
  {
    id: 'test-4',
    name: 'Capt. Manpreet Sodhi (Retd.)',
    role: 'First-Time Residential Buyer',
    city: 'Greater Noida, UP',
    avatarText: 'MS',
    propertyAcquired: '3 BHK High-Rise Apartment, Sector 137',
    savingsOrValue: 'Saved ₹28 Lakhs compared to builder resale',
    quote:
      'As a retired defense officer, safety and clear legal titles were my priority. Megha Singla and her team verified every document, accompanied me during physical handover, and ensured possession with original keys on day 45. Highly recommended!',
    bankAuthority: 'Union Bank of India',
    rating: 5,
  },
  {
    id: 'test-5',
    name: 'Kavita Reddy',
    role: 'Partner, Meridian Infra Ventures',
    city: 'Hyderabad, Telangana',
    avatarText: 'KR',
    propertyAcquired: 'NCLT Liquidation Asset, Gachibowli',
    savingsOrValue: 'Clean Slate Title Acquisition under IBC Sec 35',
    quote:
      'Insolvency asset sales require very specific legal navigation under IBC 2016. Auctions & More provided end-to-end liaison with the Resolution Professional, ensuring extinguishment of past statutory claims. Outstanding corporate service.',
    bankAuthority: 'NCLT Judicial Liquidation',
    rating: 5,
  },
  {
    id: 'test-6',
    name: 'Harshvardhan Goenka',
    role: 'Managing Partner, Goenka Retail Holdings',
    city: 'New Delhi, Delhi',
    avatarText: 'HG',
    propertyAcquired: 'Prime Retail Showroom (3,800 sq.ft), South Extension II',
    savingsOrValue: 'Acquired at ₹14.20 Cr · Valuation ₹19.80 Cr',
    quote:
      'We had reservations about bidding on commercial retail bank auctions due to past tenancy risks. The team at Auctions & More verified the physical eviction orders under Section 14 and delivered symbolic & physical possession on schedule.',
    bankAuthority: 'Canara Bank Recovery Branch',
    rating: 5,
  },
  {
    id: 'test-7',
    name: 'Prateek & Neha Bansal',
    role: 'Fintech Executives & HNI Investors',
    city: 'Pune, Maharashtra',
    avatarText: 'PB',
    propertyAcquired: 'Independent Villa on 600 sq.yd Plot, Koregaon Park',
    savingsOrValue: 'Saved ₹1.85 Cr · 27% Below Open Market',
    quote:
      'The entire bidding process was conducted smoothly from our laptop with their technical desk assisting us during auto-extension rounds. Within 60 days of balance payment, our registered Sale Certificate and physical keys were handed over.',
    bankAuthority: 'Bank of India Special Asset Management',
    rating: 5,
  },
  {
    id: 'test-8',
    name: 'Sanjay Chawla',
    role: 'Director, Chawla Agro Mills Pvt Ltd',
    city: 'Ahmedabad, Gujarat',
    avatarText: 'SC',
    propertyAcquired: 'Warehouse & Cold Storage Hub (4.5 Acres), Sanand',
    savingsOrValue: 'Distress Reserve Realization · 35% Discount',
    quote:
      'Finding large-scale industrial properties with clear bank documentation is difficult. Eagle Capital / Auctions & More facilitated the complete DRT auction bidding protocol, boundary demarcation, and electricity load re-connection seamlessly.',
    bankAuthority: 'DRT Ahmedabad Official Receiver',
    rating: 5,
  },
];
