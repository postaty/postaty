import { z } from "zod/v4";

// ── Simple schema: AI generates full HTML directly ──────────────

export const posterDesignSchema = z.object({
  name: z.string().describe("Short English name for the design e.g. 'Neon Bold'"),
  nameAr: z.string().describe("Arabic display name e.g. 'نيون جريء'"),
  html: z.string().describe("Complete self-contained HTML document with inline CSS for the poster"),
});

export const posterDesignSetSchema = z.object({
  designs: z.array(posterDesignSchema).length(4),
});

// ── Exported Types ────────────────────────────────────────────────

export type PosterDesign = z.infer<typeof posterDesignSchema>;
export type PosterDesignSet = z.infer<typeof posterDesignSetSchema>;
