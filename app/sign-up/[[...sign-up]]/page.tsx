"use client";

import { HeroVisual } from "@/app/components/hero-visual";
import { SignUpForm } from "@/app/components/auth/sign-up-form";
import { useLocale } from "@/hooks/use-locale";

export default function SignUpPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen flex w-full">
      <div className="hidden lg:flex flex-1 relative bg-surface-2 items-center justify-center overflow-hidden border-l border-card-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-lg text-center p-8">
          <div className="mb-8 scale-125">
            <HeroVisual />
          </div>
          <h2 className="text-3xl font-black mb-4 mt-8">
            {t("انضم إلى", "Join")} <span className="text-gradient">Postaty</span>
          </h2>
          <p className="text-muted text-lg">
            {t("ابدأ رحلة تصميم إعلاناتك بالذكاء الاصطناعي اليوم. أنشئ حسابك مجاناً.", "Start creating AI-powered ads today. Create your account for free.")}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-background">
        <SignUpForm />
      </div>
    </div>
  );
}
