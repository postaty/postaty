"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Users,
} from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  none: "مجاني",
  starter: "مبتدي",
  growth: "نمو",
  dominant: "هيمنة",
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  active: { label: "نشط", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  trialing: { label: "تجريبي", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  past_due: { label: "متأخر", icon: AlertTriangle, color: "text-accent", bg: "bg-accent/10" },
  canceled: { label: "ملغي", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  none: { label: "بدون", icon: Users, color: "text-muted", bg: "bg-muted/10" },
};

export default function AdminSubscriptionsPage() {
  const data = useQuery(api.admin.listSubscriptions, {});

  if (data === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  const { subscriptions, summary } = data;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">الاشتراكات</h1>
        <p className="text-muted">إدارة ومراقبة اشتراكات المستخدمين</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <SummaryCard label="الإجمالي" value={summary.total} color="text-foreground" bgColor="bg-surface-2/50" />
        <SummaryCard label="نشط" value={summary.active} color="text-success" bgColor="bg-success/10" />
        <SummaryCard label="تجريبي" value={summary.trialing} color="text-primary" bgColor="bg-primary/10" />
        <SummaryCard label="متأخر" value={summary.pastDue} color="text-accent" bgColor="bg-accent/10" />
        <SummaryCard label="ملغي" value={summary.canceled} color="text-destructive" bgColor="bg-destructive/10" />
      </div>

      {/* Subscriptions List */}
      {subscriptions.length > 0 ? (
        <div className="bg-surface-1 border border-card-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border bg-surface-2/30">
                  <th className="text-right py-3 px-4 font-medium text-muted">المستخدم</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">الخطة</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">الأرصدة الشهرية</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">إضافي</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">الفترة الحالية</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const statusCfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.none;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr key={sub._id} className="border-b border-card-border/50 hover:bg-surface-2/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium">{sub.userName}</div>
                        <div className="text-xs text-muted">{sub.userEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          sub.planKey === "dominant" ? "bg-accent/20 text-accent" :
                          sub.planKey === "growth" ? "bg-primary/20 text-primary" :
                          sub.planKey === "starter" ? "bg-success/20 text-success" :
                          "bg-muted/20 text-muted"
                        }`}>
                          {PLAN_LABELS[sub.planKey] ?? sub.planKey}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                          <StatusIcon size={12} />
                          {statusCfg.label}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-bold">{sub.monthlyCreditsUsed}</span> / {sub.monthlyCreditLimit}
                      </td>
                      <td className="py-3 px-4 font-bold text-xs">{sub.addonCreditsBalance}</td>
                      <td className="py-3 px-4 text-xs text-muted">
                        {sub.currentPeriodStart && sub.currentPeriodEnd ? (
                          <>
                            {new Date(sub.currentPeriodStart).toLocaleDateString("ar-SA")}
                            {" — "}
                            {new Date(sub.currentPeriodEnd).toLocaleDateString("ar-SA")}
                          </>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface-1 border border-card-border rounded-2xl p-12 text-center">
          <CreditCard size={48} className="text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">لا توجد اشتراكات</h3>
          <p className="text-muted">ستظهر الاشتراكات هنا عندما يبدأ المستخدمون بالاشتراك.</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, bgColor }: { label: string; value: number; color: string; bgColor: string }) {
  return (
    <div className={`${bgColor} border border-card-border rounded-2xl p-5 text-center`}>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}
