"use server";

import { getNanoBananaPrompt } from "./poster-prompts";
import {
  selectRecipes,
  formatRecipeForPrompt,
} from "./design-recipes";
import { generateNanoBananaImage } from "./nanobanana";
import sharp from "sharp";
import type { PostFormData } from "./types";
import type { BrandKitPromptData } from "./prompts";

// ── Types ──────────────────────────────────────────────────────────

export type GeneratedDesign = {
  name: string;
  nameAr: string;
  imageBase64: string;
};

// ── Logo Compositing ────────────────────────────────────────────

const LOGO_MAX_WIDTH = 150;
const LOGO_PADDING = 30;

async function compositeLogoOnPoster(
  posterBase64: string,
  logoBase64: string
): Promise<string> {
  const posterRaw = posterBase64.includes(",")
    ? posterBase64.split(",")[1]
    : posterBase64;
  const logoRaw = logoBase64.includes(",")
    ? logoBase64.split(",")[1]
    : logoBase64;

  const posterBuffer = Buffer.from(posterRaw, "base64");
  const logoBuffer = Buffer.from(logoRaw, "base64");

  const resizedLogo = await sharp(logoBuffer)
    .resize({ width: LOGO_MAX_WIDTH, withoutEnlargement: true })
    .png()
    .toBuffer();

  const posterMeta = await sharp(posterBuffer).metadata();
  const logoMeta = await sharp(resizedLogo).metadata();

  const posterWidth = posterMeta.width ?? 1080;
  const logoWidth = logoMeta.width ?? LOGO_MAX_WIDTH;

  const left = posterWidth - logoWidth - LOGO_PADDING;
  const top = LOGO_PADDING;

  const result = await sharp(posterBuffer)
    .composite([{ input: resizedLogo, top, left, blend: "over" }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${result.toString("base64")}`;
}

// ── Main export ─────────────────────────────────────────────────

export async function generatePoster(
  data: PostFormData,
  brandKit?: BrandKitPromptData,
  imageUrls?: string[]
): Promise<GeneratedDesign> {
  // Pick a random design recipe for creative direction
  const [recipe] = selectRecipes(data.category, 1);

  // Build the enriched prompt
  let prompt = getNanoBananaPrompt(data, brandKit);

  if (recipe) {
    const recipeDirective = formatRecipeForPrompt(recipe, data.campaignType);
    prompt += `\n\n${recipeDirective}`;
  }

  console.info("[generatePoster] start", {
    category: data.category,
    recipe: recipe?.id ?? "none",
    imageCount: imageUrls?.length ?? 0,
  });

  let imageBase64 = await generateNanoBananaImage(prompt, {
    resolution: "2K",
    aspectRatio: "1:1",
    imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : undefined,
  });

  if (data.logo) {
    console.info("[generatePoster] compositing logo");
    imageBase64 = await compositeLogoOnPoster(imageBase64, data.logo);
  }

  console.info("[generatePoster] success");

  return {
    name: recipe?.name ?? "AI Design",
    nameAr: "تصميم بالذكاء الاصطناعي",
    imageBase64,
  };
}
