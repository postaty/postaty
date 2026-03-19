"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ImageIcon,
  QrCode,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const INSTAPAY_LINK = "https://ipn.eg/S/hadeereltlawy/instapay/7btx4F";
const INSTAPAY_USERNAME = "hadeereltlawy@instapay";

const EGP_PLANS = [
  { key: "starter", label: "Starter", labelAr: "المبتدئ", credits: 150, egp: 499 },
  { key: "growth", label: "Growth", labelAr: "النمو", credits: 350, egp: 999 },
  { key: "dominant", label: "Dominant", labelAr: "المهيمن", credits: 700, egp: 1930 },
] as const;

export default function InstapaySection() {
  const { isSignedIn } = useAuth();
  const { locale, t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<(typeof EGP_PLANS)[number] | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t("حجم الملف يجب أن يكون أقل من 5 ميجا", "File must be under 5MB"));
      return;
    }
    setReceipt(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit() {
    if (!selectedPlan || !receipt) return;

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("phoneNumber", INSTAPAY_USERNAME);
      formData.append("amountEgp", String(selectedPlan.egp));
      formData.append("receipt", receipt);
      formData.append("paymentMethod", "instapay");

      const res = await fetch("/api/billing/vodafone-cash", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || t("حدث خطأ", "An error occurred"));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("حدث خطأ في الاتصال", "Connection error"));
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setIsOpen(false);
    setSelectedPlan(null);
    setReceipt(null);
    setPreviewUrl(null);
    setSuccess(false);
    setError("");
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl mx-auto mb-4">
        <Link
          href="/sign-in?redirect_url=/pricing"
          className="block w-full p-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl text-center font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          <div className="flex items-center justify-center gap-3">
            <Image src="/instapay-logo.png" alt="InstaPay" width={24} height={24} className="rounded" />
            <span>{t("ادفع عبر InstaPay", "Pay with InstaPay")}</span>
            <span className="text-purple-200 text-sm font-normal">
              ({t("لمصر فقط", "Egypt only")})
            </span>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mb-4">
      {/* Toggle Button */}
      {!isOpen && !success && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full p-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          <div className="flex items-center justify-center gap-3">
            <Image src="/instapay-logo.png" alt="InstaPay" width={24} height={24} className="rounded" />
            <span>{t("ادفع عبر InstaPay", "Pay with InstaPay")}</span>
            <span className="text-purple-200 text-sm font-normal">
              ({t("لمصر فقط", "Egypt only")})
            </span>
          </div>
        </button>
      )}

      {/* Success State */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">
            {t("تم إرسال طلبك بنجاح!", "Request submitted successfully!")}
          </h3>
          <p className="text-muted mb-4">
            {t(
              "سيتم مراجعة طلبك وتفعيل اشتراكك خلال ساعات.",
              "Your request will be reviewed and your subscription activated within hours."
            )}
          </p>
          <button
            onClick={resetForm}
            className="text-sm text-primary hover:underline"
          >
            {t("إغلاق", "Close")}
          </button>
        </div>
      )}

      {/* Payment Form */}
      {isOpen && !success && (
        <div className="bg-surface-1 border border-card-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-card-border bg-gradient-to-r from-purple-600/10 to-purple-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/instapay-logo.png" alt="InstaPay" width={28} height={28} className="rounded" />
              <div>
                <h3 className="text-lg font-bold">
                  {t("الدفع عبر InstaPay", "Pay via InstaPay")}
                </h3>
                <p className="text-sm text-muted">
                  {t("امسح الكود أو اضغط الرابط ثم ارفع الإيصال", "Scan the QR code or click the link then upload the receipt")}
                </p>
              </div>
            </div>
            <button onClick={resetForm} className="text-muted hover:text-foreground">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Step 1: Select Plan */}
            <div>
              <h4 className="text-sm font-bold mb-3 text-muted uppercase tracking-wide">
                {t("1. اختر الخطة", "1. Choose plan")}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EGP_PLANS.map((plan) => (
                  <button
                    key={plan.key}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedPlan?.key === plan.key
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-card-border hover:border-purple-500/30"
                    }`}
                  >
                    <div className="font-bold text-lg">
                      {locale === "ar" ? plan.labelAr : plan.label}
                    </div>
                    <div className="text-2xl font-black text-purple-500" dir="ltr">
                      {plan.egp} EGP
                    </div>
                    <div className="text-xs text-muted mt-1">
                      {plan.credits} {t("رصيد/شهر", "credits/mo")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Transfer Instructions with QR */}
            {selectedPlan && (
              <div>
                <h4 className="text-sm font-bold mb-3 text-muted uppercase tracking-wide">
                  {t("2. حوّل المبلغ عبر InstaPay", "2. Transfer via InstaPay")}
                </h4>
                <div className="bg-surface-2 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-sm">{t("المبلغ", "Amount")}</span>
                    <span className="font-bold text-lg" dir="ltr">{selectedPlan.egp} EGP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-sm">{t("حساب InstaPay", "InstaPay account")}</span>
                    <span className="font-mono font-bold text-sm text-purple-500" dir="ltr">
                      {INSTAPAY_USERNAME}
                    </span>
                  </div>

                  {/* QR Code & Link */}
                  <div className="flex flex-col items-center gap-4 pt-2">
                    <div className="bg-white rounded-xl p-3">
                      <Image
                        src="/qrcode/instapay-qr.png"
                        alt="InstaPay QR Code"
                        width={180}
                        height={180}
                        className="rounded-lg"
                      />
                    </div>
                    <a
                      href={INSTAPAY_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors"
                    >
                      <ExternalLink size={16} />
                      {t("اضغط هنا للتحويل عبر InstaPay", "Click here to transfer via InstaPay")}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Upload Receipt */}
            {selectedPlan && (
              <div>
                <h4 className="text-sm font-bold mb-3 text-muted uppercase tracking-wide">
                  {t("3. ارفع إيصال التحويل", "3. Upload the receipt")}
                </h4>

                <div>
                  {/* Receipt upload */}
                  <div>
                    <label className="text-sm text-muted mb-1 block">
                      {t("صورة الإيصال", "Receipt image")}
                    </label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Receipt"
                          className="w-full max-h-48 object-contain rounded-xl border border-card-border"
                        />
                        <button
                          onClick={() => {
                            setReceipt(null);
                            setPreviewUrl(null);
                            if (fileRef.current) fileRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-surface-1/80 backdrop-blur rounded-lg hover:bg-surface-2"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full p-6 border-2 border-dashed border-card-border rounded-xl text-center hover:border-purple-500/30 transition-colors"
                      >
                        <ImageIcon size={32} className="mx-auto mb-2 text-muted" />
                        <span className="text-sm text-muted">
                          {t("اضغط لرفع صورة الإيصال", "Click to upload receipt image")}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Submit */}
            {selectedPlan && (
              <button
                onClick={handleSubmit}
                disabled={submitting || !receipt}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
                {t("إرسال طلب الدفع", "Submit payment request")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
