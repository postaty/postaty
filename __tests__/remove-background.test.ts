import sharp from "sharp";
import { generateText } from "ai";
import { removeBackgroundWithFallback } from "@/lib/gift-editor/remove-background";

jest.mock("@/lib/ai", () => ({
  freeImageModel: {},
}));

jest.mock("ai", () => ({
  generateText: jest.fn(),
}));

const mockedGenerateText = generateText as jest.Mock;

async function makePngDataUrl(withTransparency: boolean): Promise<string> {
  const alpha = withTransparency ? 0 : 255;
  const rgba = Buffer.from([
    255, 0, 0, 255,
    255, 0, 0, alpha,
    255, 0, 0, 255,
    255, 0, 0, 255,
  ]);

  const png = await sharp(rgba, {
    raw: {
      width: 2,
      height: 2,
      channels: 4,
    },
  })
    .png()
    .toBuffer();

  return `data:image/png;base64,${png.toString("base64")}`;
}

describe("removeBackgroundWithFallback", () => {
  beforeEach(() => {
    mockedGenerateText.mockReset();
  });

  it("throws for invalid data url", async () => {
    await expect(removeBackgroundWithFallback("invalid-data")).rejects.toThrow(
      "Invalid image data URL"
    );
  });

  it("returns ai method when transparent output is produced", async () => {
    const transparent = await makePngDataUrl(true);
    const transparentBuffer = Buffer.from(transparent.split(",")[1], "base64");

    mockedGenerateText.mockResolvedValue({
      files: [
        {
          mediaType: "image/png",
          uint8Array: new Uint8Array(transparentBuffer),
        },
      ],
    });

    const input = await makePngDataUrl(false);
    const result = await removeBackgroundWithFallback(input);

    expect(result.method).toBe("ai");
    expect(result.imageBase64.startsWith("data:image/png;base64,")).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it("falls back when ai output does not contain transparency", async () => {
    const opaque = await makePngDataUrl(false);
    const opaqueBuffer = Buffer.from(opaque.split(",")[1], "base64");

    mockedGenerateText.mockResolvedValue({
      files: [
        {
          mediaType: "image/png",
          uint8Array: new Uint8Array(opaqueBuffer),
        },
      ],
    });

    const input = await makePngDataUrl(false);
    const result = await removeBackgroundWithFallback(input);

    expect(result.method).toBe("fallback");
    expect(result.warning).toBeDefined();
    expect(result.imageBase64.startsWith("data:image/png;base64,")).toBe(true);
  });
});
