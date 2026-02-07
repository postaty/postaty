"use server";

import { generateObject } from "ai";
import { gateway } from "@/lib/ai";
import { posterDesignSchema, type PosterDesign } from "./poster-design-schema";
import {
  getPosterDesignSystemPrompt,
  getPosterDesignUserMessage,
  VARIATION_HINTS,
} from "./poster-prompts";
import type { PostFormData } from "./types";
import type { BrandKitPromptData } from "./prompts";

const LAYOUT_ARCHETYPES = [
  "Full-bleed hero image with text column",
  "Split panel (text panel + image panel)",
  "Editorial card layout with layered depth",
  "Asymmetric grid with strong hierarchy",
  "Centered product + side rail text blocks",
  "Diagonal flow (top-left to bottom-right)",
  "Modular tiles with one dominant tile",
  "Minimalist frame with floating elements",
];

const GRID_SYSTEMS = [
  "12-column grid with strict alignment",
  "8-column grid with generous gutters",
  "Rule-of-thirds with anchor points",
  "2x2 modular grid with one dominant area",
  "Vertical rhythm grid (top/mid/bottom zones)",
  "Diagonal grid with aligned text blocks",
];

const PALETTES = [
  { name: "Sand + Charcoal", colors: ["#F8F3E7", "#D9C7A3", "#8B6F4E", "#2B2B2B"] },
  { name: "Cream + Olive", colors: ["#FFF7EB", "#E6E1D3", "#8E9B7A", "#3A3A3A"] },
  { name: "Warm Beige + Terracotta", colors: ["#FAF3E8", "#E8D5C0", "#C45A3D", "#2F2F2F"] },
  { name: "Soft Sky + Navy", colors: ["#F3F7FB", "#DCE8F5", "#3A5A8C", "#1F2A3A"] },
  { name: "Stone + Copper", colors: ["#F5F4F0", "#D7D2C8", "#B87333", "#2E2E2E"] },
  { name: "Ivory + Sage", colors: ["#FDF9F2", "#E7E2D6", "#7E8F7A", "#2C2C2C"] },
  { name: "Warm Gray + Amber", colors: ["#F6F4F2", "#D9D5D1", "#E0A84A", "#2B2B2B"] },
  { name: "Blush + Cocoa", colors: ["#FFF4F2", "#EED9D3", "#B07A6B", "#3B2F2F"] },
  { name: "Pearl + Teal", colors: ["#F7FAFA", "#D7E6E6", "#2F7C7C", "#1D2D2D"] },
  { name: "Mist + Clay", colors: ["#F2F5F4", "#D5DFDC", "#B46E5A", "#2E2E2E"] },
  { name: "Linen + Bronze", colors: ["#F8F4EE", "#E2D6C7", "#A57C52", "#2F2B27"] },
  { name: "Soft Mint + Charcoal", colors: ["#F4FAF7", "#DCEFE7", "#3D6B5A", "#222826"] },
];

const SHAPE_LANGUAGE = [
  "Soft rounded corners (12-24px) and subtle curves",
  "Clean rectangles with crisp 8-12px radii",
  "Angular cuts with subtle diagonal accents",
  "Thin line accents and pill-shaped badges",
  "Layered cards with consistent radii",
  "Minimal geometric shapes (no large circles)",
];

const IMAGE_TREATMENTS = [
  "Full-bleed with soft gradient overlay",
  "Cutout with soft shadow and glow",
  "Rounded card with depth shadow",
  "Framed image with thin border and inner shadow",
  "Floating image with subtle vignette",
  "Half-bleed crop with overlay text",
];

const TYPO_SYSTEMS = [
  "Bold headline, medium subhead, large price",
  "Wide letter spacing on headline, compact body",
  "Stacked headline with oversized price token",
  "Strong headline + minimal supporting text",
  "Headline on two lines with color emphasis",
  "Price-led layout with supporting headline",
];

const BACKGROUND_STYLES = [
  "Soft radial gradient",
  "Subtle linear gradient",
  "Very light texture (paper)",
  "Clean flat background with faint overlay",
  "Two-tone split background",
  "Soft vignette edges",
];

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function buildStyleDNA(styleIndex: number): string {
  const palette = pick(PALETTES, styleIndex + 3);
  const layout = pick(LAYOUT_ARCHETYPES, styleIndex + 1);
  const grid = pick(GRID_SYSTEMS, styleIndex + 2);
  const shapes = pick(SHAPE_LANGUAGE, styleIndex + 4);
  const imageTreatment = pick(IMAGE_TREATMENTS, styleIndex + 5);
  const typography = pick(TYPO_SYSTEMS, styleIndex + 6);
  const background = pick(BACKGROUND_STYLES, styleIndex + 7);
  const seed = Math.random().toString(36).slice(2, 8);

  return [
    `Layout archetype: ${layout}`,
    `Grid system: ${grid}`,
    `Palette: ${palette.name} (${palette.colors.join(", ")})`,
    `Shape language: ${shapes}`,
    `Image treatment: ${imageTreatment}`,
    `Typography system: ${typography}`,
    `Background style: ${background}`,
    `Seed: ${seed} (must influence visual choices)`,
    "Do not reuse layout or palette from previous designs.",
  ].join("\n");
}

/** Generate a single poster design for a specific style variation */
export async function generateSingleDesign(
  data: PostFormData,
  styleIndex: number,
  brandKit?: BrandKitPromptData
): Promise<PosterDesign> {
  console.info("[generateSingleDesign] start", {
    category: data.category,
    styleIndex,
  });
  const systemPrompt = getPosterDesignSystemPrompt(data.category, brandKit);
  const userMessage = getPosterDesignUserMessage(data);
  const styleHint =
    VARIATION_HINTS[styleIndex % VARIATION_HINTS.length] ?? VARIATION_HINTS[0];
  const variationKey = styleIndex + 1;
  const styleDNA = buildStyleDNA(styleIndex);
  console.info("[generateSingleDesign] prompt_meta", {
    styleIndex,
    systemPromptLength: systemPrompt.length,
    userMessageLength: userMessage.length,
    styleHint,
  });

  const result = await generateObject({
    model: gateway("google/gemini-3-flash"),
    schema: posterDesignSchema,
    system: systemPrompt,
    prompt: `${userMessage}\n\nDesign style direction: ${styleHint}\nVariation key: ${variationKey}. Make this design clearly different from any previous variations in layout, typography, and palette.\n\nDesign DNA (must follow exactly):\n${styleDNA}`,
    temperature: 0.9,
  });

  console.info("[generateSingleDesign] success", {
    styleIndex,
    htmlLength: result.object.html?.length ?? 0,
    name: result.object.name,
  });
  return result.object;
}
