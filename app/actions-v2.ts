"use server";

import { generateSingleDesign } from "@/lib/generate-designs";
import { postFormDataSchema } from "@/lib/validation";
import type { PostFormData, OutputFormat, PosterResult } from "@/lib/types";
import type { BrandKitPromptData } from "@/lib/prompts";

/** Generate a single poster (called 4 times in parallel from the client) */
export async function generateSinglePoster(
  data: PostFormData,
  styleIndex: number,
  brandKit?: BrandKitPromptData
): Promise<PosterResult> {
  console.info("[generateSinglePoster] start", {
    category: data.category,
    styleIndex,
  });
  // Validate
  const validation = postFormDataSchema.safeParse(data);
  if (!validation.success) {
    console.error("[generateSinglePoster] validation_failed", {
      styleIndex,
      issues: validation.error.issues.map((i) => i.message),
    });
    throw new Error(
      `Validation failed: ${validation.error.issues.map((i) => i.message).join(", ")}`
    );
  }

  const format: OutputFormat = data.formats[0];
  const images = extractImages(data);
  console.info("[generateSinglePoster] images_meta", {
    styleIndex,
    productLength: images.product?.length ?? 0,
    logoLength: images.logo?.length ?? 0,
  });

  try {
    const design = await generateSingleDesign(data, styleIndex, brandKit);
    const normalizedHtml = normalizeHtml(design.html);
    if (normalizedHtml.length < 80) {
      console.error("[generateSinglePoster] html_too_short", {
        styleIndex,
        length: normalizedHtml.length,
      });
      throw new Error("Generated HTML is empty or too short");
    }

    const hydratedHtml = injectImages(normalizedHtml, images);
    const placeholdersRemaining =
      hydratedHtml.includes("{{PRODUCT_IMAGE}}") ||
      hydratedHtml.includes("{{LOGO_IMAGE}}");

    console.info("[generateSinglePoster] html_meta", {
      styleIndex,
      normalizedLength: normalizedHtml.length,
      hydratedLength: hydratedHtml.length,
      hasHtmlTag: /<html[\s>]/i.test(hydratedHtml),
      hasBodyTag: /<body[\s>]/i.test(hydratedHtml),
      placeholdersRemaining,
    });

    const result: PosterResult = {
      designIndex: styleIndex,
      format,
      html: hydratedHtml,
      status: "complete",
      designName: design.name,
      designNameAr: design.nameAr,
    };
    console.info("[generateSinglePoster] success", {
      styleIndex,
      htmlLength: result.html.length,
    });
    return result;
  } catch (error) {
    console.error("[generateSinglePoster] failed", {
      styleIndex,
      message: error instanceof Error ? error.message : "Generation failed",
    });
    return {
      designIndex: styleIndex,
      format,
      html: "",
      status: "error",
      error: error instanceof Error ? error.message : "Generation failed",
      designName: `Design ${styleIndex + 1}`,
      designNameAr: `تصميم ${styleIndex + 1}`,
    };
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function injectImages(
  html: string,
  images: { product: string; logo: string }
): string {
  return html
    .replace(/\{\{PRODUCT_IMAGE\}\}/g, images.product)
    .replace(/\{\{LOGO_IMAGE\}\}/g, images.logo);
}

function extractImages(data: PostFormData): { product: string; logo: string } {
  switch (data.category) {
    case "restaurant":
      return { product: data.mealImage, logo: data.logo };
    case "supermarket":
      return { product: data.productImages[0], logo: data.logo };
    case "online":
      return { product: data.productImage, logo: data.logo };
  }
}

function normalizeHtml(rawHtml: string): string {
  let html = rawHtml.trim();

  // Strip markdown code fences if present
  if (html.startsWith("```")) {
    html = html.replace(/^```[a-zA-Z]*\s*/i, "").replace(/\s*```$/, "");
  }

  // If it's not a full document, wrap it
  if (!/<html[\s>]/i.test(html)) {
    html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 1080px;
    overflow: hidden;
    position: relative;
    font-family: 'Noto Kufi Arabic', sans-serif;
    direction: rtl;
    background: #ffffff;
  }
</style>
</head>
<body>
${html}
</body>
</html>`;
  }

  return html;
}
