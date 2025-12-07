/**
 * Brand Guideline Content Structures
 */

export interface BrandStorySection {
  mission?: string;
  vision?: string;
  values?: string[];
  brandPersonality?: string;
  targetAudience?: string;
}

export interface BrandVoiceSection {
  toneAttributes?: string[];
  writingStyle?: string;
  dosList?: string[];
  dontsList?: string[];
  exampleCopy?: string;
}

export interface BrandPaletteSection {
  primaryColors?: Array<{
    name: string;
    hex: string;
    usage: string;
  }>;
  secondaryColors?: Array<{
    name: string;
    hex: string;
    usage: string;
  }>;
  accentColors?: Array<{
    name: string;
    hex: string;
    usage: string;
  }>;
  colorGuidelines?: string;
}

export interface BrandTypographySection {
  primaryFont?: {
    name: string;
    weights: string[];
    usage: string;
  };
  secondaryFont?: {
    name: string;
    weights: string[];
    usage: string;
  };
  fontPairings?: string;
  typographyGuidelines?: string;
}

export interface BrandLogoSection {
  logoVariations?: string[];
  clearSpace?: string;
  minimumSize?: string;
  dosList?: string[];
  dontsList?: string[];
}

export interface BrandImagerySection {
  photographyStyle?: string;
  illustrationStyle?: string;
  iconStyle?: string;
  imageGuidelines?: string;
  exampleReferences?: string[];
}

export interface BrandGuidelineSections {
  story?: BrandStorySection;
  voice?: BrandVoiceSection;
  palette?: BrandPaletteSection;
  typography?: BrandTypographySection;
  logo?: BrandLogoSection;
  imagery?: BrandImagerySection;
  additionalNotes?: string;
}

/**
 * Product Guideline Content Structures
 */

export interface ProductPositioningSection {
  productDescription?: string;
  keyFeatures?: string[];
  uniqueSellingPoints?: string[];
  targetMarket?: string;
  competitiveDifferentiation?: string;
}

export interface ProductMessagingSection {
  headline?: string;
  tagline?: string;
  keyMessages?: string[];
  callToAction?: string;
  toneGuidance?: string;
}

export interface ProductVisualsSection {
  photographyGuidelines?: string;
  requiredAngles?: string[];
  lightingStyle?: string;
  backgroundPreferences?: string;
  compositionNotes?: string;
}

export interface ProductMarketplaceSection {
  titleFormula?: string;
  bulletPointGuidelines?: string[];
  descriptionStructure?: string;
  searchKeywords?: string[];
  categorySpecificNotes?: string;
}

export interface ProductSocialMediaSection {
  instagramGuidelines?: string;
  facebookGuidelines?: string;
  pinterestGuidelines?: string;
  twitterGuidelines?: string;
  contentThemes?: string[];
}

export interface ProductAssetRequirements {
  requiredAssetTypes?: string[];
  dimensionsAndFormats?: Array<{
    type: string;
    dimensions: string;
    format: string;
  }>;
  platformSpecificRequirements?: Record<string, string>;
}

export interface ProductGuidelineSections {
  positioning?: ProductPositioningSection;
  messaging?: ProductMessagingSection;
  visuals?: ProductVisualsSection;
  marketplace?: ProductMarketplaceSection;
  socialMedia?: ProductSocialMediaSection;
  assetRequirements?: ProductAssetRequirements;
  additionalNotes?: string;
}

/**
 * Combined Guideline Type
 */
export type GuidelineContent = BrandGuidelineSections | ProductGuidelineSections;

/**
 * Type guards
 */
export function isBrandGuideline(content: GuidelineContent): content is BrandGuidelineSections {
  return 'story' in content || 'voice' in content || 'palette' in content;
}

export function isProductGuideline(content: GuidelineContent): content is ProductGuidelineSections {
  return 'positioning' in content || 'messaging' in content || 'marketplace' in content;
}
