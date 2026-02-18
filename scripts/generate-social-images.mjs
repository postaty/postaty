import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const LOGO_SVG = path.join(ROOT, "public", "name_logo_svg.svg");
const LOGO_PNG = path.join(ROOT, "public", "postaty-og-logo.png");
const OG_OUTPUT = path.join(ROOT, "app", "opengraph-image.png");
const TWITTER_OUTPUT = path.join(ROOT, "app", "twitter-image.png");

const INSPIRATION_DIRS = [
  path.join(ROOT, "public", "inspirations", "food"),
  path.join(ROOT, "public", "inspirations", "food-ramadan"),
  path.join(ROOT, "public", "inspirations", "products"),
  path.join(ROOT, "public", "inspirations", "supermarkets"),
];

async function getInspirationFiles() {
  const lists = await Promise.all(
    INSPIRATION_DIRS.map(async (dir) => {
      const entries = await fs.readdir(dir);
      return entries
        .filter((name) => /\.(jpe?g|png)$/i.test(name))
        .sort((a, b) => a.localeCompare(b))
        .map((name) => path.join(dir, name));
    }),
  );

  const selected = [];
  let index = 0;
  while (selected.length < 12 && lists.some((list) => index < list.length)) {
    for (const list of lists) {
      const file = list[index];
      if (file) selected.push(file);
      if (selected.length >= 12) break;
    }
    index += 1;
  }

  if (selected.length < 12) {
    throw new Error(`Expected at least 12 inspiration images, found ${selected.length}.`);
  }

  return selected;
}

async function createOverlayLayer(width, height) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 7, g: 15, b: 35, alpha: 0.34 },
    },
  })
    .png()
    .toBuffer();
}

function createCenterCardSvg(width, height) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.32"/>
        </filter>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" rx="36" fill="#FFFFFF" fill-opacity="0.95" filter="url(#shadow)"/>
      <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="34" fill="none" stroke="#FFFFFF" stroke-opacity="0.95" stroke-width="3"/>
    </svg>
  `);
}

async function buildGridBackground(width, height, sources) {
  const cols = 4;
  const rows = 3;
  const tileW = Math.ceil(width / cols);
  const tileH = Math.ceil(height / rows);

  const tileComposites = [];
  for (let i = 0; i < cols * rows; i += 1) {
    const file = sources[i % sources.length];
    const x = (i % cols) * tileW;
    const y = Math.floor(i / cols) * tileH;

    const tile = await sharp(file)
      .resize(tileW, tileH, { fit: "cover", position: "attention" })
      .modulate({ brightness: 0.94, saturation: 1.06 })
      .jpeg({ quality: 90 })
      .toBuffer();

    tileComposites.push({
      input: tile,
      left: x,
      top: y,
    });
  }

  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#0a1226",
    },
  })
    .composite(tileComposites)
    .png()
    .toBuffer();
}

async function composeSocialImage({ width, height, outputPath, logoBuffer, sources }) {
  const background = await buildGridBackground(width, height, sources);
  const overlay = await createOverlayLayer(width, height);

  const cardWidth = Math.round(width * 0.46);
  const cardHeight = Math.round(height * 0.38);
  const cardLeft = Math.round((width - cardWidth) / 2);
  const cardTop = Math.round((height - cardHeight) / 2);

  const logoWidth = Math.round(cardWidth * 0.8);
  const logoHeight = Math.round(cardHeight * 0.62);
  const logoLayer = await sharp(logoBuffer)
    .resize(logoWidth, logoHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const logoLeft = Math.round((width - logoWidth) / 2);
  const logoTop = Math.round((height - logoHeight) / 2);

  await sharp(background)
    .composite([
      { input: overlay, left: 0, top: 0 },
      { input: createCenterCardSvg(cardWidth, cardHeight), left: cardLeft, top: cardTop },
      { input: logoLayer, left: logoLeft, top: logoTop },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function main() {
  const sources = await getInspirationFiles();

  const rawLogo = await sharp(LOGO_SVG, { density: 700 }).png().toBuffer();
  const trimmedLogo = await sharp(rawLogo)
    .trim()
    .extend({
      top: 80,
      right: 120,
      bottom: 80,
      left: 120,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(trimmedLogo)
    .resize(1400, 1400, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(LOGO_PNG);

  await composeSocialImage({
    width: 1200,
    height: 630,
    outputPath: OG_OUTPUT,
    logoBuffer: trimmedLogo,
    sources,
  });

  await composeSocialImage({
    width: 1200,
    height: 600,
    outputPath: TWITTER_OUTPUT,
    logoBuffer: trimmedLogo,
    sources,
  });

  const outputs = [LOGO_PNG, OG_OUTPUT, TWITTER_OUTPUT];
  for (const file of outputs) {
    const info = await sharp(file).metadata();
    console.log(`${path.relative(ROOT, file)} -> ${info.width}x${info.height}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
