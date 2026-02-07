// ── Self-hosted Font Infrastructure ──────────────────────────────
// Font files live in public/fonts/. The HTML renderer embeds these
// via @font-face URLs so Puppeteer can load them from the running
// Next.js server.

interface FontEntry {
  family: string;
  weight: number;
  style: string;
  /** Path relative to public/ */
  file: string;
}

const FONTS: FontEntry[] = [
  // ── Noto Kufi Arabic ─────────────────────────────────────────
  { family: "Noto Kufi Arabic", weight: 400, style: "normal", file: "fonts/Noto_Kufi_Arabic/static/NotoKufiArabic-Regular.ttf" },
  { family: "Noto Kufi Arabic", weight: 500, style: "normal", file: "fonts/Noto_Kufi_Arabic/static/NotoKufiArabic-Medium.ttf" },
  { family: "Noto Kufi Arabic", weight: 600, style: "normal", file: "fonts/Noto_Kufi_Arabic/static/NotoKufiArabic-SemiBold.ttf" },
  { family: "Noto Kufi Arabic", weight: 700, style: "normal", file: "fonts/Noto_Kufi_Arabic/static/NotoKufiArabic-Bold.ttf" },
  { family: "Noto Kufi Arabic", weight: 800, style: "normal", file: "fonts/Noto_Kufi_Arabic/static/NotoKufiArabic-ExtraBold.ttf" },

  // ── IBM Plex Sans Arabic ─────────────────────────────────────
  { family: "IBM Plex Sans Arabic", weight: 400, style: "normal", file: "fonts/IBM_Plex_Sans_Arabic,Noto_Kufi_Arabic/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Regular.ttf" },
  { family: "IBM Plex Sans Arabic", weight: 500, style: "normal", file: "fonts/IBM_Plex_Sans_Arabic,Noto_Kufi_Arabic/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Medium.ttf" },
  { family: "IBM Plex Sans Arabic", weight: 600, style: "normal", file: "fonts/IBM_Plex_Sans_Arabic,Noto_Kufi_Arabic/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-SemiBold.ttf" },
  { family: "IBM Plex Sans Arabic", weight: 700, style: "normal", file: "fonts/IBM_Plex_Sans_Arabic,Noto_Kufi_Arabic/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Bold.ttf" },
];

export function getFontFaceCSS(baseUrl: string): string {
  return FONTS.map(
    ({ family, weight, style, file }) => `
@font-face {
  font-family: '${family}';
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
  src: url('${baseUrl}/${file}') format('truetype');
}`
  ).join("\n");
}

export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return "http://localhost:3000";
}
