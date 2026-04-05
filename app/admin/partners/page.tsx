"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Handshake,
  UserPlus,
  Loader2,
  Search,
  AlertCircle,
  ShieldCheck,
  Copy,
  Check,
  Ban,
  ExternalLink,
  Users,
  ArrowRight,
  Globe,
  CheckCircle2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 10;

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("API error");
    return r.json();
  });

interface Partner {
  id: string;
  user_auth_id: string;
  referral_code: string;
  status: string;
  email: string;
  name: string;
  referral_count: number;
  created_at: number;
}

interface ReferredUser {
  auth_id: string;
  name: string;
  email: string;
  detected_country: string | null;
  status: string;
  created_at: number;
  referred_at: number;
  billing: {
    plan_key: string;
    billing_status: string;
    monthly_credits_used: number;
    monthly_credit_limit: number;
    addon_credits_balance: number;
  } | null;
}

const PLAN_LABELS: Record<string, string> = {
  none: "مجاني",
  starter: "Starter",
  growth: "Growth",
  dominant: "Dominant",
};

const PLAN_COLORS: Record<string, string> = {
  none: "bg-gray-500/10 text-gray-400",
  starter: "bg-blue-500/10 text-blue-400",
  growth: "bg-purple-500/10 text-purple-400",
  dominant: "bg-amber-500/10 text-amber-400",
};

const STATUS_LABELS: Record<string, string> = {
  active: "نشط",
  suspended: "موقوف",
  banned: "محظور",
  unknown: "غير معروف",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500",
  suspended: "bg-yellow-500/10 text-yellow-500",
  banned: "bg-red-500/10 text-red-500",
  unknown: "bg-gray-500/10 text-gray-400",
};

function PartnerReferrals({
  partner,
  onBack,
}: {
  partner: Partner;
  onBack: () => void;
}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const { data, isLoading } = useSWR<{
    users: ReferredUser[];
    total: number;
  }>(`/api/admin/partners/${partner.id}/referrals`, fetcher);

  const filtered = (data?.users || []).filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages - 1);
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const subscribedCount = (data?.users || []).filter(
    (u) => u.billing?.plan_key && u.billing.plan_key !== "none"
  ).length;

  const conversionRate =
    data && data.total > 0
      ? Math.round((subscribedCount / data.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-surface-2 transition-colors text-muted hover:text-foreground"
        >
          <ArrowRight size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary" />
            <h2 className="text-lg font-black">إحالات الشريك</h2>
          </div>
          <p className="text-muted text-sm mt-0.5">
            {partner.name} — {partner.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-1 border border-card-border rounded-2xl p-5">
            <p className="text-muted text-xs mb-1">إجمالي الإحالات</p>
            <p className="text-2xl font-black">{data.total}</p>
          </div>
          <div className="bg-surface-1 border border-card-border rounded-2xl p-5">
            <p className="text-muted text-xs mb-1">مشتركون</p>
            <p className="text-2xl font-black text-green-500">{subscribedCount}</p>
          </div>
          <div className="bg-surface-1 border border-card-border rounded-2xl p-5">
            <p className="text-muted text-xs mb-1">معدل التحويل</p>
            <p className="text-2xl font-black text-primary">{conversionRate}%</p>
          </div>
        </div>
      )}

      {/* Referrals table */}
      <div className="bg-surface-1 border border-card-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-card-border flex items-center justify-between gap-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Users size={16} />
            المستخدمون المُحالون
            {data && (
              <span className="text-sm font-normal text-muted">
                ({data.total})
              </span>
            )}
          </h3>
          <div className="relative w-60">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
              placeholder="بحث باسم أو بريد..."
              className="w-full pr-9 pl-3 py-2 bg-surface-2 border border-card-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin text-muted mx-auto mb-2" />
            <p className="text-muted text-sm">جاري التحميل...</p>
          </div>
        ) : !filtered.length ? (
          <div className="p-12 text-center text-muted">
            <Users size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {search ? "لا توجد نتائج مطابقة" : "لا يوجد مستخدمون محالون بعد"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2/50">
                  <th className="text-right px-5 py-3 font-medium text-muted">المستخدم</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">الخطة</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">الحالة</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">الرصيد</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">الدولة</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">تاريخ الإحالة</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((user) => {
                  const planKey = user.billing?.plan_key || "none";
                  const creditsUsed = user.billing?.monthly_credits_used ?? 0;
                  const creditLimit = user.billing?.monthly_credit_limit ?? 0;
                  const addonBalance = user.billing?.addon_credits_balance ?? 0;

                  return (
                    <tr
                      key={user.auth_id}
                      className="border-t border-card-border hover:bg-surface-2/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium leading-none">{user.name}</p>
                        <p className="text-muted text-xs mt-1">{user.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            PLAN_COLORS[planKey] || PLAN_COLORS.none
                          }`}
                        >
                          {PLAN_LABELS[planKey] || planKey}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[user.status] || STATUS_COLORS.unknown
                          }`}
                        >
                          {user.status === "active" ? (
                            <CheckCircle2 size={10} />
                          ) : (
                            <ShieldAlert size={10} />
                          )}
                          {STATUS_LABELS[user.status] || user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted">
                        {planKey !== "none" ? (
                          <span>
                            {creditsUsed}/{creditLimit}
                            {addonBalance > 0 && (
                              <span className="text-amber-400 mr-1">
                                +{addonBalance}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted/50">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {user.detected_country ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted">
                            <Globe size={12} />
                            {user.detected_country}
                          </span>
                        ) : (
                          <span className="text-muted/50 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted text-xs">
                        {new Date(user.referred_at).toLocaleDateString(
                          "ar-JO-u-nu-latn"
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted text-xs">
                        {new Date(user.created_at).toLocaleDateString(
                          "ar-JO-u-nu-latn"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Referrals pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-card-border">
            <span className="text-xs text-muted">
              عرض {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} من {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-sm font-medium min-w-[4rem] text-center">
                {safePage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPartnersPage() {
  const { data, isLoading, mutate } = useSWR<{ partners: Partner[] }>(
    "/api/admin/partners",
    fetcher
  );

  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [disabling, setDisabling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [partnersPage, setPartnersPage] = useState(0);

  async function handleCreate() {
    if (!email.trim()) return;
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "حدث خطأ");
        return;
      }

      setSuccess(
        result.message ||
          `تم إنشاء شريك: ${result.partner.email} — الكود: ${result.partner.referral_code}`
      );
      setEmail("");
      mutate();
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setCreating(false);
    }
  }

  async function handleDisable(partnerId: string) {
    setDisabling(partnerId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `/api/admin/partners?partnerId=${partnerId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "حدث خطأ");
        return;
      }

      setSuccess("تم تعطيل الشريك");
      mutate();
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setDisabling(null);
    }
  }

  function handleCopyLink(code: string) {
    const link = `https://postaty.com/?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  if (selectedPartner) {
    return (
      <div dir="rtl">
        <PartnerReferrals
          partner={selectedPartner}
          onBack={() => setSelectedPartner(null)}
        />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Handshake size={28} className="text-primary" />
          <h1 className="text-2xl font-black text-foreground">
            إدارة الشركاء
          </h1>
        </div>
        <p className="text-muted text-sm">
          إنشاء روابط إحالة للشركاء وتتبع أدائهم
        </p>
      </div>

      {/* Create partner form */}
      <div className="bg-surface-1 border border-card-border rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <UserPlus size={20} />
          إنشاء شريك جديد
        </h2>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="أدخل البريد الإلكتروني للمستخدم..."
              className="w-full pr-10 pl-4 py-3 bg-surface-2 border border-card-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !email.trim()}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            إنشاء شريك
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 flex items-center gap-2 text-green-500 text-sm">
            <ShieldCheck size={16} />
            {success}
          </div>
        )}
      </div>

      {/* Partners list */}
      <div className="bg-surface-1 border border-card-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-card-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Handshake size={20} />
            الشركاء
            {data?.partners && (
              <span className="text-sm font-normal text-muted">
                ({data.partners.length})
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2
              size={24}
              className="animate-spin text-muted mx-auto mb-2"
            />
            <p className="text-muted text-sm">جاري التحميل...</p>
          </div>
        ) : !data?.partners?.length ? (
          <div className="p-12 text-center text-muted">
            <Handshake size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">لا يوجد شركاء حالياً</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2/50">
                  <th className="text-right px-6 py-3 font-medium text-muted">
                    الشريك
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-muted">
                    البريد
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-muted">
                    رابط الإحالة
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-muted">
                    لوحة الشريك
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-muted">
                    الإحالات
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-muted">
                    الحالة
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-muted">
                    تاريخ الإنشاء
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-muted">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalPartnersPages = Math.max(1, Math.ceil(data.partners.length / PAGE_SIZE));
                  const safePartnersPage = Math.min(partnersPage, totalPartnersPages - 1);
                  return data.partners.slice(safePartnersPage * PAGE_SIZE, (safePartnersPage + 1) * PAGE_SIZE);
                })().map((partner) => (
                  <tr
                    key={partner.id}
                    className="border-t border-card-border hover:bg-surface-2/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">{partner.name}</td>
                    <td className="px-6 py-4 text-muted">{partner.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-surface-2 px-2 py-1 rounded text-xs font-mono max-w-[280px] truncate block" dir="ltr">
                          https://postaty.com/?ref={partner.referral_code}
                        </code>
                        <button
                          onClick={() =>
                            handleCopyLink(partner.referral_code)
                          }
                          className="text-muted hover:text-foreground shrink-0"
                          title="نسخ الرابط"
                        >
                          {copiedCode === partner.referral_code ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href="/partner"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        <ExternalLink size={12} />
                        فتح اللوحة
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedPartner(partner)}
                        className="inline-flex px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold hover:bg-blue-500/20 transition-colors"
                      >
                        {partner.referral_count}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          partner.status === "active"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {partner.status === "active" ? "نشط" : "معطل"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted text-xs">
                      {new Date(partner.created_at).toLocaleDateString(
                        "ar-JO-u-nu-latn"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {partner.status === "active" && (
                        <button
                          onClick={() => handleDisable(partner.id)}
                          disabled={disabling === partner.id}
                          className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-medium disabled:opacity-50"
                        >
                          {disabling === partner.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Ban size={14} />
                          )}
                          تعطيل
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Partners pagination */}
          {data.partners.length > PAGE_SIZE && (() => {
            const totalPartnersPages = Math.max(1, Math.ceil(data.partners.length / PAGE_SIZE));
            const safePartnersPage = Math.min(partnersPage, totalPartnersPages - 1);
            return (
              <div className="flex items-center justify-between px-4 py-3 border-t border-card-border">
                <span className="text-xs text-muted">
                  عرض {safePartnersPage * PAGE_SIZE + 1}–{Math.min((safePartnersPage + 1) * PAGE_SIZE, data.partners.length)} من {data.partners.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPartnersPage((p) => Math.max(0, p - 1))}
                    disabled={safePartnersPage === 0}
                    className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="text-sm font-medium min-w-[4rem] text-center">
                    {safePartnersPage + 1} / {totalPartnersPages}
                  </span>
                  <button
                    onClick={() => setPartnersPage((p) => Math.min(totalPartnersPages - 1, p + 1))}
                    disabled={safePartnersPage >= totalPartnersPages - 1}
                    className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                </div>
              </div>
            );
          })()}
          </>
        )}
      </div>
    </div>
  );
}
