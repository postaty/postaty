import type { PostFormData, Category, CampaignType } from "./types";
import type { BrandKitPromptData } from "./prompts";

// ── Category Color Guidance ───────────────────────────────────────

const CATEGORY_STYLES: Record<Category, string> = {
  restaurant: `Category: Restaurant / مطاعم
Color palette: warm tones — reds, terracotta, golds, cream.
Style: appetizing, inviting, food-focused. The meal image should be the hero element.
Make the price prominent with a bold but clean badge or pill.`,

  supermarket: `Category: Supermarket / سوبر ماركت
Color palette: fresh and energetic — warm reds, greens, yellows, creams.
Style: clean retail aesthetic, bold price tags, discount badges.
The provided product image(s) should be the hero element — display them large and prominent.
Headline should be bold and eye-catching. Leave the top-right corner clean for logo overlay.`,

  online: `Category: Online Store / منتجات أونلاين
Color palette: modern — deep teals, warm neutrals, bold accent color.
Style: clean e-commerce aesthetic, minimalist but impactful.
The provided product image should be the hero element — display it large on a clean background.
Show price prominently with trust badges and shipping info. Leave the top-right corner clean for logo overlay.`,
};

const CAMPAIGN_STYLE_GUIDANCE: Record<CampaignType, string> = {
  standard: "",
  ramadan: `Campaign: Ramadan special (MENA)
Palette: deep indigo/navy, warm gold, emerald accents, soft cream.
Motifs: subtle crescent moon, lantern, or geometric arabesque pattern watermark (very low opacity).
Tone: calm, premium, spiritual yet modern. Avoid clutter and cartoonish icons.`,
  eid: `Campaign: Eid offer (MENA)
Palette: warm gold, celebratory green, clean neutrals.
Motifs: minimal sparkles, starbursts, confetti dots (small and tasteful).
Tone: joyful, premium, modern. Keep the layout clean and balanced.`,
};

// ── NanoBanana Pro Prompt (text-to-image) ────────────────────────

export function getNanoBananaPrompt(
  data: PostFormData,
  brandKit?: BrandKitPromptData
): string {
  const categoryStyle = CATEGORY_STYLES[data.category];
  const campaignStyle = CAMPAIGN_STYLE_GUIDANCE[data.campaignType];

  let prompt = `Create a professional Arabic social media marketing poster image (1080x1080 square).

${categoryStyle}
${campaignStyle ? `\n${campaignStyle}\n` : ""}
Design rules:
- ALL text MUST be in Arabic
- RTL text direction
- Headlines and prices: large and bold (think billboard scale — 60-120px equivalent)
- 3-4 color palette max (plus white/black)
- Professional studio-quality composition
- Strong visual hierarchy: hero element > price > CTA > details
- Layer elements for depth — overlap images and text intentionally
- Fill the canvas fully, no wasted whitespace
- CRITICAL: All reference images provided are PRODUCT photos — feature them as the hero element of the design. Do NOT generate any logo or brand mark. The TOP-RIGHT corner of the poster (approximately 180x180 pixels area) MUST be left clean and empty — use only a solid or gradient background color in that region with NO text, NO graphics, NO decorative elements. This area is reserved for logo overlay in post-processing.
`;

  switch (data.category) {
    case "restaurant":
      prompt += `
Poster details:
- Restaurant: "${data.restaurantName}"
- Meal: "${data.mealName}"
- New price: ${data.newPrice}
- Old price: ${data.oldPrice} (show strikethrough)
${data.offerDuration ? `- Offer duration: ${data.offerDuration}` : ""}
- WhatsApp: ${data.whatsapp}
- CTA button: "${data.cta}"
- Include a discount badge, the restaurant name as logo text, and make the meal name prominent`;
      break;
    case "supermarket":
      prompt += `
Poster details:
- Supermarket: "${data.supermarketName}"
- Product: "${data.productName}"
${data.weight ? `- Weight/Size: ${data.weight}` : ""}
${data.offerDuration ? `- Offer duration: ${data.offerDuration}` : ""}
- Headline: "${data.headline}"
- WhatsApp: ${data.whatsapp}
- CTA button: "${data.cta}"
- Include offer badges, the supermarket name as logo text, and make the headline prominent`;
      break;
    case "online":
      prompt += `
Poster details:
- Shop: "${data.shopName}"
- Product: "${data.productName}"
- Price: ${data.price}
${data.discount ? `- Discount: ${data.discount}` : ""}
- Shipping: ${data.shipping === "free" ? "Free shipping (مجاني)" : "Paid shipping"}
- Headline: "${data.headline}"
- WhatsApp: ${data.whatsapp}
- CTA button: "${data.cta}"
- Include the shop name as logo text, price prominently, and shipping info${data.discount ? ". Add a discount badge." : ""}`;
      break;
  }

  if (brandKit) {
    prompt += `\n\nBrand colors: primary ${brandKit.palette.primary}, secondary ${brandKit.palette.secondary}, accent ${brandKit.palette.accent}, background ${brandKit.palette.background}, text ${brandKit.palette.text}.`;
    if (brandKit.styleAdjectives.length > 0) {
      prompt += ` Style: ${brandKit.styleAdjectives.join(", ")}.`;
    }
    if (brandKit.doRules.length > 0) {
      prompt += ` MUST: ${brandKit.doRules.join("; ")}.`;
    }
    if (brandKit.dontRules.length > 0) {
      prompt += ` MUST NOT: ${brandKit.dontRules.join("; ")}.`;
    }
  }

  prompt += `\n\nMake this design unique, bold, and visually striking. Professional quality suitable for Instagram/Facebook.`;

  return prompt;
}
