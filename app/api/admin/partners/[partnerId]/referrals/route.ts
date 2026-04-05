import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { partnerId } = await params;

    // Verify partner exists
    const { data: partner, error: partnerError } = await admin
      .from("partners")
      .select("id, referral_code, status, user_auth_id")
      .eq("id", partnerId)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: "الشريك غير موجود" }, { status: 404 });
    }

    // Fetch partner user info
    const { data: partnerUser } = await admin
      .from("users")
      .select("email, name")
      .eq("auth_id", partner.user_auth_id)
      .single();

    // Fetch all referrals for this partner
    const { data: referrals } = await admin
      .from("referrals")
      .select("referred_user_auth_id, created_at")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });

    const referralList = referrals || [];

    if (referralList.length === 0) {
      return NextResponse.json({
        partner: {
          id: partner.id,
          referral_code: partner.referral_code,
          status: partner.status,
          name: partnerUser?.name || "Unknown",
          email: partnerUser?.email || "Unknown",
        },
        users: [],
        total: 0,
      });
    }

    const authIds = referralList.map((r) => r.referred_user_auth_id);

    const [{ data: users }, { data: billingRecords }] = await Promise.all([
      admin
        .from("users")
        .select("auth_id, email, name, detected_country, status, created_at")
        .in("auth_id", authIds),
      admin
        .from("billing")
        .select(
          "user_auth_id, plan_key, status, monthly_credits_used, monthly_credit_limit, addon_credits_balance"
        )
        .in("user_auth_id", authIds),
    ]);

    const billingMap: Record<string, any> = {};
    for (const b of billingRecords || []) {
      billingMap[b.user_auth_id] = b;
    }

    const userMap: Record<string, any> = {};
    for (const u of users || []) {
      userMap[u.auth_id] = u;
    }

    const enrichedUsers = referralList.map((r) => {
      const u = userMap[r.referred_user_auth_id];
      const billing = billingMap[r.referred_user_auth_id];
      return {
        auth_id: r.referred_user_auth_id,
        name: u?.name || "Unknown",
        email: u?.email || "Unknown",
        detected_country: u?.detected_country || null,
        status: u?.status || "unknown",
        created_at: u?.created_at || r.created_at,
        referred_at: r.created_at,
        billing: billing
          ? {
              plan_key: billing.plan_key,
              billing_status: billing.status,
              monthly_credits_used: billing.monthly_credits_used,
              monthly_credit_limit: billing.monthly_credit_limit,
              addon_credits_balance: billing.addon_credits_balance,
            }
          : null,
      };
    });

    return NextResponse.json({
      partner: {
        id: partner.id,
        referral_code: partner.referral_code,
        status: partner.status,
        name: partnerUser?.name || "Unknown",
        email: partnerUser?.email || "Unknown",
      },
      users: enrichedUsers,
      total: enrichedUsers.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("[admin/partners/referrals] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
