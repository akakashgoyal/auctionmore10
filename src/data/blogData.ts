/**
 * Blog Data Model & Types for Laravel Backend API
 * Connected to https://auction-admin.springstrdg.com/api/blogs
 */

export interface BlogPost {
  id: string | number;
  category: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  youtube_url?: string | null;
  video_url?: string | null;
  author_name: string;
  author_designation?: string;
  author_company?: string;
  reading_time: string | number;
  content: string;
  published_at: string;
  is_published?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
  updated_at?: string;

  // Backward compatibility convenience accessors
  author: string;
  readTime: string;
  date: string;
  image: string;
}

export interface BlogPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export const DEFAULT_BLOG_PAGINATION: BlogPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
  from: null,
  to: null,
};

// All mock/dummy blog data has been completely cleared.
// All blogs are fetched dynamically from the Laravel API.
export const BLOG_POSTS: BlogPost[] = [];
