/**
 * Curated Fallback Real Estate & Property Images
 * High-resolution, professional architectural photography for bank auction properties
 * when no photographs have been uploaded or when an image fails to load.
 */

export const DEFAULT_PROPERTY_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

export const PROPERTY_TYPE_FALLBACK_IMAGES: Record<string, string> = {
  Residential:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  Commercial:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  Industrial:
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  Land:
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  Hospitality:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'Mixed-Use':
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  Agricultural:
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  Institutional:
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
  'Special Purpose':
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
};

/**
 * Returns a high-res contextual fallback property image based on the property type
 */
export const getPropertyFallbackImage = (propertyType?: string): string => {
  if (propertyType && PROPERTY_TYPE_FALLBACK_IMAGES[propertyType]) {
    return PROPERTY_TYPE_FALLBACK_IMAGES[propertyType];
  }
  return DEFAULT_PROPERTY_FALLBACK_IMAGE;
};
