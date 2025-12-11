export enum AnalysisContext {
  HERO = 'Product Hero Image',
  APLUS = 'A+ Content/Detail Page Section',
  SEARCH = 'Search Results Page Screenshot',
  STOREFRONT = 'Brand Storefront',
  AB_TEST = 'A/B Comparison Test (Original vs Variant)'
}

export type VisualizationMode = 'heatmap' | 'fogmap' | 'path';

export interface Hotspot {
  id: number;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  intensity: number; // 0-1
  label?: string;
}

export interface StrategicInsight {
  scenario: 'Winning' | 'Losing' | 'Neutral';
  observation: string;
  businessImpact: string; // e.g., "High CTR likely", "Wasted Ad Spend"
  actionPlan: string[]; // Specific steps for PPC or Creative
}

export interface AnalysisReport {
  metrics: {
    visibilityScore: number;
    goalAlignmentScore: number;
    clarityScore: number;
    cognitiveLoadScore: number;
    brandImpactScore: number;
  };
  // New Business Section
  commercialProjections: {
    predictedCTR: string; // e.g. "High (>2.5%)"
    conversionLiftPotential: string; // e.g. "+15%"
    searchVolumeRelevance: string; // Insight on keyword intent matching
  };
  ppcStrategy: {
    bidRecommendation: string; // "Aggressive" or "Conservative"
    keywordFocus: string;
    adCopyAlignment: string;
  };
  strategicInsights: StrategicInsight[];
  
  // A/B Test Specific
  abTestVerdict?: {
    winner: 'Image A' | 'Image B' | 'Inconclusive';
    confidenceScore: number; // 0-100
    keyDifferentiator: string;
    reasoning: string;
  };

  hotspotsAnalysis: {
    element: string;
    attentionPercentage: string;
    rationale: string;
  }[];
  blindSpots: {
    item: string;
    insight: string;
  }[];
  recommendations: {
    title: string;
    description: string;
    type: 'visual' | 'content' | 'test';
  }[];
  dominantColors: {
    hex: string;
    name: string;
    psychology: string;
  }[];
  summary: string;
}

export interface AnalysisResult {
  report: AnalysisReport;
  hotspots: Hotspot[];    // For Image A (or single image)
  hotspotsB?: Hotspot[];  // For Image B (only in A/B test)
}

export interface UserInput {
  context: AnalysisContext | null;
}