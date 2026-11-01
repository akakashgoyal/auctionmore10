import { Property, UserPreferences, InterestSubmission, NotificationItem } from '../types';

const PREFS_KEY = 'auctions_user_preferences';
const INTERESTS_KEY = 'auctions_user_interests';
const NOTIFICATIONS_KEY = 'auctions_notifications';
const WATCHLIST_KEY = 'auctions_watchlist';

export const DEFAULT_PREFERENCES: UserPreferences = {
  targetCategories: ['residential', 'commercial'],
  minBudget: 20000000, // ₹2.0 Cr
  maxBudget: 150000000, // ₹15.0 Cr
  preferredCities: ['Mumbai', 'Gurugram', 'New Delhi', 'Bengaluru'],
  preferredAuthorities: ['SBI & PSU Banks', 'NCLT / IBC Liquidation', 'DRT / DRAT'],
  minDiscountPercent: 20,
  possessionPreference: 'any',
  notificationChannels: {
    whatsapp: true,
    sms: true,
    email: true,
    inApp: true,
  },
  contactInfo: {
    fullName: 'Akash Goyal',
    phone: '+91 9899897647',
    email: 'akakashgoyal123@gmail.com',
  },
  updatedAt: new Date().toISOString(),
};

// Initial realistic notifications to welcome user
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-welcome',
    title: 'Welcome to Auctions & More',
    message: 'Your investor alert preferences are active. You will receive live bid updates and deadline warnings tailored to your criteria.',
    type: 'system',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    severity: 'normal',
  },
  {
    id: 'notif-bid-cybercity',
    propertyId: 'prop-del-02',
    title: 'Live Bid Increment Triggered',
    message: 'Bid on DLF Cyber City IT Floor increased to ₹9.75 Cr (PNB Auction). Auto-extension window active.',
    type: 'bid-update',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    severity: 'urgent',
  },
  {
    id: 'notif-deadline-villa',
    propertyId: 'prop-del-04',
    title: '⚠️ EMD Submission Deadline Alert',
    message: 'EMD deadline for 4,800 Sq.Ft DLF Phase 1 Villa ends in 4 hours. Ensure portal registration & DD submission.',
    type: 'deadline-warning',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    read: false,
    severity: 'urgent',
  },
  {
    id: 'notif-match-penthouse',
    propertyId: 'prop-mum-01',
    title: '✨ 96% Match: Bandra West Sea-View Penthouse',
    message: 'New SARFAESI listing matches your budget (<₹8 Cr) and high-value residential criteria in Mumbai.',
    type: 'tailored-match',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    read: false,
    severity: 'highlight',
  },
];

// Preference helpers
export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read preferences', e);
  }
  return DEFAULT_PREFERENCES;
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, updatedAt: new Date().toISOString() }));
    window.dispatchEvent(new CustomEvent('auctions_prefs_updated', { detail: prefs }));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
}

// Interests helpers
export function getSavedInterests(): InterestSubmission[] {
  try {
    const raw = localStorage.getItem(INTERESTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read interests', e);
  }
  return [];
}

export function saveInterestSubmission(interest: InterestSubmission): void {
  try {
    const existing = getSavedInterests();
    const updated = [interest, ...existing];
    localStorage.setItem(INTERESTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('auctions_interests_updated', { detail: updated }));

    // Also dispatch a notification about interest registered
    addNotification({
      id: `notif-int-${Date.now()}`,
      propertyId: interest.propertyId,
      title: 'Diligence Dossier Requested',
      message: `Your interest for ${interest.propertyTitle} (Ref #${interest.id}) is logged. Mandate Associate will contact you on ${interest.phone}.`,
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
      severity: 'highlight',
    });
  } catch (e) {
    console.error('Failed to save interest', e);
  }
}

// Notification helpers
export function getNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read notifications', e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(notifications: NotificationItem[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('auctions_notifications_updated', { detail: notifications }));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function addNotification(notification: NotificationItem): void {
  const current = getNotifications();
  const updated = [notification, ...current];
  saveNotifications(updated);
}

export function markAllNotificationsAsRead(): void {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

// Watchlist helpers
export function getWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read watchlist', e);
  }
  return ['prop-del-02', 'prop-mum-01']; // default watched
}

export function toggleWatchlist(propertyId: string): boolean {
  try {
    const list = getWatchlist();
    const index = list.indexOf(propertyId);
    let updated: string[];
    let added = false;
    if (index >= 0) {
      updated = list.filter((id) => id !== propertyId);
      added = false;
    } else {
      updated = [...list, propertyId];
      added = true;
    }
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('auctions_watchlist_updated', { detail: updated }));
    return added;
  } catch (e) {
    console.error('Failed to toggle watchlist', e);
    return false;
  }
}

// Currency Formatter
export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh.toFixed(2).replace(/\.00$/, '')} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Calculate discount percentage
export function calculateDiscount(reservePrice: number, marketEstimate: number): number {
  if (!marketEstimate || marketEstimate <= reservePrice) return 0;
  return Math.round(((marketEstimate - reservePrice) / marketEstimate) * 100);
}

// Tailored Match Logic
export interface MatchResult {
  score: number; // 0 - 100
  isMatch: boolean;
  reasons: string[];
}

export function calculatePropertyMatch(property: Property, prefs: UserPreferences): MatchResult {
  let score = 30; // base score
  const reasons: string[] = [];

  // Category match (30 pts)
  if (prefs.targetCategories.includes(property.category)) {
    score += 30;
    reasons.push(`Matches target asset type (${property.category})`);
  }

  // Budget match (25 pts)
  if (property.reservePrice >= prefs.minBudget && property.reservePrice <= prefs.maxBudget) {
    score += 25;
    reasons.push(`Within preferred budget bracket (${formatINR(prefs.minBudget)} – ${formatINR(prefs.maxBudget)})`);
  } else if (property.reservePrice <= prefs.maxBudget * 1.15) {
    score += 12;
    reasons.push(`Near budget upper ceiling`);
  }

  // City match (25 pts)
  if (
    prefs.preferredCities.length === 0 ||
    prefs.preferredCities.includes('All India') ||
    prefs.preferredCities.some(
      (c) =>
        property.location.city.toLowerCase().includes(c.toLowerCase()) ||
        property.location.state.toLowerCase().includes(c.toLowerCase())
    )
  ) {
    score += 25;
    reasons.push(`Located in your preferred market (${property.location.city})`);
  }

  // Discount threshold match (10 pts)
  const discount = calculateDiscount(property.reservePrice, property.marketEstimate);
  if (discount >= prefs.minDiscountPercent) {
    score += 10;
    reasons.push(`High discount (${discount}% below estimated market rate)`);
  }

  // Authority match (10 pts)
  if (prefs.preferredAuthorities.length > 0 && prefs.preferredAuthorities.includes(property.authority)) {
    score += 10;
    reasons.push(`Auction authority match (${property.authority})`);
  }

  const normalizedScore = Math.min(100, Math.max(10, score));
  return {
    score: normalizedScore,
    isMatch: normalizedScore >= 70,
    reasons: reasons.slice(0, 3),
  };
}
