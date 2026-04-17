import { ObjectId } from 'mongodb';

/**
 * Known content keys used on the landing page. New keys can be added here as
 * new editable sections are introduced.
 */
export type SiteContentKey =
  | 'home.hero'
  | 'home.trustStrip'
  | 'home.features'
  | 'home.values'
  | 'home.howItWorks'
  | 'home.sampleChecklist'
  | 'home.cta'
  | 'home.testimonial';

/** A single editable block stored in the `site_content` collection. */
export interface SiteContent<T = unknown> {
  _id: ObjectId;
  key: SiteContentKey;
  /** Schema version for the `data` payload. Increment when shape changes. */
  version: number;
  data: T;
  updatedAt: Date;
  updatedBy?: ObjectId;
}

// ---- Payload types for each known key ------------------------------------

export interface HomeHeroContent {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface HomeTrustStripItem {
  label: string;
  /** Lucide icon name, e.g. 'Users', 'Camera', 'ShieldCheck', 'Sparkles'. */
  icon: string;
}

export interface HomeFeatureItem {
  title: string;
  description: string;
  icon: string;
  colorClass: string;
}

export interface HomeValueItem {
  title: string;
  description: string;
  icon: string;
  colorClass: string;
}

export interface HomeStepItem {
  step: string;
  title: string;
  description: string;
}

export interface HomeChecklistItem {
  label: string;
  checked: boolean;
}

export interface HomeCtaContent {
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface HomeTestimonialContent {
  quote: string;
  attribution: string;
}

export type SiteContentPayloadMap = {
  'home.hero': HomeHeroContent;
  'home.trustStrip': HomeTrustStripItem[];
  'home.features': HomeFeatureItem[];
  'home.values': HomeValueItem[];
  'home.howItWorks': HomeStepItem[];
  'home.sampleChecklist': HomeChecklistItem[];
  'home.cta': HomeCtaContent;
  'home.testimonial': HomeTestimonialContent;
};
