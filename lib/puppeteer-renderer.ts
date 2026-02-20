import type { Browser } from "puppeteer-core";

let browserPromise: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // In development, use puppeteer-core with system Chrome
    const puppeteer = (await import("puppeteer-core")).default;
    return puppeteer.launch({
      headless: true,
      defaultViewport: null,
      channel: "chrome",
    });
  }

  // In production (Vercel), use puppeteer-core + @sparticuz/chromium
  const puppeteer = (await import("puppeteer-core")).default;
  const chromium = (await import("@sparticuz/chromium")).default;

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: null,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    try {
      const browser = await browserPromise;
      if (browser.connected) return browser;
    } catch {
      // Browser disconnected or crashed, launch a new one
    }
  }

  browserPromise = launchBrowser();
  return browserPromise;
}

export async function screenshotHTML(
  html: string,
  width: number,
  height: number
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 2,
    });

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 15000,
    });

    // Wait for custom fonts to load
    await page.evaluate(() => document.fonts.ready);

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
      clip: { x: 0, y: 0, width, height },
    });

    return Buffer.from(screenshot);
  } finally {
    await page.close();
  }
}

/** Close the browser instance (call during cleanup if needed) */
export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    try {
      const browser = await browserPromise;
      await browser.close();
    } catch {
      // Ignore close errors
    }
    browserPromise = null;
  }
}
