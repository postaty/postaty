"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, Loader2, Search, Shield, Crown } from "lucide-react";
import { useState, useMemo } from "react";

const PLAN_LABELS: Record<string, string> = {
  none: "مجاني",
  starter: "مبتدي",
  growth: "نمو",
  dominant: "هيمنة",
};

const PLAN_COLORS: Record<string, string> = {
  none: "bg-muted/20 text-muted",
  starter: "bg-success/20 text-success",
  growth: "bg-primary/20 text-primary",
  dominant: "bg-accent/20 text-accent",
};

const STATUS_LABELS: Record<string, string> = {
  active: "نشط",
  trialing: "تجريبي",
  past_due: "متأخر",
  canceled: "ملغي",
  none: "بدون",
};

function countryCodeToFlag(countryCode?: string) {
  if (!countryCode || countryCode.length !== 2) return null;
  const upper = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return null;
  return String.fromCodePoint(
    ...[...upper].map((char) => 127397 + char.charCodeAt(0))
  );
}

export default function AdminUsersPage() {
  const users = useQuery(api.admin.listUsers, { limit: 200 });
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<"all" | string>("all");

  const countryOptions = useMemo(() => {
    if (!users) return [];
    const values = new Set<string>();
    for (const user of users) {
      if (user.detectedCountry) values.add(user.detectedCountry.toUpperCase());
      if (user.pricingCountry) values.add(user.pricingCountry.toUpperCase());
    }
    return Array.from(values).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.billing?.planKey ?? "").toLowerCase().includes(q) ||
        (u.detectedCountry ?? "").toLowerCase().includes(q) ||
        (u.pricingCountry ?? "").toLowerCase().includes(q);

      const matchesCountry =
        countryFilter === "all" ||
        (u.detectedCountry ?? "").toUpperCase() === countryFilter ||
        (u.pricingCountry ?? "").toUpperCase() === countryFilter;

      return matchesSearch && matchesCountry;
    });
  }, [users, search, countryFilter]);

  if (users === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2">المستخدمون</h1>
          <p className="text-muted">{users.length} مستخدم مسجل</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد أو الدولة..."
            className="w-full pr-12 pl-4 py-3 bg-surface-1 border border-card-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="w-full px-3 py-3 bg-surface-1 border border-card-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">كل الدول</option>
          {countryOptions.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-surface-1 border border-card-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border bg-surface-2/30">
                  <th className="text-right py-3 px-4 font-medium text-muted">المستخدم</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">الدور</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">الخطة</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">الدولة (كشف)</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">دولة التسعير</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">الأرصدة</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">التوليدات</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">تكلفة AI</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-card-border/50 hover:bg-surface-2/20 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          {user.role === "owner" && <Crown size={14} className="text-accent" />}
                          {user.role === "admin" && <Shield size={14} className="text-primary" />}
                          {user.name}
                        </div>
                        <div className="text-xs text-muted">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        user.role === "owner" ? "bg-accent/20 text-accent" :
                        user.role === "admin" ? "bg-primary/20 text-primary" :
                        "bg-muted/20 text-muted"
                      }`}>
                        {user.role === "owner" ? "مالك" : user.role === "admin" ? "مسؤول" : "عضو"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        PLAN_COLORS[user.billing?.planKey ?? "none"]
                      }`}>
                        {PLAN_LABELS[user.billing?.planKey ?? "none"]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${
                        user.billing?.status === "active" ? "text-success" : "text-muted"
                      }`}>
                        {STATUS_LABELS[user.billing?.status ?? "none"]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.detectedCountry ? (
                        <span className="inline-flex items-center gap-2 text-xs">
                          <span className="text-base leading-none">
                            {countryCodeToFlag(user.detectedCountry) ?? "🏳️"}
                          </span>
                          <span className="font-mono">{user.detectedCountry.toUpperCase()}</span>
                        </span>
                      ) : (
                        <span className="text-xs font-mono">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.pricingCountry ? (
                        <span className="inline-flex items-center gap-2 text-xs">
                          <span className="text-base leading-none">
                            {countryCodeToFlag(user.pricingCountry) ?? "🏳️"}
                          </span>
                          <span className="font-mono">{user.pricingCountry.toUpperCase()}</span>
                        </span>
                      ) : (
                        <span className="text-xs font-mono">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.billing ? (
                        <div className="text-xs">
                          <div>
                            شهري: <span className="font-bold">{user.billing.monthlyCreditsUsed}</span> / {user.billing.monthlyCreditLimit}
                          </div>
                          <div>
                            إضافي: <span className="font-bold">{user.billing.addonCreditsBalance}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold">{user.totalGenerations}</td>
                    <td className="py-3 px-4 font-mono text-xs">${user.totalCostUsd.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface-1 border border-card-border rounded-2xl p-12 text-center">
          <Users size={48} className="text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">
            {search ? "لا توجد نتائج" : "لا يوجد مستخدمون"}
          </h3>
          <p className="text-muted">
            {search ? "حاول تغيير كلمات البحث." : "سيظهر المستخدمون هنا عند التسجيل."}
          </p>
        </div>
      )}
    </div>
  );
}
