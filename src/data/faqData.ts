export interface FAQItem {
  id: number | string;
  category: string;
  question: string;
  answer: string;
  is_verified?: boolean;
  verified_text?: string | null;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Hardcoded mock FAQ data removed.
 * FAQs are loaded dynamically from the Laravel API (App\Models\Faq / FaqApiController).
 */
export const FAQ_DATA: FAQItem[] = [];

