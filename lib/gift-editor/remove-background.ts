"use server";

import { generateText } from "ai";
import sharp from "sharp";
import { freeImageModel } from "@/lib/ai";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;

export type RemoveBackgroundResult = {
  imageBase64: string;
  method: "ai" | "fallback";
  warning?: string;
};

function parseImageDataUrl(dataUrl: string): { mediaType: string; buffer: Buffer } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image data URL");
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0) {
    throw new Error("Image payload is empty");
  }
  if (buffer.length > MAX_INPUT_BYTES) {
    throw new Error("Image is too large. Max allowed size is 8MB");
  }

  return { mediaType: match[1], buffer };
}

function toPngDataUrl(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function hasAlphaTransparency(image: Buffer): Promise<boolean> {
  const { channels } = await sharp(image).metadata();
  if (!channels || channels < 4) return false;

  const { data, info } = await sharp(image)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i] < 250) {
      return true;
    }
  }
  return false;
}

function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

async function removeBackgroundFallback(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const px = (x: number, y: number) => (y * width + x) * channels;

  const corners = [
    [0, 0],
    [Math.max(0, width - 1), 0],
    [0, Math.max(0, height - 1)],
    [Math.max(0, width - 1), Math.max(0, height - 1)],
  ] as const;

  const cornerColors = corners.map(([x, y]) => {
    const i = px(x, y);
    return [data[i], data[i + 1], data[i + 2]] as const;
  });

  const edgeBand = Math.max(8, Math.floor(Math.min(width, height) * 0.05));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = px(x, y);
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      let minDist = Number.POSITIVE_INFINITY;
      for (const [cr, cg, cb] of cornerColors) {
        const d = colorDistance(r, g, b, cr, cg, cb);
        if (d < minDist) minDist = d;
      }

      const isNearEdge =
        x < edgeBand || y < edgeBand || x >= width - edgeBand || y >= height - edgeBand;

      const threshold = isNearEdge ? 58 : 38;
      if (minDist < threshold) {
        data[i + 3] = 0;
      }
    }
  }

  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

async function removeBackgroundWithAI(input: Buffer, mediaType: string): Promise<Buffer | null> {
  const result = await generateText({
    model: freeImageModel,
    providerOptions: {
      google: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    },
    system:
      "You remove backgrounds from product photos. Return ONLY one PNG image with transparent background and no extra edits.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: input,
            mediaType,
          },
          {
            type: "text",
            text:
              "Remove the background completely and keep only the main foreground object. Keep original colors and edges clean. Output transparent PNG.",
          },
        ],
      },
    ],
  });

  const imageFile = result.files?.find((file) => file.mediaType?.startsWith("image/"));
  if (!imageFile) return null;

  const output = Buffer.from(imageFile.uint8Array);
  if (output.length === 0) return null;

  const asPng = await sharp(output).png().toBuffer();
  return asPng;
}

export async function removeBackgroundWithFallback(
  inputDataUrl: string
): Promise<RemoveBackgroundResult> {
  const { mediaType, buffer } = parseImageDataUrl(inputDataUrl);

  try {
    const aiResult = await removeBackgroundWithAI(buffer, mediaType);
    if (aiResult && (await hasAlphaTransparency(aiResult))) {
      return {
        imageBase64: toPngDataUrl(aiResult),
        method: "ai",
      };
    }
  } catch (error) {
    console.warn("[removeBackgroundWithFallback] AI removal failed", error);
  }

  const fallback = await removeBackgroundFallback(buffer);
  return {
    imageBase64: toPngDataUrl(fallback),
    method: "fallback",
    warning: "تم استخدام معالجة محلية لأن إزالة الخلفية بالذكاء الاصطناعي لم تكتمل.",
  };
}
