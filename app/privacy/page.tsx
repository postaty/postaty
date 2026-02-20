import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "en") {
    return {
      title: "Privacy Policy | Postaty",
      description: "How Postaty collects, uses, and protects your data",
    };
  }

  return {
    title: "سياسة الخصوصية | Postaty",
    description: "سياسة الخصوصية لمنصة Postaty — كيف نجمع ونستخدم ونحمي بياناتك",
  };
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();

  if (locale === "en") {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Policy</h1>
          <p className="text-muted mb-12">Last updated: February 1, 2026</p>

          <div className="prose-custom space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-muted leading-relaxed">
                We are committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information when you use Postaty.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">Data We Collect</h2>
              <p className="text-muted leading-relaxed">We may collect account details, usage analytics, uploaded media used for generation, and billing metadata processed securely by Stripe.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">How We Use Data</h2>
              <p className="text-muted leading-relaxed">We use your data to provide and improve the service, manage subscriptions, communicate updates, and comply with legal obligations.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">Security</h2>
              <p className="text-muted leading-relaxed">We apply technical and organizational safeguards to protect your data in transit and at rest.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">Contact</h2>
              <p className="text-muted leading-relaxed">
                If you have questions about this policy, contact us at <a href="mailto:privacy@postaty.com" className="text-primary hover:underline">privacy@postaty.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-4">سياسة الخصوصية</h1>
        <p className="text-muted mb-12">آخر تحديث: 1 فبراير 2026</p>

        <div className="prose-custom space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4">مقدمة</h2>
            <p className="text-muted leading-relaxed">
              نحن في Postaty نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيف نجمع ونستخدم ونحمي المعلومات التي تقدمها لنا عند استخدام منصتنا.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">البيانات التي نجمعها</h2>
            <p className="text-muted leading-relaxed">نجمع بيانات الحساب والاستخدام والمحتوى المرفوع وبيانات دفع أساسية لمعالجة الاشتراكات.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">كيف نستخدم بياناتك</h2>
            <p className="text-muted leading-relaxed">نستخدم بياناتك لتقديم الخدمة وتحسينها وإدارة الاشتراك والتواصل معك والامتثال للمتطلبات القانونية.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">حماية البيانات</h2>
            <p className="text-muted leading-relaxed">نطبق وسائل حماية تقنية وتنظيمية لحماية بياناتك أثناء النقل والتخزين.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-muted leading-relaxed">
              إذا كان لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا عبر البريد الإلكتروني على{" "}
              <a href="mailto:privacy@postaty.com" className="text-primary hover:underline">privacy@postaty.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
