/**
 * Backend Property Types & Sub-Types Configuration
 * 100% synchronized with Laravel / Filament backend options:
 *
 * ->options([
 *     'Any' => 'Any',
 *     'Residential' => 'Residential',
 *     'Commercial' => 'Commercial',
 *     'Industrial' => 'Industrial',
 *     'Land' => 'Land',
 *     'Hospitality' => 'Hospitality',
 *     'Mixed-Use' => 'Mixed-Use',
 *     'Agricultural' => 'Agricultural',
 *     'Institutional' => 'Institutional',
 *     'Special Purpose' => 'Special Purpose',
 *     'Government' => 'Government',
 *     'Other' => 'Other',
 * ])
 */

export const BACKEND_PROPERTY_TYPES = [
  'Any',
  'Residential',
  'Commercial',
  'Industrial',
  'Land',
  'Hospitality',
  'Mixed-Use',
  'Agricultural',
  'Institutional',
  'Special Purpose',
  'Government',
  'Other',
] as const;

export type BackendPropertyType = (typeof BACKEND_PROPERTY_TYPES)[number];

// Concrete property types for lead capture forms (excluding 'Any')
export const CONCRETE_PROPERTY_TYPES: Exclude<BackendPropertyType, 'Any'>[] = [
  'Residential',
  'Commercial',
  'Industrial',
  'Land',
  'Hospitality',
  'Mixed-Use',
  'Agricultural',
  'Institutional',
  'Special Purpose',
  'Government',
  'Other',
];

// Curated sub-types per property type based on Indian real estate & bank auction standards
export const PROPERTY_SUB_TYPES: Record<Exclude<BackendPropertyType, 'Any'>, string[]> = {
  Residential: [
    'Flat / Apartment',
    'Independent House / Villa',
    'Floor',
    'Builder Floor',
    'Independent Floor',
    'Penthouse',
    'Studio Apartment',
    'Duplex / Row House',
    'Residential Plot / Land',
    'Gated Community Villa',
    'Farmhouse (Residential)',
    'Other Residential',
  ],
  Commercial: [
    'Office Space',
    'Retail Shop / Showroom',
    'Commercial Building / Complex',
    'Shopping Mall Unit',
    'Commercial Godown / Warehouse',
    'Bank Branch / ATM Space',
    'Restaurant / Food Court Unit',
    'Business Center / Co-working Space',
    'Other Commercial',
  ],
  Industrial: [
    'Industrial Shed / Factory',
    'Manufacturing Plant',
    'Industrial Land / Plot',
    'Warehouse / Logistics Park',
    'Cold Storage Facility',
    'Workshop / Mill / Foundry',
    'Chemical / Pharma Unit',
    'Heavy Engineering Unit',
    'Other Industrial',
  ],
  Land: [
    'Residential Plot / NA Land',
    'Commercial Land / Plot',
    'Industrial Land / Plot',
    'Non-Agricultural (NA) Land',
    'Freehold Development Land',
    'Mixed-Use Land',
    'Corner / Highway Facing Plot',
    'Other Land',
  ],
  Hospitality: [
    'Hotel',
    'Resort',
    'Motel / Guest House / Lodge',
    'Banquet Hall / Marriage Garden',
    'Restaurant / Bar / Lounge',
    'Service Apartment / Homestay',
    'Club / Recreation Center',
    'Other Hospitality',
  ],
  'Mixed-Use': [
    'Residential cum Commercial Building',
    'Retail Shop with Residential Floors',
    'Commercial Complex with Service Apartments',
    'Mixed Development High-Rise',
    'Integrated Township Parcel',
    'Other Mixed-Use',
  ],
  Agricultural: [
    'Agricultural Farmland',
    'Farmhouse / Agro Estate',
    'Orchard / Plantation Land',
    'Dairy / Cattle Farm',
    'Poultry Farm / Hatchery',
    'Greenhouse / Polyhouse Land',
    'Agro-Processing Land',
    'Other Agricultural',
  ],
  Institutional: [
    'School / College Campus',
    'University / Training Institute',
    'Hospital / Healthcare Center',
    'Nursing Home / Clinic / Diagnostic Center',
    'Research & Development Center',
    'Community / Welfare Center',
    'Other Institutional',
  ],
  'Special Purpose': [
    'Petrol Pump / Fuel Station',
    'Cinema / Multiplex / Auditorium',
    'Sports Complex / Stadium / Turf',
    'Data Center Facility',
    'Multi-Level Car Parking',
    'Cold Chain Logistics Facility',
    'Religious / Cultural Hall',
    'Other Special Purpose',
  ],
  Government: [
    'Government Office Building',
    'Public Sector Undertaking (PSU) Asset',
    'Municipal Corporation Property',
    'Staff Quarters / Housing Colony',
    'Surplus Public Land Parcel',
    'Infrastructure / Utility Asset',
    'Other Government',
  ],
  Other: [
    'Miscellaneous Real Estate Asset',
    'Undeveloped Land Parcel',
    'Mixed Asset Portfolio',
    'Special Liquidation Asset',
    'Other Non-Classified',
  ],
};

/**
 * Returns an array of valid sub-types for the selected property type.
 * If propertyType is 'Any' or empty, returns all unique sub-types.
 * Merges any dynamic sub-types that arrived from the backend API.
 */
export function getSubTypesForPropertyType(
  propertyType?: string,
  dynamicSubTypes?: string[]
): string[] {
  const result = new Set<string>();

  if (!propertyType || propertyType === 'Any' || propertyType === 'all') {
    Object.values(PROPERTY_SUB_TYPES).forEach((list) => {
      list.forEach((st) => result.add(st));
    });
  } else {
    const list = (PROPERTY_SUB_TYPES as Record<string, string[]>)[propertyType];
    if (list) {
      list.forEach((st) => result.add(st));
    }
  }

  if (dynamicSubTypes && Array.isArray(dynamicSubTypes)) {
    dynamicSubTypes.forEach((st) => {
      if (st && typeof st === 'string' && st.trim()) {
        result.add(st.trim());
      }
    });
  }

  return Array.from(result).sort();
}
