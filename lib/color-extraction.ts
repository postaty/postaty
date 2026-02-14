/**
 * Client-side color extraction utility.
 * Extracts dominant colors from an image using the HTML Canvas API.
 * No external dependencies — uses Image + CanvasRenderingContext2D.
 */

const MAX_DIMENSION = 100;
const BUCKET_LEVELS = 16;
const BUCKET_SIZE = Math.ceil(256 / BUCKET_LEVELS); // 16

/**
 * Extracts dominant colors from a base64 data URL image.
 *
 * @param imageDataUrl - A base64-encoded data URL (e.g. "data:image/png;base64,...")
 * @param count - Number of dominant colors to return (default: 5)
 * @returns An array of hex color strings, sorted by frequency (most dominant first)
 */
export async function extractDominantColors(
  imageDataUrl: string,
  count: number = 5
): Promise<string[]> {
  const imageData = await getImagePixelData(imageDataUrl);
  const pixels = collectPixels(imageData);
  const filtered = filterExtremes(pixels);
  const buckets = quantizeIntoBuckets(filtered);
  const sorted = sortBucketsByFrequency(buckets);
  const topColors = sorted.slice(0, count).map(bucketCenterToHex);
  return topColors;
}

/**
 * Loads the image data URL into an offscreen canvas and returns the raw pixel data.
 * The image is scaled down to at most MAX_DIMENSION x MAX_DIMENSION for performance.
 */
function getImagePixelData(dataUrl: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const { width, height } = scaleDown(img.width, img.height, MAX_DIMENSION);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      resolve(imageData);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image from data URL"));
    };

    img.src = dataUrl;
  });
}

/**
 * Scales dimensions down proportionally so neither exceeds maxDim.
 */
function scaleDown(
  w: number,
  h: number,
  maxDim: number
): { width: number; height: number } {
  if (w <= maxDim && h <= maxDim) {
    return { width: w, height: h };
  }
  const ratio = Math.min(maxDim / w, maxDim / h);
  return {
    width: Math.max(1, Math.round(w * ratio)),
    height: Math.max(1, Math.round(h * ratio)),
  };
}

type RGB = [number, number, number];

/**
 * Extracts all RGB pixels from ImageData, ignoring fully transparent pixels.
 */
function collectPixels(imageData: ImageData): RGB[] {
  const { data } = imageData;
  const pixels: RGB[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    // Skip fully transparent pixels
    if (a < 10) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  return pixels;
}

/**
 * Filters out near-white and near-black pixels to focus on meaningful colors.
 * Near-white: all channels > 240
 * Near-black: all channels < 15
 */
function filterExtremes(pixels: RGB[]): RGB[] {
  return pixels.filter(([r, g, b]) => {
    const isNearWhite = r > 240 && g > 240 && b > 240;
    const isNearBlack = r < 15 && g < 15 && b < 15;
    return !isNearWhite && !isNearBlack;
  });
}

interface ColorBucket {
  rIndex: number;
  gIndex: number;
  bIndex: number;
  count: number;
}

/**
 * Quantizes pixels into buckets by dividing each RGB channel into BUCKET_LEVELS levels.
 * Returns an array of buckets with their pixel counts.
 */
function quantizeIntoBuckets(pixels: RGB[]): ColorBucket[] {
  const bucketMap = new Map<string, ColorBucket>();

  for (const [r, g, b] of pixels) {
    const rIndex = Math.min(Math.floor(r / BUCKET_SIZE), BUCKET_LEVELS - 1);
    const gIndex = Math.min(Math.floor(g / BUCKET_SIZE), BUCKET_LEVELS - 1);
    const bIndex = Math.min(Math.floor(b / BUCKET_SIZE), BUCKET_LEVELS - 1);
    const key = `${rIndex},${gIndex},${bIndex}`;

    const existing = bucketMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      bucketMap.set(key, { rIndex, gIndex, bIndex, count: 1 });
    }
  }

  return Array.from(bucketMap.values());
}

/**
 * Sorts buckets by pixel count in descending order (most frequent first).
 */
function sortBucketsByFrequency(buckets: ColorBucket[]): ColorBucket[] {
  return buckets.sort((a, b) => b.count - a.count);
}

/**
 * Converts a bucket's index coordinates to the center RGB value of that bucket,
 * then formats it as a hex color string.
 */
function bucketCenterToHex(bucket: ColorBucket): string {
  const r = Math.round(bucket.rIndex * BUCKET_SIZE + BUCKET_SIZE / 2);
  const g = Math.round(bucket.gIndex * BUCKET_SIZE + BUCKET_SIZE / 2);
  const b = Math.round(bucket.bIndex * BUCKET_SIZE + BUCKET_SIZE / 2);

  // Clamp to 0-255
  const clamp = (v: number) => Math.max(0, Math.min(255, v));

  return rgbToHex(clamp(r), clamp(g), clamp(b));
}

/**
 * Converts RGB values (0-255) to an uppercase hex color string like "#FF5733".
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => v.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
