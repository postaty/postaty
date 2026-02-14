"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Share2,
  Save,
  Loader2,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { removeOverlayBackground } from "@/app/actions-v2";
import { renderEditedGiftToBlob } from "@/lib/gift-editor/export-edited-gift";
import type { GiftEditorState, PosterResult } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";

const GiftEditorCanvas = dynamic(
  () => import("./gift-editor/gift-editor-canvas").then((mod) => mod.GiftEditorCanvas),
  { ssr: false }
);

const GiftEditorControls = dynamic(
  () => import("./gift-editor/gift-editor-controls").then((mod) => mod.GiftEditorControls),
  { ssr: false }
);

interface PosterModalProps {
  result: PosterResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAsTemplate?: (designIndex: number) => void;
  category?: string;
  model?: string;
  generationId?: Id<"generations">;
  imageStorageId?: Id<"_storage">;
}

type ModalTab = "preview" | "edit";
type ActiveLayer = "text" | "overlay";

function defaultEditorState(): GiftEditorState {
  return {
    text: {
      content: "هدية مجانية",
      color: "#ffffff",
      fontSize: 54,
      fontWeight: 800,
      fontFamily: "noto-kufi",
      x: 0.5,
      y: 0.12,
    },
    overlay: {
      imageBase64: null,
      x: 0.5,
      y: 0.58,
      scale: 0.75,
      borderRadius: 24,
    },
  };
}

function base64ToBlob(dataUrl: string): Blob {
  const base64Data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const mimeType = dataUrl.includes(",")
    ? dataUrl.split(",")[0].split(":")[1].split(";")[0]
    : "image/png";

  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i += 1) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function PosterModal({
  result,
  isOpen,
  onClose,
  onSaveAsTemplate,
  category,
  model,
  generationId,
  imageStorageId,
}: PosterModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackState, setFeedbackState] = useState<"idle" | "like" | "dislike" | "submitted">("idle");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [tab, setTab] = useState<ModalTab>("preview");
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>("text");
  const [editorState, setEditorState] = useState<GiftEditorState>(defaultEditorState);
  const [removeBgLoading, setRemoveBgLoading] = useState(false);
  const [removeBgMessage, setRemoveBgMessage] = useState<string>();

  const { isAuthenticated } = useConvexAuth();
  const submitFeedback = useMutation(api.admin.submitFeedback);

  const isGift = Boolean(result?.isGift);

  const fileName = useMemo(() => {
    const name = result?.designNameAr || (result ? `${result.designIndex + 1}` : "poster");
    const format = result?.format || "image";
    return `poster-${name}-${format}.png`;
  }, [result]);

  useEffect(() => {
    setIsExporting(false);
    setFeedbackState("idle");
    setShowCommentBox(false);
    setFeedbackComment("");
    setTab("preview");
    setActiveLayer("text");
    setEditorState(defaultEditorState());
    setRemoveBgLoading(false);
    setRemoveBgMessage(undefined);
  }, [result, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const handleRemoveBackground = async (overlayBase64: string) => {
    setRemoveBgLoading(true);
    setRemoveBgMessage(undefined);
    try {
      const output = await removeOverlayBackground(overlayBase64);
      setEditorState((prev) => ({
        ...prev,
        overlay: {
          ...prev.overlay,
          imageBase64: output.imageBase64,
        },
      }));
      setRemoveBgMessage(output.warning ?? "تمت إزالة الخلفية بنجاح.");
    } catch (error) {
      console.error("Remove background failed", error);
      setRemoveBgMessage("تعذر إزالة الخلفية الآن، حاول مرة أخرى.");
    } finally {
      setRemoveBgLoading(false);
    }
  };

  const getExportBlob = async (): Promise<Blob | null> => {
    if (!result.imageBase64) return null;
    if (isGift && tab === "edit") {
      return renderEditedGiftToBlob(result.imageBase64, editorState);
    }
    return base64ToBlob(result.imageBase64);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await getExportBlob();
      if (!blob) return;
      downloadBlob(blob, fileName);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!("share" in navigator)) return;
    try {
      const blob = await getExportBlob();
      if (!blob) return;
      const file = new File([blob], fileName, { type: "image/png" });
      await navigator.share({ files: [file] });
    } catch {
      // user cancelled
    }
  };

  const handleFeedbackClick = (rating: "like" | "dislike") => {
    setFeedbackState(rating);
    setShowCommentBox(true);
  };

  const handleSubmitFeedback = async () => {
    if (feedbackState !== "like" && feedbackState !== "dislike") return;
    setIsSendingFeedback(true);
    try {
      await submitFeedback({
        rating: feedbackState,
        comment: feedbackComment.trim() || undefined,
        model: model || undefined,
        category: category as
          | "restaurant"
          | "supermarket"
          | "ecommerce"
          | "services"
          | "fashion"
          | "beauty"
          | undefined,
        generationId: generationId || undefined,
        imageStorageId: imageStorageId || undefined,
      });
      setFeedbackState("submitted");
      setShowCommentBox(false);
    } catch (error) {
      console.error("Feedback submission failed:", error);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl h-full max-h-[90vh] bg-surface-1 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2 bg-black/20 text-white rounded-full backdrop-blur-md md:hidden"
            >
              <X size={20} />
            </button>

            <div className="flex-1 bg-surface-2 relative flex items-center justify-center p-4 md:p-8 overflow-auto">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {isGift && tab === "edit" && result.imageBase64 ? (
                <div className="relative w-full max-w-[680px] z-10">
                  <GiftEditorCanvas
                    baseImageBase64={result.imageBase64}
                    state={editorState}
                    activeLayer={activeLayer}
                    onActiveLayerChange={setActiveLayer}
                    onChange={setEditorState}
                  />
                </div>
              ) : (
                <motion.div
                  layoutId={`poster-img-${result.designIndex}`}
                  className="relative max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden z-10"
                >
                  {result.imageBase64 ? (
                    <img
                      src={result.imageBase64}
                      alt="Full Preview"
                      className="max-h-[calc(90vh-4rem)] md:max-h-[80vh] w-auto object-contain"
                    />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center bg-surface-3 text-muted-foreground">
                      No Image
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="w-full md:w-[360px] bg-surface-1 border-l border-card-border p-6 flex flex-col gap-5 z-20 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {isGift ? "تفاصيل وتحرير الهدية" : "تفاصيل التصميم"}
                </h2>
                <button
                  onClick={onClose}
                  className="hidden md:flex p-2 hover:bg-surface-2 rounded-full text-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {isGift && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTab("preview")}
                    className={`rounded-lg py-2 border text-sm font-medium ${
                      tab === "preview"
                        ? "border-primary text-primary bg-primary/10"
                        : "border-card-border hover:bg-surface-2"
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("edit")}
                    className={`rounded-lg py-2 border text-sm font-medium flex items-center justify-center gap-1.5 ${
                      tab === "edit"
                        ? "border-primary text-primary bg-primary/10"
                        : "border-card-border hover:bg-surface-2"
                    }`}
                  >
                    <WandSparkles size={14} />
                    Edit Gift
                  </button>
                </div>
              )}

              <div className="space-y-4 flex-1">
                {isGift && tab === "edit" ? (
                  <GiftEditorControls
                    state={editorState}
                    activeLayer={activeLayer}
                    onActiveLayerChange={setActiveLayer}
                    onChange={setEditorState}
                    onRemoveBackground={handleRemoveBackground}
                    removeBgLoading={removeBgLoading}
                    removeBgMessage={removeBgMessage}
                  />
                ) : (
                  <>
                    <div className="p-4 bg-surface-2 rounded-2xl border border-card-border space-y-3">
                      <div className="text-sm font-medium text-muted">العنوان المقترح</div>
                      <div className="font-bold text-foreground">{result.designNameAr || "بدون عنوان"}</div>
                    </div>

                    <div className="p-4 bg-surface-2 rounded-2xl border border-card-border space-y-3">
                      <div className="text-sm font-medium text-muted">التنسيق</div>
                      <div className="font-bold text-foreground uppercase">{result.format}</div>
                    </div>

                    {isAuthenticated && (
                      <div className="p-4 bg-surface-2 rounded-2xl border border-card-border space-y-3">
                        <div className="text-sm font-medium text-muted">قيّم التصميم</div>
                        {feedbackState === "submitted" ? (
                          <div className="flex items-center gap-2 text-success text-sm font-medium">
                            <CheckCircle2 size={16} />
                            <span>شكراً لتقييمك!</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleFeedbackClick("like")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                                  feedbackState === "like"
                                    ? "bg-success/20 text-success border border-success/30"
                                    : "bg-surface-1 border border-card-border text-muted hover:text-success hover:border-success/30"
                                }`}
                              >
                                <ThumbsUp size={16} />
                                <span>إعجاب</span>
                              </button>
                              <button
                                onClick={() => handleFeedbackClick("dislike")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                                  feedbackState === "dislike"
                                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                                    : "bg-surface-1 border border-card-border text-muted hover:text-destructive hover:border-destructive/30"
                                }`}
                              >
                                <ThumbsDown size={16} />
                                <span>عدم إعجاب</span>
                              </button>
                            </div>
                            {showCommentBox && (
                              <div className="space-y-2">
                                <textarea
                                  value={feedbackComment}
                                  onChange={(event) => setFeedbackComment(event.target.value)}
                                  placeholder="أخبرنا بالمزيد (اختياري)..."
                                  rows={2}
                                  className="w-full px-3 py-2 bg-surface-1 border border-card-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                                <button
                                  onClick={handleSubmitFeedback}
                                  disabled={isSendingFeedback}
                                  className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                                >
                                  {isSendingFeedback ? (
                                    <Loader2 size={14} className="animate-spin mx-auto" />
                                  ) : (
                                    "إرسال التقييم"
                                  )}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-3 mt-auto">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                  <span>{isGift && tab === "edit" ? "تحميل النسخة المعدلة" : "تحميل الصورة"}</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  {typeof navigator !== "undefined" && "share" in navigator && (
                    <button
                      onClick={handleShare}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 bg-surface-1 border border-card-border hover:bg-surface-2 text-foreground rounded-xl font-semibold transition-all active:scale-95"
                    >
                      <Share2 size={18} />
                      <span>مشاركة</span>
                    </button>
                  )}

                  {onSaveAsTemplate && (
                    <button
                      onClick={() => onSaveAsTemplate(result.designIndex)}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all active:scale-95 col-span-1"
                    >
                      <Save size={18} />
                      <span>حفظ</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
