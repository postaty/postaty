"use client";

import { memo } from "react";
import type { GiftEditorState } from "@/lib/types";
import { OverlayUploadControl } from "./overlay-upload-control";

type ActiveLayer = "text" | "overlay";

interface GiftEditorControlsProps {
  state: GiftEditorState;
  activeLayer: ActiveLayer;
  onActiveLayerChange: (layer: ActiveLayer) => void;
  onChange: (next: GiftEditorState) => void;
  onRemoveBackground: (base64: string) => Promise<void>;
  removeBgLoading: boolean;
  removeBgMessage?: string;
}

function GiftEditorControlsImpl({
  state,
  activeLayer,
  onActiveLayerChange,
  onChange,
  onRemoveBackground,
  removeBgLoading,
  removeBgMessage,
}: GiftEditorControlsProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onActiveLayerChange("text")}
          className={`rounded-lg py-2 text-sm border ${
            activeLayer === "text"
              ? "border-primary text-primary bg-primary/10"
              : "border-card-border hover:bg-surface-2"
          }`}
        >
          طبقة النص
        </button>
        <button
          type="button"
          onClick={() => onActiveLayerChange("overlay")}
          className={`rounded-lg py-2 text-sm border ${
            activeLayer === "overlay"
              ? "border-primary text-primary bg-primary/10"
              : "border-card-border hover:bg-surface-2"
          }`}
        >
          طبقة الصورة
        </button>
      </div>

      <section className="space-y-3 p-3 rounded-xl bg-surface-2 border border-card-border">
        <h3 className="text-sm font-bold">النص</h3>
        <input
          type="text"
          value={state.text.content}
          onChange={(event) =>
            onChange({
              ...state,
              text: { ...state.text, content: event.target.value },
            })
          }
          placeholder="اكتب نص الهدية"
          className="w-full rounded-lg border border-card-border px-3 py-2 bg-surface-1 text-sm"
        />

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted flex flex-col gap-1">
            اللون
            <input
              type="color"
              value={state.text.color}
              onChange={(event) =>
                onChange({
                  ...state,
                  text: { ...state.text, color: event.target.value },
                })
              }
              className="h-9 w-full rounded cursor-pointer bg-surface-1"
            />
          </label>

          <label className="text-xs text-muted flex flex-col gap-1">
            الخط
            <select
              value={state.text.fontFamily}
              onChange={(event) =>
                onChange({
                  ...state,
                  text: {
                    ...state.text,
                    fontFamily: event.target.value as GiftEditorState["text"]["fontFamily"],
                  },
                })
              }
              className="h-9 rounded border border-card-border px-2 bg-surface-1 text-sm"
            >
              <option value="noto-kufi">Noto Kufi Arabic</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted flex flex-col gap-1">
            وزن الخط
            <select
              value={state.text.fontWeight}
              onChange={(event) =>
                onChange({
                  ...state,
                  text: {
                    ...state.text,
                    fontWeight: Number(event.target.value) as GiftEditorState["text"]["fontWeight"],
                  },
                })
              }
              className="h-9 rounded border border-card-border px-2 bg-surface-1 text-sm"
            >
              <option value={400}>400</option>
              <option value={500}>500</option>
              <option value={600}>600</option>
              <option value={700}>700</option>
              <option value={800}>800</option>
            </select>
          </label>

          <label className="text-xs text-muted flex flex-col gap-1">
            حجم الخط
            <input
              type="range"
              min={20}
              max={120}
              value={state.text.fontSize}
              onChange={(event) =>
                onChange({
                  ...state,
                  text: { ...state.text, fontSize: Number(event.target.value) },
                })
              }
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange({
              ...state,
              text: { ...state.text, x: 0.5, y: 0.2 },
            })
          }
          className="w-full rounded-lg border border-card-border py-2 text-sm hover:bg-surface-1"
        >
          إعادة موضع النص
        </button>
      </section>

      <section className="space-y-3 p-3 rounded-xl bg-surface-2 border border-card-border">
        <h3 className="text-sm font-bold">الصورة المضافة</h3>
        <OverlayUploadControl
          value={state.overlay.imageBase64}
          onChange={(base64) =>
            onChange({
              ...state,
              overlay: { ...state.overlay, imageBase64: base64 },
            })
          }
          onRemoveBackground={onRemoveBackground}
          removeBgLoading={removeBgLoading}
        />

        {state.overlay.imageBase64 && (
          <>
            <label className="text-xs text-muted flex flex-col gap-1">
              الحجم
              <input
                type="range"
                min={0.2}
                max={1.4}
                step={0.01}
                value={state.overlay.scale}
                onChange={(event) =>
                  onChange({
                    ...state,
                    overlay: { ...state.overlay, scale: Number(event.target.value) },
                  })
                }
              />
            </label>

            <label className="text-xs text-muted flex flex-col gap-1">
              تدوير الزوايا
              <input
                type="range"
                min={0}
                max={120}
                value={state.overlay.borderRadius}
                onChange={(event) =>
                  onChange({
                    ...state,
                    overlay: { ...state.overlay, borderRadius: Number(event.target.value) },
                  })
                }
              />
            </label>

            <button
              type="button"
              onClick={() =>
                onChange({
                  ...state,
                  overlay: { ...state.overlay, x: 0.5, y: 0.55 },
                })
              }
              className="w-full rounded-lg border border-card-border py-2 text-sm hover:bg-surface-1"
            >
              إعادة موضع الصورة
            </button>
          </>
        )}

        {removeBgMessage && <p className="text-xs text-muted">{removeBgMessage}</p>}
      </section>
    </div>
  );
}

export const GiftEditorControls = memo(GiftEditorControlsImpl);
