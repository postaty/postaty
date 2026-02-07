import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { screenshotHTML } from "@/lib/puppeteer-renderer";
import { FORMAT_CONFIGS } from "@/lib/constants";

export const maxDuration = 60;

const requestSchema = z.object({
  html: z.string(),
  format: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { html, format } = requestSchema.parse(body);

    const config = FORMAT_CONFIGS[format as keyof typeof FORMAT_CONFIGS];
    if (!config) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    const pngBuffer = await screenshotHTML(html, config.width, config.height);

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": pngBuffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Render failed" },
      { status: 500 }
    );
  }
}
