/**
 * Category & Subcategory definitions for Scrap & Plant Machinery Auctions
 */

export const SCRAP_SUBCATEGORIES = [
  'Iron Scrap',
  'Steel Scrap',
  'Copper Scrap',
  'Aluminium Scrap',
  'Brass Scrap',
  'Battery Scrap',
  'E-Waste',
  'Plastic Scrap',
  'Paper Scrap',
  'Ferrous Scrap',
  'Non-Ferrous Scrap',
  'Machinery Scrap',
  'Other Scrap',
] as const;

export const PLANT_MACHINERY_SUBCATEGORIES = [
  'Manufacturing Plants',
  'CNC Machines',
  'Lathe Machines',
  'Generators',
  'Transformers',
  'Boilers',
  'Industrial Equipment',
  'Heavy Machinery',
  'Construction Equipment',
  'Complete Factory Units',
  'Other Industrial Machinery',
] as const;

export const AUCTION_ASSET_STATUSES = [
  { id: 'active', label: 'Active (Open)' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'closed', label: 'Closed' },
] as const;

export const AUCTION_STATUS_STRINGS = [
  'Active',
  'Upcoming',
  'Closed',
  'Suspended',
] as const;

export const SALE_BASIS_OPTIONS = [
  'As is where is',
  'As is what is',
  'Whatever there is',
  'No complaint basis',
  'Lot basis',
] as const;

export const POSSESSION_STATUS_OPTIONS = [
  'Physical Possession',
  'Symbolic Possession',
  'Vacant Handover',
  'Court Receiver Custody',
  'Liquidator Custody',
] as const;

export const AUCTION_PLATFORM_OPTIONS = [
  'BAANKNET',
  'MSTC Ltd',
  'Bankeauctions (C1 India)',
  'e-Procurement (Nextenders)',
  'eauctions.gov.in',
  'DisposalHub',
  'Direct Bank Portal',
  'IBBI E-Auction',
] as const;

export const SELLER_TYPE_OPTIONS = [
  'Bank',
  'Asset Reconstruction Company (ARC)',
  'Insolvency Professional / Liquidator',
  'Corporate / Private Entity',
  'Government / PSU Authority',
  'Debt Recovery Tribunal (DRT)',
] as const;

export const QUANTITY_UNITS = [
  'MT',
  'KG',
  'Lot',
  'Pieces',
  'Nos',
  'Units',
  'Sets',
  'Metric Tons',
] as const;

export const POPULAR_BANKS = [
  'State Bank of India',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Bank of India',
  'Indian Bank',
  'Central Bank of India',
  'IDBI Bank',
  'Federal Bank',
  'ARCIL',
  'Edelweiss ARC',
  'Phoenix ARC',
] as const;

// Convenient Aliases
export const INDIAN_BANKS_COMMON = POPULAR_BANKS;
export const AUCTION_PLATFORMS = AUCTION_PLATFORM_OPTIONS;
export const SELLER_TYPES = SELLER_TYPE_OPTIONS;
export const ASSET_UNITS = QUANTITY_UNITS;
