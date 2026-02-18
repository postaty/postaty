"use client";

import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useConvexAuth, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Zap, Calendar, LogOut, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const PLAN_NAMES: Record<string, string> = {
  none: "غير مشترك",
  starter: "مبتدي",
  growth: "نمو",
  dominant: "هيمنة",
};

const PLAN_COLORS: Record<string, string> = {
  none: "text-muted",
  starter: "text-success",
  growth: "text-primary",
  dominant: "text-accent",
};

const PLAN_BG: Record<string, string> = {
  none: "bg-muted/10",
  starter: "bg-success/10",
  growth: "bg-primary/10",
  dominant: "bg-accent/10",
};

function SettingsPageWithClerk() {
  const { isLoaded: isClerkLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } =
    useConvexAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const creditState = useQuery(
    api.billing.getCreditState,
    isConvexAuthenticated ? {} : "skip"
  );

  const createPortalSession = useAction(api.billing.createPortalSession);

  const handleManageSubscription = async () => {
    setLoadingAction("portal");
    try {
      const { url } = await createPortalSession({
        returnUrl: window.location.href,
      });
      window.location.href = url;
    } catch (error) {
      console.error("Failed to open portal:", error);
      setLoadingAction(null);
    }
  };

  const handleSignOut = async () => {
    setLoadingAction("signout");
    await signOut({ redirectUrl: "/" });
  };

  if (!isClerkLoaded || !clerkUser || !isConvexAuthenticated) {
    return (
      <main className="min-h-screen relative pt-8 pb-32 px-4 md:pt-16 md:pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-muted mx-auto mb-4" />
              <p className="text-muted">جاري التحميل...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const initials = clerkUser.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("") ?? "";

  const planKey = creditState && "planKey" in creditState ? creditState.planKey : "none";

  return (
    <main className="min-h-screen relative pt-8 pb-32 px-4 md:pt-16 md:pb-24">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Header */}
        <div className="bg-surface-1 border border-card-border rounded-2xl p-8 text-center">
          {/* Avatar */}
          <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-card-border">
            {clerkUser.imageUrl ? (
              <img
                src={clerkUser.imageUrl}
                alt={clerkUser.fullName ?? "الملف الشخصي"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {initials}
              </div>
            )}
          </div>

          {/* Name + Plan Badge */}
          <div className="flex items-center justify-center gap-3 mb-1">
            <h1 className="text-2xl font-black">{clerkUser.fullName || "بدون اسم"}</h1>
            <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${PLAN_COLORS[planKey]} ${PLAN_BG[planKey]}`}>
              {PLAN_NAMES[planKey] || "غير معروف"}
            </span>
          </div>

          {/* Email */}
          <p className="text-muted text-sm">
            {clerkUser.emailAddresses[0]?.emailAddress || "بدون بريد"}
          </p>

          {/* Manage Account Link */}
          <button
            onClick={() => clerkUser.update({})}
            className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:underline font-medium"
          >
            <ExternalLink size={14} />
            <span>إدارة الحساب</span>
          </button>
        </div>

        {/* Credits & Subscription */}
        {isConvexLoading || creditState === undefined ? (
          <div className="bg-surface-1 border border-card-border rounded-2xl p-8 flex items-center justify-center h-48">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-muted mx-auto mb-4" />
              <p className="text-muted">جاري تحميل بيانات الاشتراك...</p>
            </div>
          </div>
        ) : creditState && "planKey" in creditState ? (
          <>
            {/* Credits Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Credits Card */}
              <div className="bg-surface-1 border border-card-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={18} className="text-primary" />
                  <h3 className="font-bold">الأرصدة</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">الشهري المتبقي</span>
                    <span className="text-lg font-bold text-primary">
                      {creditState.monthlyRemaining}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">إضافات</span>
                    <span className="text-lg font-bold text-accent">
                      {creditState.addonRemaining}
                    </span>
                  </div>
                  <div className="border-t border-card-border pt-3 flex justify-between items-center">
                    <span className="text-sm font-medium">المجموع</span>
                    <span className="text-2xl font-black text-foreground">
                      {creditState.totalRemaining}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-surface-1 border border-card-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-accent" />
                  <h3 className="font-bold">الاشتراك</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted">الحالة</span>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                          creditState.status === "active"
                            ? "bg-success/20 text-success"
                            : "bg-muted/20 text-muted"
                        }`}
                      >
                        {creditState.status === "active" ? "نشط" : "غير نشط"}
                      </span>
                    </div>
                  </div>
                  {creditState.currentPeriodStart && creditState.currentPeriodEnd && (
                    <div>
                      <span className="text-sm text-muted">الفترة الحالية</span>
                      <p className="text-sm text-foreground mt-1">
                        {new Date(creditState.currentPeriodStart).toLocaleDateString("ar-SA")}
                        {" - "}
                        {new Date(creditState.currentPeriodEnd).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-col sm:flex-row">
              {"status" in creditState && creditState.status === "active" && (
                <button
                  onClick={handleManageSubscription}
                  disabled={loadingAction === "portal"}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-surface-1 border border-card-border rounded-2xl font-bold text-foreground hover:bg-surface-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingAction === "portal" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>جاري التحميل...</span>
                    </>
                  ) : (
                    <span>إدارة الاشتراك</span>
                  )}
                </button>
              )}

              {creditState.planKey === "none" && (
                <Link
                  href="/pricing"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all"
                >
                  <Zap size={16} />
                  <span>عرض الخطط والأسعار</span>
                </Link>
              )}
            </div>
          </>
        ) : null}

        {/* Support */}
        <div className="bg-surface-2/30 border border-card-border rounded-2xl p-6 text-center">
          <p className="text-sm text-muted">
            هل تحتاج إلى مساعدة؟{" "}
            <a
              href="mailto:support@postaty.com"
              className="text-primary hover:underline font-bold"
            >
              تواصل معنا
            </a>
          </p>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          disabled={loadingAction === "signout"}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingAction === "signout" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut size={16} />
          )}
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  if (!AUTH_ENABLED) {
    return (
      <main className="min-h-screen relative pt-8 pb-32 px-4 md:pt-16 md:pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2">الملف الشخصي</h1>
            <p className="text-muted">إدارة حسابك والاشتراك والأرصدة</p>
          </div>

          <div className="bg-surface-1 border border-card-border rounded-2xl p-8 text-center">
            <p className="text-lg font-bold mb-2">صفحة الإعدادات تتطلب تفعيل تسجيل الدخول</p>
            <p className="text-muted mb-6">
              أضف `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` لتفعيل الحسابات والاشتراكات.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl font-bold"
            >
              الرجوع للرئيسية
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <SettingsPageWithClerk />;
}
