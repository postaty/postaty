"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { GiftEditorState } from "@/lib/types";

type ActiveLayer = "text" | "overlay";

interface GiftEditorCanvasProps {
  baseImageBase64: string;
  state: GiftEditorState;
  activeLayer: ActiveLayer;
  onActiveLayerChange: (layer: ActiveLayer) => void;
  onChange: (next: GiftEditorState) => void;
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function GiftEditorCanvasImpl({
  baseImageBase64,
  state,
  activeLayer,
  onActiveLayerChange,
  onChange,
}: GiftEditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragLayerRef = useRef<ActiveLayer | null>(null);
  const [overlayRatio, setOverlayRatio] = useState(1);

  useEffect(() => {
    if (!state.overlay.imageBase64) return;

    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setOverlayRatio(img.naturalHeight / img.naturalWidth);
      }
    };
    img.src = state.overlay.imageBase64;
  }, [state.overlay.imageBase64]);

  const updatePosition = (event: PointerEvent | React.PointerEvent<HTMLDivElement>) => {
    const el = canvasRef.current;
    if (!el || !dragLayerRef.current) return;

    const rect = el.getBoundingClientRect();
    const x = clamp01((event.clientX - rect.left) / rect.width);
    const y = clamp01((event.clientY - rect.top) / rect.height);

    if (dragLayerRef.current === "text") {
      onChange({
        ...state,
        text: {
          ...state.text,
          x,
          y,
        },
      });
      return;
    }

    onChange({
      ...state,
      overlay: {
        ...state.overlay,
        x,
        y,
      },
    });
  };

  const onPointerDown = (
    layer: ActiveLayer,
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    dragLayerRef.current = layer;
    onActiveLayerChange(layer);
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePosition(event);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragLayerRef.current) return;
    updatePosition(event);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragLayerRef.current) return;
    dragLayerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const overlaySize = `${Math.max(18, state.overlay.scale * 50)}%`;

  return (
    <div className="w-full">
      <div
        ref={canvasRef}
        className="relative w-full aspect-square rounded-2xl overflow-hidden border border-card-border bg-surface-2 touch-none"
      >
        <img src={baseImageBase64} alt="Gift base" className="w-full h-full object-cover" />

        {state.overlay.imageBase64 && (
          <div
            onPointerDown={(event) => onPointerDown("overlay", event)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              left: `${state.overlay.x * 100}%`,
              top: `${state.overlay.y * 100}%`,
              width: overlaySize,
              aspectRatio: `${1 / overlayRatio}`,
              borderRadius: state.overlay.borderRadius,
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden cursor-grab active:cursor-grabbing border-2 ${
              activeLayer === "overlay" ? "border-primary" : "border-white/60"
            }`}
          >
            <img src={state.overlay.imageBase64} alt="Overlay" className="w-full h-full object-cover" />
          </div>
        )}

        <div
          onPointerDown={(event) => onPointerDown("text", event)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            left: `${state.text.x * 100}%`,
            top: `${state.text.y * 100}%`,
            color: state.text.color,
            fontSize: state.text.fontSize,
            fontWeight: state.text.fontWeight,
            fontFamily: '"Noto Kufi Arabic", sans-serif',
          }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-lg max-w-[80%] text-center cursor-grab active:cursor-grabbing whitespace-nowrap overflow-hidden text-ellipsis ${
            activeLayer === "text" ? "ring-2 ring-primary bg-black/25" : "bg-black/20"
          }`}
        >
          {state.text.content || "اكتب النص هنا"}
        </div>
      </div>
      <p className="text-xs text-muted mt-2">اسحب النص أو الصورة داخل المعاينة لتحديد المكان.</p>
    </div>
  );
}

export const GiftEditorCanvas = memo(GiftEditorCanvasImpl);
