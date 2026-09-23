export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  coverImage?: string;
}

export interface ArtworkImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
  isPrimary?: boolean;
}

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  year: number | string;
  categorySlug: string;
  categoryName: string;
  medium: string;
  dimensions: string;
  description: string;
  mainImage: string;
  images: ArtworkImage[];
  videoUrl?: string; // Direct video upload URL or external embed URL (mp4, webm, mov, vimeo, youtube)
  videoTitle?: string;
  mediaType?: 'image' | 'video' | 'mixed';
  isFeatured: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExhibitionType = 'Solo' | 'Group' | 'Biennial' | 'Museum' | 'Art Fair' | 'Other';

export interface Exhibition {
  id: string;
  title: string;
  year: number | string;
  dateString?: string;
  venue: string;
  location: string;
  type: ExhibitionType;
  description: string;
  images?: string[];
  externalLink?: string;
  order: number;
}

export interface CVDoc {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
  lastUpdated?: string;
  sizeBytes?: number;
}

export interface AboutContent {
  biography: string;
  statement: string;
  education: string;
  awards: string;
  residencies: string;
  collections: string;
  press: string;
  portraitImage?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  isEnabled: boolean;
  order?: number;
}

export type CoverPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'center'
  | 'top-left'
  | 'top-center'
  | 'top-right';

export interface SiteSettings {
  artistName: string;
  siteTitle: string;
  headerSubtitle?: string;
  tagline: string;
  coverImage: string;
  coverTagline: string;
  enterButtonText?: string;
  showCoverOnLanding?: boolean;
  customYears?: string[];
  contactEmail: string;
  studioLocation: string;
  metaDescription: string;
  seoKeywords: string;
  instagramUrl?: string;

  // Cover layout & positioning
  coverNamePosition?: CoverPosition;
  coverEnterPosition?: CoverPosition;

  // Cover typography & sizing
  coverNameFontSize?: string;
  coverSubtitleFontSize?: string;
  coverEnterFontSize?: string;
  coverFontFamily?: 'serif' | 'sans' | 'mono';
  coverNameLetterSpacing?: 'normal' | 'wide' | 'wider' | 'widest';

  // Cover colors & visual styles
  coverNameColor?: string;
  coverSubtitleColor?: string;
  coverEnterTextColor?: string;
  coverEnterBgColor?: string;
  coverEnterBorderColor?: string;
  coverEnterShape?: 'rectangle' | 'rounded' | 'pill';
  coverOverlayStyle?: 'gradient' | 'dark' | 'medium' | 'light' | 'none';

  // General site styling
  sitePrimaryColor?: string;
  siteFontFamily?: 'serif' | 'sans';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
  read: boolean;
  createdAt?: string;
}

export type ContactInquiry = ContactMessage;

export interface PortfolioData {
  settings: SiteSettings;
  categories: Category[];
  artworks: Artwork[];
  years?: string[];
  exhibitions: Exhibition[];
  about: AboutContent;
  cv: CVDoc | null;
  socialLinks: SocialLink[];
  inquiries?: ContactMessage[];
  messages?: ContactMessage[];
}

export interface AdminAuthResponse {
  success: boolean;
  token?: string;
  username?: string;
  message?: string;
}
