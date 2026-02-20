import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContactForm } from "./contact-form";
import { getRequestLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "en") {
    return {
      title: "Contact Us | Postaty",
      description: "Get in touch with the Postaty team for support, questions, ideas, or partnerships",
    };
  }
  return {
    title: "اتصل بنا | Postaty",
    description: "تواصل مع فريق Postaty — نحب نسمع منك سواء كان سؤال أو اقتراح أو شراكة",
  };
}

const contactMethods = {
  ar: [
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      description: "أرسل لنا وبنرد خلال 24 ساعة",
      value: "hello@postaty.com",
      href: "mailto:hello@postaty.com",
    },
  ],
  en: [
    {
      icon: Mail,
      title: "Email",
      description: "Send us a message and we will reply within 24 hours",
      value: "hello@postaty.com",
      href: "mailto:hello@postaty.com",
    },
  ],
} as const;

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const t = (ar: string, en: string) => (locale === "ar" ? ar : en);

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            {t("نحب نسمع", "We love hearing")}<br />
            <span className="text-gradient">{t("منك", "from you")}</span>
          </h1>
          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("عندك سؤال؟ اقتراح؟ تبي شراكة؟ فريقنا جاهز يساعدك.", "Have a question, idea, or partnership request? Our team is ready to help.")}
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-1 gap-6">
          {contactMethods[locale].map((method) => (
            <div
              key={method.title}
              className="bg-surface-1 border border-card-border rounded-2xl p-8 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <method.icon size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">{method.title}</h3>
              <p className="text-muted text-sm mb-3">{method.description}</p>
              {method.href ? (
                <a
                  href={method.href}
                  className="text-primary font-semibold hover:underline"
                >
                  {method.value}
                </a>
              ) : (
                <span className="text-foreground font-semibold">{method.value}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-8 text-center">{t("أرسل لنا رسالة", "Send us a message")}</h2>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
