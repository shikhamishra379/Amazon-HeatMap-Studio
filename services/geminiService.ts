import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisContext, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const hotspotSchema = {
  type: Type.ARRAY,
  description: "List of 8-12 coordinate points representing the SEQUENCE of visual attention.",
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.NUMBER, description: "Order of attention (1, 2, 3...)" },
      x: { type: Type.NUMBER, description: "X coordinate percentage (0-100) from left" },
      y: { type: Type.NUMBER, description: "Y coordinate percentage (0-100) from top" },
      intensity: { type: Type.NUMBER, description: "Intensity 0.0 to 1.0" },
      label: { type: Type.STRING },
    },
    required: ["id", "x", "y", "intensity"],
  },
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    report: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        metrics: {
          type: Type.OBJECT,
          properties: {
            visibilityScore: { type: Type.NUMBER, description: "Score 1-10" },
            goalAlignmentScore: { type: Type.NUMBER, description: "Score 1-10" },
            clarityScore: { type: Type.NUMBER, description: "Score 1-10" },
            cognitiveLoadScore: { type: Type.NUMBER, description: "Score 1-10 (10 = High Clutter)" },
            brandImpactScore: { type: Type.NUMBER, description: "Score 1-10" },
          },
          required: ["visibilityScore", "goalAlignmentScore", "clarityScore", "cognitiveLoadScore", "brandImpactScore"],
        },
        commercialProjections: {
          type: Type.OBJECT,
          properties: {
            predictedCTR: { type: Type.STRING, description: "Estimated Click-Through Rate impact" },
            conversionLiftPotential: { type: Type.STRING, description: "Estimated impact on Sales/Conversion" },
            searchVolumeRelevance: { type: Type.STRING, description: "Relevance to high-volume keywords" },
          },
          required: ["predictedCTR", "conversionLiftPotential", "searchVolumeRelevance"],
        },
        ppcStrategy: {
          type: Type.OBJECT,
          properties: {
            bidRecommendation: { type: Type.STRING, description: "Strategic advice for Bidding or Traffic" },
            keywordFocus: { type: Type.STRING, description: "Keywords or Themes to target" },
            adCopyAlignment: { type: Type.STRING, description: "Ad Copy or Headline suggestions" },
          },
          required: ["bidRecommendation", "keywordFocus", "adCopyAlignment"],
        },
        strategicInsights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              scenario: { type: Type.STRING, enum: ["Winning", "Losing", "Neutral"] },
              observation: { type: Type.STRING },
              businessImpact: { type: Type.STRING, description: "Impact on ROI/RoAS/ACOS" },
              actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["scenario", "observation", "businessImpact", "actionPlan"],
          },
        },
        abTestVerdict: {
          type: Type.OBJECT,
          description: "ONLY populate this if analyzing two images.",
          properties: {
            winner: { type: Type.STRING, enum: ["Image A", "Image B", "Inconclusive"] },
            confidenceScore: { type: Type.NUMBER, description: "0-100" },
            keyDifferentiator: { type: Type.STRING },
            reasoning: { type: Type.STRING },
          },
          required: ["winner", "confidenceScore", "keyDifferentiator", "reasoning"],
        },
        hotspotsAnalysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              element: { type: Type.STRING },
              attentionPercentage: { type: Type.STRING, description: "e.g. '35%'" },
              rationale: { type: Type.STRING },
            },
            required: ["element", "attentionPercentage", "rationale"],
          },
        },
        blindSpots: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              insight: { type: Type.STRING },
            },
            required: ["item", "insight"],
          },
        },
        recommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["visual", "content", "test"] },
            },
            required: ["title", "description", "type"],
          },
        },
        dominantColors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING },
              name: { type: Type.STRING },
              psychology: { type: Type.STRING },
            },
            required: ["hex", "name", "psychology"],
          },
        },
      },
      required: ["summary", "metrics", "commercialProjections", "ppcStrategy", "strategicInsights", "hotspotsAnalysis", "blindSpots", "recommendations", "dominantColors"],
    },
    hotspots: hotspotSchema,
    hotspotsB: { ...hotspotSchema, description: "Hotspots specifically for Image B (Second Image)" },
  },
  required: ["report", "hotspots"],
};

const getContextSpecificInstructions = (context: AnalysisContext): string => {
  switch (context) {
    case AnalysisContext.HERO:
      return `
        SCENARIO: AMAZON MAIN IMAGE (HERO)
        * YOUR ROLE: Main Image Compliance & CTR Specialist.
        * KEY OBJECTIVE: Stop the scroll.
        * ANALYSIS FOCUS:
          1. COMPLIANCE: Pure white background? 85% Frame fill?
          2. CLARITY: Is the product instantly identifiable on Mobile?
          3. BUSINESS IMPACT: High CTR = Lower CPC.
      `;
    case AnalysisContext.APLUS:
      return `
        SCENARIO: A+ CONTENT / LIFESTYLE IMAGE
        * YOUR ROLE: Brand Storyteller & Conversion Specialist.
        * KEY OBJECTIVE: Close the sale (Conversion Rate).
        * ANALYSIS FOCUS:
          1. DESIRE: Does it show the product solving a pain point?
          2. EDUCATION: Are features clearly visualized?
      `;
    case AnalysisContext.SEARCH:
      return `
        SCENARIO: SEARCH RESULTS GRID (PPC)
        * YOUR ROLE: PPC Bid Strategist.
        * KEY OBJECTIVE: Steal market share.
        * ANALYSIS FOCUS:
          1. COMPETITIVE GAP: Does the product stand out from neighbors?
          2. DOMINANCE: Is the price/badge visible?
      `;
    case AnalysisContext.STOREFRONT:
      return `
        SCENARIO: BRAND STOREFRONT
        * YOUR ROLE: Brand Director.
        * KEY OBJECTIVE: Increase Basket Size (AOV).
        * ANALYSIS FOCUS: Navigation clarity and Brand Equity.
      `;
    case AnalysisContext.AB_TEST:
      return `
        SCENARIO: A/B COMPARISON TEST
        * YOUR ROLE: CRO Experimentation Lead.
        * KEY OBJECTIVE: Determine the statistical winner.
        * ANALYSIS FOCUS: 
          1. Compare Image A (Control) vs Image B (Variant).
          2. Which one communicates value faster?
          3. Which has less cognitive load?
        * CRITICAL: You MUST populate the 'abTestVerdict' field.
        * OUTPUT: Generate 'hotspots' for Image A and 'hotspotsB' for Image B.
      `;
    default:
      return "General Amazon Visual Analysis.";
  }
};

export const analyzeImage = async (
  files: File[],
  context: AnalysisContext
): Promise<AnalysisResult> => {
  
  const parts = await Promise.all(files.map(async (file) => ({
    inlineData: {
      data: await fileToGenerativePart(file),
      mimeType: file.type
    }
  })));

  const contextInstructions = getContextSpecificInstructions(context);

  const prompt = `
    You are Amazon HeatMap Studio AI, a World-Class Amazon PPC & CRO Strategist.
    Analyze the provided visual asset(s).
    
    CONTEXT: ${context}
    FILES PROVIDED: ${files.length}

    ${contextInstructions}

    ---
    
    GENERAL MISSION:
    1. VISUAL AUDIT: Track the eye path.
    2. COMMERCIAL PROJECTIONS: Estimate financial impact.
    3. ACTION PLAN: Provide specific, actionable advice.

    IF A/B TEST:
    - Image 1 is "Image A" (Control).
    - Image 2 is "Image B" (Variant).
    - Provide separate hotspots for each if possible, or focused analysis on the winner.
    
    Output strictly in the requested JSON schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          ...parts,
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, 
      },
    });

    let text = response.text || "{}";
    
    // Cleanup Markdown if present
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "");
    }

    const result = JSON.parse(text);

    if (!result.report || !result.hotspots || !result.report.metrics) {
        console.error("Invalid AI Response structure:", result);
        throw new Error("AI response was incomplete. Please try again.");
    }

    return result as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};