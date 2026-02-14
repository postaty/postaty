import { renderEditedGiftToBlob } from "@/lib/gift-editor/export-edited-gift";
import type { GiftEditorState } from "@/lib/types";

class MockImage {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  naturalWidth = 1080;
  naturalHeight = 1080;

  set src(_value: string) {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

describe("renderEditedGiftToBlob", () => {
  const originalImage = global.Image;
  const originalDocument = global.document;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Image = MockImage;

    const ctx = {
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      arcTo: jest.fn(),
      closePath: jest.fn(),
      clip: jest.fn(),
      fillText: jest.fn(),
      set fillStyle(_value: string) {
      },
      set direction(_value: string) {
      },
      set textAlign(_value: string) {
      },
      set textBaseline(_value: string) {
      },
      set font(_value: string) {
      },
    } as unknown as CanvasRenderingContext2D;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).document = {
      createElement: (tagName: string) => {
        if (tagName !== "canvas") {
          throw new Error("Unexpected element request");
        }

        return {
          width: 0,
          height: 0,
          getContext: () => ctx,
          toBlob: (cb: (blob: Blob | null) => void) =>
            cb(new Blob(["png"], { type: "image/png" })),
        } as unknown as HTMLCanvasElement;
      },
    };
  });

  afterEach(() => {
    global.Image = originalImage;
    global.document = originalDocument;
  });

  it("exports a png blob when overlay is missing", async () => {
    const state: GiftEditorState = {
      text: {
        content: "هدية",
        color: "#ffffff",
        fontSize: 48,
        fontWeight: 700,
        fontFamily: "noto-kufi",
        x: 0.5,
        y: 0.2,
      },
      overlay: {
        imageBase64: null,
        x: 0.5,
        y: 0.6,
        scale: 0.7,
        borderRadius: 16,
      },
    };

    const blob = await renderEditedGiftToBlob("data:image/png;base64,AAAA", state);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/png");
  });
});
