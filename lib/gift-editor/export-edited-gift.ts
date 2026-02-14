import type { GiftEditorState } from "@/lib/types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function withRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function getFontFamily(family: GiftEditorState["text"]["fontFamily"]): string {
  if (family === "noto-kufi") {
    return '"Noto Kufi Arabic", sans-serif';
  }
  return '"Noto Kufi Arabic", sans-serif';
}

export async function renderEditedGiftToBlob(
  baseImageBase64: string,
  state: GiftEditorState
): Promise<Blob> {
  const baseImage = await loadImage(baseImageBase64);

  const canvas = document.createElement("canvas");
  canvas.width = baseImage.naturalWidth || 1080;
  canvas.height = baseImage.naturalHeight || 1080;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create canvas context");
  }

  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  if (state.overlay.imageBase64) {
    const overlay = await loadImage(state.overlay.imageBase64);
    const maxBase = Math.min(canvas.width, canvas.height) * 0.5;
    const scale = Math.max(0.1, state.overlay.scale);

    const drawWidth = maxBase * scale;
    const drawHeight = (overlay.naturalHeight / overlay.naturalWidth) * drawWidth;
    const cx = state.overlay.x * canvas.width;
    const cy = state.overlay.y * canvas.height;
    const left = cx - drawWidth / 2;
    const top = cy - drawHeight / 2;

    ctx.save();
    withRoundedRect(ctx, left, top, drawWidth, drawHeight, state.overlay.borderRadius);
    ctx.clip();
    ctx.drawImage(overlay, left, top, drawWidth, drawHeight);
    ctx.restore();
  }

  if (state.text.content.trim()) {
    const x = state.text.x * canvas.width;
    const y = state.text.y * canvas.height;

    ctx.save();
    ctx.fillStyle = state.text.color;
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${state.text.fontWeight} ${Math.max(12, state.text.fontSize)}px ${getFontFamily(state.text.fontFamily)}`;
    ctx.fillText(state.text.content, x, y);
    ctx.restore();
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to export edited gift"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}
