import { v } from "convex/values";
import type { FunctionReference } from "convex/server";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

const DEFAULT_FROM_EMAIL = "Postaty <onboarding@resend.dev>";
const DEFAULT_LOW_BALANCE_THRESHOLD = 20;

type Recipient = {
  clerkUserId: string;
  email: string;
  name: string;
  totalRemaining: number;
  planKey: "none" | "starter" | "growth" | "dominant";
};

type MarketingTemplate = {
  subject: string;
  html: string;
  text: string;
};

type ListRecipientsFunction = FunctionReference<
  "query",
  "internal",
  {
    audience: "all" | "paid" | "low_balance";
    lowBalanceThreshold?: number;
  },
  Recipient[]
>;

type CreateSystemNotificationFunction = FunctionReference<
  "mutation",
  "internal",
  {
    clerkUserId: string;
    title: string;
    body: string;
  },
  void
>;

const listRecipientsFn = internal.emailing.listRecipients as unknown as ListRecipientsFunction;
const createSystemNotificationFn =
  internal.emailing.createSystemNotification as unknown as CreateSystemNotificationFunction;

function getResendApiKey() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("Missing RESEND_API_KEY. Configure it in environment variables.");
  }
  return key;
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL;
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function sendEmailWithResend(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: Array<{ name: string; value: string }>;
}) {
  const apiKey = getResendApiKey();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text ?? stripHtml(args.html),
      tags: args.tags,
    }),
  });

  const json = (await response.json()) as { id?: string; message?: string; error?: { message?: string } };

  if (!response.ok || !json.id) {
    const errorMessage =
      json?.error?.message ?? json?.message ?? `Resend request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return json.id;
}

function buildDefaultMarketingTemplate(input: {
  campaignGoal: string;
  offerDetails?: string;
  ctaUrl?: string;
}): MarketingTemplate {
  const offer = input.offerDetails?.trim() || "عروض حصرية لفترة محدودة";
  const ctaUrl = input.ctaUrl?.trim() || "https://www.postaty.com/pricing";

  const subject = `🎯 ${input.campaignGoal.trim()} مع بوستاتي`;
  const html = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #ffffff; padding: 20px 24px;">
        <h1 style="margin: 0; font-size: 22px;">Postaty - بوستاتي</h1>
        <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.95;">تصاميم سوشيال ميديا جاهزة للنشر خلال ثوانٍ</p>
      </div>
      <div style="padding: 24px; color: #111827;">
        <p style="margin: 0 0 12px; font-size: 16px;">مرحباً {{name}}،</p>
        <p style="margin: 0 0 12px; line-height: 1.8;">${input.campaignGoal}</p>
        <p style="margin: 0 0 12px; line-height: 1.8;">${offer}</p>
        <ul style="padding-right: 20px; margin: 0 0 18px; line-height: 1.9; color: #374151;">
          <li>توليد تصاميم احترافية بالذكاء الاصطناعي</li>
          <li>أحجام جاهزة لكل منصات التواصل</li>
          <li>سرعة تنفيذ + حفظ هوية العلامة</li>
        </ul>
        <a href="${ctaUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 700;">ابدأ الآن</a>
        <p style="margin: 16px 0 0; color: #6b7280; font-size: 13px;">فريق Postaty</p>
      </div>
    </div>
  `;

  return {
    subject,
    html,
    text: `مرحباً {{name}}\n\n${input.campaignGoal}\n\n${offer}\n\nابدأ الآن: ${ctaUrl}\n\nفريق Postaty`,
  };
}

function buildBalanceReminderTemplate(input: {
  name: string;
  totalRemaining: number;
}): MarketingTemplate {
  const subject = "تنبيه الرصيد - Postaty";
  const html = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #f59e0b, #f97316); color: #111827; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 21px;">تنبيه الرصيد</h2>
      </div>
      <div style="padding: 24px; color: #111827;">
        <p style="margin: 0 0 12px; font-size: 16px;">مرحباً ${input.name}،</p>
        <p style="margin: 0 0 12px; line-height: 1.8;">رصيدك الحالي هو <strong>${input.totalRemaining}</strong> رصيد.</p>
        <p style="margin: 0 0 16px; line-height: 1.8;">لضمان استمرار إنشاء التصاميم بدون توقف، ننصح بشحن الرصيد الآن.</p>
        <a href="https://www.postaty.com/checkout?addon=addon_5" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 700;">شحن الرصيد</a>
      </div>
    </div>
  `;

  return {
    subject,
    html,
    text: `مرحباً ${input.name}\nرصيدك الحالي: ${input.totalRemaining}\nلضمان الاستمرار بدون توقف، اشحن الرصيد من هنا: https://www.postaty.com/checkout?addon=addon_5`,
  };
}

function buildCreditsAddedTemplate(input: {
  name: string;
  amount: number;
  newBalance: number;
  reason: string;
}): MarketingTemplate {
  const subject = `تمت إضافة ${input.amount} رصيد إلى حسابك`;
  const html = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 21px;">تمت إضافة رصيد بنجاح</h2>
      </div>
      <div style="padding: 24px; color: #111827;">
        <p style="margin: 0 0 12px; font-size: 16px;">مرحباً ${input.name}،</p>
        <p style="margin: 0 0 12px; line-height: 1.8;">تمت إضافة <strong>${input.amount}</strong> رصيد إلى حسابك.</p>
        <p style="margin: 0 0 12px; line-height: 1.8;">الرصيد الجديد: <strong>${input.newBalance}</strong></p>
        <p style="margin: 0 0 16px; line-height: 1.8; color: #4b5563;">السبب: ${input.reason}</p>
        <a href="https://www.postaty.com/create" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 700;">ابدأ التصميم الآن</a>
      </div>
    </div>
  `;

  return {
    subject,
    html,
    text: `مرحباً ${input.name}\nتمت إضافة ${input.amount} رصيد.\nالرصيد الجديد: ${input.newBalance}\nالسبب: ${input.reason}\nابدأ الآن: https://www.postaty.com/create`,
  };
}

function personalizeTemplate(template: MarketingTemplate, recipientName: string): MarketingTemplate {
  return {
    subject: template.subject,
    html: template.html.replaceAll("{{name}}", recipientName),
    text: template.text.replaceAll("{{name}}", recipientName),
  };
}

async function tryGenerateWithAi(args: {
  campaignGoal: string;
  offerDetails?: string;
  ctaUrl?: string;
}): Promise<MarketingTemplate | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const [{ generateText }, { createGoogleGenerativeAI }] = await Promise.all([
      import("ai"),
      import("@ai-sdk/google"),
    ]);

    const google = createGoogleGenerativeAI({ apiKey });

    const prompt = `You are a senior Arabic email marketer.
Write a short high-converting Arabic marketing email for a SaaS product called Postaty.
Goal: ${args.campaignGoal}
Offer: ${args.offerDetails ?? "No specific offer"}
CTA URL: ${args.ctaUrl ?? "https://www.postaty.com/pricing"}
Output strict JSON with keys: subject, headline, intro, bullets (array of 3 short bullets), ctaText, closing.
No markdown.`;

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
      temperature: 0.8,
      maxOutputTokens: 600,
    });

    const raw = result.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      subject?: string;
      headline?: string;
      intro?: string;
      bullets?: string[];
      ctaText?: string;
      closing?: string;
    };

    if (!parsed.subject || !parsed.headline || !parsed.intro) return null;

    const ctaUrl = args.ctaUrl?.trim() || "https://www.postaty.com/pricing";
    const bullets = Array.isArray(parsed.bullets) && parsed.bullets.length
      ? parsed.bullets.slice(0, 3)
      : [
          "تصاميم جاهزة للنشر خلال ثوانٍ",
          "مناسبة لكل منصات التواصل",
          "تحافظ على هوية علامتك تلقائياً",
        ];

    const html = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #ffffff; padding: 20px 24px;">
          <h1 style="margin: 0; font-size: 22px;">${parsed.headline}</h1>
        </div>
        <div style="padding: 24px; color: #111827;">
          <p style="margin: 0 0 12px; font-size: 16px;">مرحباً {{name}}،</p>
          <p style="margin: 0 0 12px; line-height: 1.8;">${parsed.intro}</p>
          <ul style="padding-right: 20px; margin: 0 0 18px; line-height: 1.9; color: #374151;">
            ${bullets.map((b) => `<li>${b}</li>`).join("")}
          </ul>
          <a href="${ctaUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 700;">${parsed.ctaText ?? "ابدأ الآن"}</a>
          <p style="margin: 16px 0 0; color: #6b7280; font-size: 13px;">${parsed.closing ?? "فريق Postaty"}</p>
        </div>
      </div>
    `;

    const text = `مرحباً {{name}}\n\n${parsed.intro}\n\n- ${bullets.join("\n- ")}\n\n${parsed.ctaText ?? "ابدأ الآن"}: ${ctaUrl}\n\n${parsed.closing ?? "فريق Postaty"}`;

    return {
      subject: parsed.subject,
      html,
      text,
    };
  } catch {
    return null;
  }
}

export const listRecipients = internalQuery({
  args: {
    audience: v.union(
      v.literal("all"),
      v.literal("paid"),
      v.literal("low_balance")
    ),
    lowBalanceThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Recipient[]> => {
    const threshold = args.lowBalanceThreshold ?? DEFAULT_LOW_BALANCE_THRESHOLD;
    const users = await ctx.db.query("users").collect();

    const recipients: Recipient[] = [];

    for (const user of users) {
      if (!user.email || !user.email.includes("@")) continue;
      if (user.status === "banned" || user.status === "suspended") continue;
      if (user.role === "owner" || user.role === "admin") continue;

      const billing = await ctx.db
        .query("billing")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", user.clerkId))
        .first();

      const planKey = billing?.planKey ?? "none";
      const monthlyRemaining = billing
        ? Math.max(0, billing.monthlyCreditLimit - billing.monthlyCreditsUsed)
        : 0;
      const addonRemaining = billing?.addonCreditsBalance ?? 0;
      const totalRemaining = monthlyRemaining + addonRemaining;

      const matchesAudience =
        args.audience === "all" ||
        (args.audience === "paid" && planKey !== "none") ||
        (args.audience === "low_balance" && totalRemaining <= threshold);

      if (!matchesAudience) continue;

      recipients.push({
        clerkUserId: user.clerkId,
        email: user.email,
        name: user.name,
        totalRemaining,
        planKey,
      });
    }

    return recipients;
  },
});

export const createSystemNotification = internalMutation({
  args: {
    clerkUserId: v.string(),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      clerkUserId: args.clerkUserId,
      title: args.title,
      body: args.body,
      type: "system",
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const sendCreditsAddedEmail = internalAction({
  args: {
    toEmail: v.string(),
    userName: v.string(),
    amount: v.number(),
    newBalance: v.number(),
    reason: v.string(),
  },
  handler: async (_ctx, args) => {
    const template = buildCreditsAddedTemplate({
      name: args.userName,
      amount: args.amount,
      newBalance: args.newBalance,
      reason: args.reason,
    });

    await sendEmailWithResend({
      to: args.toEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: "type", value: "balance_credit" },
      ],
    });

    return { success: true };
  },
});

export const generateMarketingTemplate = action({
  args: {
    campaignGoal: v.string(),
    offerDetails: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    useAi: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});

    const useAi = args.useAi ?? true;

    if (useAi) {
      const aiTemplate = await tryGenerateWithAi(args);
      if (aiTemplate) {
        return {
          ...aiTemplate,
          source: "ai" as const,
        };
      }
    }

    const fallback = buildDefaultMarketingTemplate(args);
    return {
      ...fallback,
      source: "default" as const,
    };
  },
});

export const sendMarketingCampaign = action({
  args: {
    audience: v.union(
      v.literal("all"),
      v.literal("paid"),
      v.literal("low_balance")
    ),
    subject: v.string(),
    html: v.string(),
    plainText: v.optional(v.string()),
    lowBalanceThreshold: v.optional(v.number()),
    notifyInApp: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});

    const recipients = await ctx.runQuery(listRecipientsFn, {
      audience: args.audience,
      lowBalanceThreshold: args.lowBalanceThreshold,
    });

    if (recipients.length === 0) {
      return {
        total: 0,
        sent: 0,
        failed: 0,
        failures: [] as Array<{ email: string; reason: string }>,
      };
    }

    let sent = 0;
    let failed = 0;
    const failures: Array<{ email: string; reason: string }> = [];

    for (const recipient of recipients) {
      try {
        const personalized = personalizeTemplate(
          {
            subject: args.subject,
            html: args.html,
            text: args.plainText ?? stripHtml(args.html),
          },
          recipient.name
        );

        await sendEmailWithResend({
          to: recipient.email,
          subject: personalized.subject,
          html: personalized.html,
          text: personalized.text,
          tags: [
            { name: "type", value: "marketing" },
            { name: "audience", value: args.audience },
          ],
        });

        sent += 1;

        if (args.notifyInApp ?? true) {
          await ctx.runMutation(createSystemNotificationFn, {
            clerkUserId: recipient.clerkUserId,
            title: "رسالة جديدة من Postaty",
            body: "تم إرسال بريد جديد لك يحتوي على تحديثات وعروض مهمة.",
          });
        }
      } catch (error) {
        failed += 1;
        if (failures.length < 10) {
          failures.push({
            email: recipient.email,
            reason: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    return {
      total: recipients.length,
      sent,
      failed,
      failures,
    };
  },
});

export const sendBalanceReminderCampaign = action({
  args: {
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});

    const threshold = args.threshold ?? DEFAULT_LOW_BALANCE_THRESHOLD;
    const recipients = await ctx.runQuery(listRecipientsFn, {
      audience: "low_balance",
      lowBalanceThreshold: threshold,
    });

    if (recipients.length === 0) {
      return {
        total: 0,
        sent: 0,
        failed: 0,
      };
    }

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        const template = buildBalanceReminderTemplate({
          name: recipient.name,
          totalRemaining: recipient.totalRemaining,
        });

        await sendEmailWithResend({
          to: recipient.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
          tags: [
            { name: "type", value: "balance_reminder" },
          ],
        });

        await ctx.runMutation(createSystemNotificationFn, {
          clerkUserId: recipient.clerkUserId,
          title: "تنبيه الرصيد",
          body: `رصيدك الحالي ${recipient.totalRemaining}. يرجى الشحن لتجنب توقف التوليد.`,
        });

        sent += 1;
      } catch {
        failed += 1;
      }
    }

    return {
      total: recipients.length,
      sent,
      failed,
    };
  },
});
