export type PropertyCategory =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'land'
  | 'hospitality'
  | 'mixed-use'
  | 'agricultural'
  | 'institutional'
  | 'special-purpose'
  | 'government'
  | 'other'
  | string;

export type AuthorityType = 
  | 'SBI & PSU Banks' 
  | 'DRT / DRAT' 
  | 'NCLT / IBC Liquidation' 
  | 'Private Banks' 
  | 'Municipal & Govt';

export type AuctionStatus = 'upcoming' | 'closing-soon' | 'live-today' | 'closed';

export type PossessionType = 'Physical Possession' | 'Symbolic Possession' | 'Vacant Handover' | string;

export interface PropertyPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface PropertyDocument {
  id: number;
  property_id?: number;
  document_name: string;
  document_path: string;
  document_type: string;
  visibility?: string;
  url?: string;
}

export interface PropertyImage {
  id: number;
  property_id?: number;
  image_path?: string;
  image_url?: string | null;
  is_primary?: boolean;
  sort_order?: number;
}

export interface PropertyVideo {
  id: number;
  property_id?: number;
  video_path?: string | null;
  video_url?: string | null;
  video_title?: string | null;
  sort_order?: number;
}

export interface Property {
  id: string;
  title: string;
  category: PropertyCategory;
  propertyType: string;
  propertySubType?: string;
  propertyReferenceNo?: string;
  propertyStatus?: string;
  slug?: string;
  featured?: boolean;
  description: string;

  location: {
    address: string;
    locality: string;
    city: string;
    state: string;
    pinCode: string;
  };
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  stateId?: number;
  cityId?: number;
  stateName?: string;
  cityName?: string;
  areaName?: string;

  reservePrice: number; // in INR
  marketEstimate: number; // in INR
  postAuctionPrice?: number; // Post-Auction / Bank Sale Price in INR
  postAuctionPriceDate?: string; // Date when post-auction price was updated/offered
  emdAmount: number; // Earnest Money Deposit
  bidIncrement: number;

  totalArea?: number;
  areaUnit?: string;
  builtUpArea?: number;
  carpetAreaSqFt?: number;
  landArea?: number;
  plotAreaSqYards?: number;
  frontage?: string;
  depth?: string;

  numberOfRooms?: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  numberOfKitchens?: number;
  numberOfBalconies?: number;
  numberOfParkingSpaces?: number;
  numberOfShops?: number;
  numberOfOffices?: number;
  numberOfUnits?: number;
  numberOfFloors?: number;

  constructionStatus?: string;
  roadAccess?: string;
  boundaryWall?: string;

  auctionCategory?: string;
  authority: AuthorityType;
  bankName: string;
  branch?: string;
  borrowerName?: string;
  borrowerRef?: string;
  auctionReferenceNo?: string;
  bankerAuctionNote?: string;
  sarfaesiActSection?: string;
  possessionStatus: PossessionType;
  titleClearanceStatus: string;

  auctionDate: string; // ISO string
  emdDeadline: string; // ISO string
  inspectionDate: string;
  status: AuctionStatus;
  currentHighestBid?: number;
  totalBidsPlaced?: number;

  amenities?: string[];
  images: string[];
  rawImages?: PropertyImage[];
  documents?: PropertyDocument[];
  videos?: PropertyVideo[];
  highlights: string[];
  diligenceSummary?: {
    titleSearchAdvocate: string;
    valuerName: string;
    circleRateEst: string;
    duesPending: string;
  };
  raw?: any;
}

export interface UserPreferences {
  id?: string;
  targetCategories: PropertyCategory[];
  minBudget: number; // in INR
  maxBudget: number; // in INR
  preferredCities: string[];
  preferredAuthorities: string[];
  minDiscountPercent: number; // e.g. 20 (meaning 20% below market value)
  possessionPreference: 'any' | 'physical-only';
  notificationChannels: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    inApp: boolean;
  };
  contactInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  updatedAt: string;
}

export interface InterestSubmission {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  reservePrice: number;
  applicantName: string;
  phone: string;
  email: string;
  investorType: 'Individual First-Time Buyer' | 'High Net-worth Investor (HNI)' | 'Corporate / Institutional' | 'Builder / Real Estate Fund';
  bidCapacityBracket: string;
  requestedServices: {
    siteInspection: boolean;
    legalDueDiligence: boolean;
    emdPortalAssistance: boolean;
    biddingRepresentation: boolean;
    possessionHandover: boolean;
  };
  additionalNotes?: string;
  submittedAt: string;
  status: 'Pending Review' | 'Dossier Dispatched' | 'Counsel Scheduled';
}

export interface NotificationItem {
  id: string;
  propertyId?: string;
  title: string;
  message: string;
  type: 'bid-update' | 'deadline-warning' | 'tailored-match' | 'system' | 'inspection-alert';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  severity?: 'normal' | 'urgent' | 'highlight';
}

export interface FilterCriteria {
  searchQuery: string;
  category: string; // 'all' or PropertyCategory
  city: string; // 'all' or city name
  authority: string; // 'all' or AuthorityType
  priceRange: [number, number]; // [min, max]
  status: string; // 'all' or AuctionStatus
  onlyTailored: boolean;
}

export interface TeamMember {
  id: number | string;
  name: string;
  designation: string;
  experience: string;
  profile_image: string;
  about: string;
  sort_order: number;
}

// ----------------------------------------------------------------------
// Auction Assets (Scrap & Plant Machinery Auctions)
// ----------------------------------------------------------------------

export type AuctionAssetCategory = 'Scrap' | 'Plant & Machinery' | string;

export interface AuctionAsset {
  id: number;
  reference_no: string;
  title: string;
  status: 'Active' | 'Upcoming' | 'Closed' | 'Suspended' | 'active' | 'upcoming' | 'closed' | string;
  category: 'Scrap' | 'Plant & Machinery' | string;
  sub_type?: string | null;
  listing_source?: string | null;
  state: string;
  city: string;
  detail_address?: string;
  complete_address?: string | null;
  possession_status?: string | null;
  condition?: string | null;
  sale_basis?: string | null;
  quantity?: number | string | null;
  unit?: string | null;
  reserve_price_basis?: string | null;
  reserve_price: number | string;
  emd_amount: number | string;
  emd_submission_at?: string | null;
  emd_submission_date?: string | null;
  auction_at?: string | null;
  auction_date?: string | null;
  auction_platform?: string | null;
  seller_type?: string | null;
  bank_name?: string | null;
  seller_name?: string | null;
  inspection_details?: string | null;
  coordinator_name?: string | null;
  coordinator_phone?: string | null;
  coordinator_email?: string | null;
  plant_address?: string | null;
  internal_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  image_path?: string | null;
  image_url?: string | null;
  asset_image?: string | null;
  notice_path?: string | null;
  notice_url?: string | null;
  auction_notice_pdf?: string | null;
}

export interface AuctionAssetPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface AuctionAssetFilterParams {
  category?: string;
  sub_type?: string;
  state?: string;
  city?: string;
  bank_name?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  auction_date?: string;
  search?: string;
  reference_no?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface AuctionAssetStats {
  total_scrap: number;
  total_plant_machinery: number;
  active: number;
  upcoming: number;
  closed: number;
  total: number;
  totalScrap: number;
  totalPlantMachinery: number;
  activeAuctions: number;
  upcomingAuctions: number;
  closedAuctions: number;
}

export interface AuctionAssetFilterMetadata {
  scrapSubTypes: string[];
  machinerySubTypes: string[];
  allSubTypes: string[];
  states: string[];
  citiesByState: Record<string, string[]>;
  allCities: string[];
  banks: string[];
  statuses: string[];
  scrapCount: number;
  machineryCount: number;
  totalCount: number;
}

// ----------------------------------------------------------------------
// Authority Properties Module Types
// ----------------------------------------------------------------------

export interface AuthorityInfo {
  id: number;
  name: string;
  short_name?: string | null;
  state?: string | null;
  city?: string | null;
  website?: string | null;
  description?: string | null;
  logo?: string | null;
  is_active?: boolean;
}

export interface AuthorityPropertyImage {
  id: number;
  image_path?: string | null;
  image_url: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface AuthorityPropertyDocument {
  id: number;
  title: string;
  document_type?: string | null;
  file_path?: string | null;
  file_url: string;
  visibility?: string | null;
}

export interface AuthorityPropertyAmenity {
  id: number;
  authority_property_id?: number;
  name: string;
  category?: string | null;
  distance_km?: string | number | null;
  description?: string | null;
  sort_order: number;
}

export interface AuthorityPropertyMilestone {
  id: number;
  authority_property_id?: number;
  title: string;
  amount?: number | string | null;
  percentage?: number | string | null;
  due_days?: number | string | null;
  description?: string | null;
  sort_order: number;
}

export interface AuthorityProperty {
  id: number;
  authority_id: number | null;
  title: string;
  property_code?: string | null;
  property_type?: string | null;
  property_sub_type?: string | null;
  listing_source?: string | null;
  scheme_name?: string | null;
  state_id?: number | null;
  city_id?: number | null;
  state_name?: string | null;
  city_name?: string | null;
  address?: string | null;
  area?: number | string | null;
  area_unit?: string | null;
  reserve_price_basis?: string | null;
  reserve_price?: number | null;
  emd_amount?: number | null;
  emd_submission_at?: string | null;
  auction_start_at?: string | null;
  auction_end_at?: string | null;
  auction_platform?: string | null;
  seller_type?: string | null;
  seller_name?: string | null;
  inspection_details?: string | null;
  description?: string | null;
  status?: string | null;
  is_published: boolean;
  primary_image?: string | null;
  authority?: AuthorityInfo | null;
  state?: { id: number; name: string; code?: string } | null;
  city?: { id: number; state_id?: number; name: string } | null;
  images: AuthorityPropertyImage[];
  documents: AuthorityPropertyDocument[];
  amenities: AuthorityPropertyAmenity[];
  payment_milestones: AuthorityPropertyMilestone[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AuthorityPropertyPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface AuthorityPropertyFilterParams {
  search?: string;
  authority_id?: number | string;
  property_type?: string;
  property_sub_type?: string;
  state_id?: number | string;
  city_id?: number | string;
  min_price?: number | string;
  max_price?: number | string;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface AuthorityFilterMetadata {
  authorities: AuthorityInfo[];
  propertyTypes: string[];
  propertySubTypes: string[];
  states: { id: number; name: string }[];
  cities: { id: number; state_id?: number | null; name: string }[];
  statuses: string[];
  totalCount: number;
}


