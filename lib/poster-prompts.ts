import type { PostFormData, Category } from "./types";
import type { BrandKitPromptData } from "./prompts";

// ── Variation Style Hints ─────────────────────────────────────────

export const VARIATION_HINTS = [
  "Archetype A — Full-bleed product photo with a soft gradient overlay. Text sits in a clean left/right column with strong hierarchy. Minimal badges.",
  "Archetype B — Split panel layout: solid color panel for text + framed product image panel. Use a modern grid and clear spacing rhythm.",
  "Archetype C — Editorial card: product image in a rounded card with shadow, layered over a calm background. Use asymmetric layout and refined typography.",
  "Archetype D — Geometric modern: angled or curved color blocks, product image cutout with soft shadow, bold but clean price treatment.",
] as const;

// ── Category Color Guidance ───────────────────────────────────────

const CATEGORY_STYLES: Record<Category, string> = {
  restaurant: `Category: Restaurant / مطاعم
Color palette: warm tones — reds, oranges, deep browns, golds, cream.
Style: appetizing, inviting, food-focused. The meal image should be the hero element.
Make the price prominent with a bold badge or sticker style.`,

  supermarket: `Category: Supermarket / سوبر ماركت
Color palette: bright and energetic — yellows, reds, greens, blues.
Style: clean retail aesthetic, bold price tags, discount badges.
Multiple products can be displayed. Headline should be prominent.`,

  online: `Category: Online Store / منتجات أونلاين
Color palette: modern — blues, purples, teals, gradients.
Style: clean e-commerce aesthetic, minimalist but impactful.
Product on clean background, trust badges, shipping info visible.`,
};

// ── System Prompt ─────────────────────────────────────────────────

export function getPosterDesignSystemPrompt(
  category: Category,
  brandKit?: BrandKitPromptData
): string {
  let prompt = `You are an expert Arabic graphic designer specializing in social media marketing posters for MENA region businesses.

You will generate exactly 1 DISTINCT poster design. Across the 4 designs, make each poster clearly different in layout, typography, and visual style while staying modern and eye-comfortable for MENA audiences. The design must be a complete, self-contained HTML document with inline CSS. The HTML will be rendered at 1080x1080 pixels and screenshotted to produce a PNG poster.

${CATEGORY_STYLES[category]}

## HTML Output Rules

### Document Structure
Each design's \`html\` field must be a COMPLETE HTML document:
\`\`\`html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  /* ALL styles must be inline in this <style> tag */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 1080px;
    overflow: hidden;
    position: relative;
    font-family: 'Noto Kufi Arabic', sans-serif;
    direction: rtl;
  }
  /* ... your poster styles ... */
</style>
</head>
<body>
  <!-- poster content here -->
</body>
</html>
\`\`\`

### Image Placeholders
- Use exactly \`{{PRODUCT_IMAGE}}\` as the src for the product/meal image
- Use exactly \`{{LOGO_IMAGE}}\` as the src for the business logo
- Example: \`<img src="{{PRODUCT_IMAGE}}" style="..." />\`
- Example: \`<img src="{{LOGO_IMAGE}}" style="..." />\`
- These placeholders will be replaced with real base64 images before rendering

### Design Guidelines
- Canvas is ALWAYS 1080x1080 pixels (fixed size, use px units)
- ALL text content MUST be in Arabic (perfect, natural, and readable)
- Use RTL direction for Arabic text
- Use absolute positioning for layout elements
- The product image should be prominent and well-sized (at least 30% of canvas)
- The logo should be smaller and positioned in a corner
- Treat the product image and logo as the primary visual anchors; build the layout around them
- Ensure good contrast between text and backgrounds
- This app targets MENA audiences: avoid dark mode and neon aesthetics
- Prioritize modern, clean, eye-comfort design (soft contrast, comfortable colors)
- Use CSS gradients, box-shadows, text-shadows, and border-radius freely for visual effects
- You can use CSS patterns, overlays, and decorative elements
- Make the price prominent and eye-catching
- Include a CTA button-like element (use background + padding + border-radius)

### Typography
- Use 'Noto Kufi Arabic' font (loaded via Google Fonts link above)
- Headline: 40-80px, bold (700) or extrabold (800)
- Price: 50-100px, extrabold, eye-catching color
- CTA text: 24-36px, bold, inside a colored pill/button
- WhatsApp/contact: 18-24px, regular weight
- Subtext: 16-22px

### Creativity
- Be creative with layouts, colors, gradients, shadows, and decorative shapes
- Use CSS for decorative elements (circles, lines, geometric shapes via pseudo-elements or divs)
- Each design should look completely different from the others
- Think like a professional graphic designer — the output should look like a real marketing poster

### Quality Checklist (Must Follow)
- Use a clear grid and alignment (no random floating elements)
- Maintain consistent spacing rhythm (e.g., 8/12/16/24/32px steps)
- Limit palette to 2–4 main colors + neutrals
- Keep border radii consistent across elements
- Ensure strong visual hierarchy: headline > price > CTA > details
- Avoid cheap motifs: huge random circles, basic stickers, or low-effort badges
- Prefer subtle overlays, clean shapes, and premium composition

### Style Direction
Use creative freedom for layout, colors, and composition while staying modern and eye-comfortable for MENA audiences.`;

  if (brandKit) {
    prompt += `

## Brand Kit (MUST follow these constraints)
- Primary Color: ${brandKit.palette.primary}
- Secondary Color: ${brandKit.palette.secondary}
- Accent Color: ${brandKit.palette.accent}
- Background Color: ${brandKit.palette.background}
- Text Color: ${brandKit.palette.text}`;

    if (brandKit.styleAdjectives.length > 0) {
      prompt += `\n- Style: ${brandKit.styleAdjectives.join(", ")}`;
    }
    if (brandKit.doRules.length > 0) {
      prompt += `\n- Brand DO rules: ${brandKit.doRules.join("; ")}`;
    }
    if (brandKit.dontRules.length > 0) {
      prompt += `\n- Brand DON'T rules: ${brandKit.dontRules.join("; ")}`;
    }
  }

  return prompt;
}

// ── User Message ──────────────────────────────────────────────────

export function getPosterDesignUserMessage(data: PostFormData): string {
  switch (data.category) {
    case "restaurant":
      return `Create 1 poster design (as a complete HTML document) for this restaurant offer:
- Restaurant Name: ${data.restaurantName}
- Meal Name: ${data.mealName}
- New Price: ${data.newPrice}
- Old Price: ${data.oldPrice}
${data.offerDuration ? `- Offer Duration: ${data.offerDuration}` : ""}
- WhatsApp: ${data.whatsapp}
- CTA: ${data.cta}

Use {{PRODUCT_IMAGE}} for the meal photo and {{LOGO_IMAGE}} for the restaurant logo.
Include: restaurant name, meal name, new price (large), old price (strikethrough style), CTA button, WhatsApp number, and a discount badge.`;

    case "supermarket":
      return `Create 1 poster design (as a complete HTML document) for this supermarket offer:
- Supermarket Name: ${data.supermarketName}
- Product Name: ${data.productName}
${data.weight ? `- Weight/Size: ${data.weight}` : ""}
${data.offerDuration ? `- Offer Duration: ${data.offerDuration}` : ""}
- Headline: ${data.headline}
- WhatsApp: ${data.whatsapp}
- CTA: ${data.cta}

Use {{PRODUCT_IMAGE}} for the product photo and {{LOGO_IMAGE}} for the supermarket logo.
Include: supermarket name, headline, product name, CTA button, WhatsApp number, and offer badges.`;

    case "online":
      return `Create 1 poster design (as a complete HTML document) for this online store product:
- Shop Name: ${data.shopName}
- Product Name: ${data.productName}
- Price: ${data.price}
${data.discount ? `- Discount: ${data.discount}` : ""}
- Shipping: ${data.shipping === "free" ? "مجاني (Free)" : "مدفوع (Paid)"}
- Headline: ${data.headline}
- WhatsApp: ${data.whatsapp}
- CTA: ${data.cta}

Use {{PRODUCT_IMAGE}} for the product photo and {{LOGO_IMAGE}} for the shop logo.
Include: shop name, headline, product name, price, shipping info, CTA button, WhatsApp number.${data.discount ? " Add a discount badge." : ""}`;
  }
}
