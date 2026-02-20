import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "en") {
    return {
      title: "Terms & Conditions | Postaty",
      description: "Terms and conditions for using Postaty",
    };
  }
  return {
    title: "الشروط والأحكام | Postaty",
    description: "شروط وأحكام استخدام منصة Postaty لتصميم الإعلانات بالذكاء الاصطناعي",
  };
}

export default async function TermsPage() {
  const locale = await getRequestLocale();

  if (locale === "en") {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Terms & Conditions</h1>
          <p className="text-muted mb-12">Last updated: February 1, 2026</p>

          <div className="prose-custom space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4">Acceptance</h2>
              <p className="text-muted leading-relaxed">By using Postaty, you agree to these terms. If you do not agree, please do not use the service.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">Service Description</h2>
              <p className="text-muted leading-relaxed">Postaty is an AI-powered advertising design platform that helps users generate social media creatives.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">Accounts and Billing</h2>
              <p className="text-muted leading-relaxed">Users are responsible for account credentials and subscription activity. Paid plans renew automatically unless canceled before renewal.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
              <p className="text-muted leading-relaxed">You own generated outputs, while the platform and underlying technology remain Postaty intellectual property.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">Contact</h2>
              <p className="text-muted leading-relaxed">
                For legal questions, contact <a href="mailto:legal@postaty.com" className="text-primary hover:underline">legal@postaty.com</a>.
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
        <h1 className="text-4xl md:text-5xl font-black mb-4">الشروط والأحكام</h1>
        <p className="text-muted mb-12">آخر تحديث: 1 فبراير 2026</p>

        <div className="prose-custom space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4">القبول بالشروط</h2>
            <p className="text-muted leading-relaxed">باستخدامك لمنصة Postaty، فإنك توافق على هذه الشروط والأحكام.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">وصف الخدمة</h2>
            <p className="text-muted leading-relaxed">Postaty منصة تصميم إعلانات تعمل بالذكاء الاصطناعي لإنشاء تصاميم مخصصة لمنصات التواصل الاجتماعي.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">الحسابات والاشتراكات</h2>
            <p className="text-muted leading-relaxed">المستخدم مسؤول عن بيانات الحساب. الاشتراكات المدفوعة تتجدد تلقائياً ما لم يتم الإلغاء قبل التجديد.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">الملكية الفكرية</h2>
            <p className="text-muted leading-relaxed">تمتلك حقوق التصاميم الناتجة، بينما تظل المنصة وتقنياتها ملكاً لـ Postaty.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-muted leading-relaxed">
              لأي استفسارات قانونية، تواصل عبر <a href="mailto:legal@postaty.com" className="text-primary hover:underline">legal@postaty.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
