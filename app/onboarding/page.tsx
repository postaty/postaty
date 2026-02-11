"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, Store, ShoppingBag, Utensils } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    // Simulate a brief delay for effect
    setTimeout(() => {
      setStep(2);
    }, 400);
  };

  const handleFinish = () => {
    // Save onboarding state if needed (e.g., to local storage or Convex)
    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full relative z-10">
        <div className="bg-surface-1/80 backdrop-blur-xl border border-card-border shadow-xl rounded-3xl p-8 md:p-10 animate-fade-in-up">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? "w-8 bg-primary" : "w-2 bg-surface-2"}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? "w-8 bg-primary" : "w-2 bg-surface-2"}`} />
          </div>

          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <Sparkles size={32} className="text-primary animate-pulse" />
              </div>
              
              <h1 className="text-3xl font-bold text-foreground">
                مرحباً بك في <span className="text-gradient-primary">Postaty AI</span>
              </h1>
              
              <p className="text-muted text-lg leading-relaxed">
                دعنا نخصص تجربتك. ما هو نوع النشاط الذي تريد تصميم بوسترات له؟
              </p>

              <div className="grid gap-4 mt-8">
                <button
                  onClick={() => handleGoalSelect("restaurant")}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-card-border hover:border-primary/30 hover:bg-surface-1 transition-all text-right"
                >
                  <div className="p-3 rounded-lg bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                    <Utensils size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">مطعم أو كافيه</h3>
                    <p className="text-sm text-muted">تصميم قوائم الطعام والعروض</p>
                  </div>
                  <ArrowRight className="mr-auto text-muted group-hover:text-primary transition-colors" size={20} />
                </button>

                <button
                  onClick={() => handleGoalSelect("shop")}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-card-border hover:border-primary/30 hover:bg-surface-1 transition-all text-right"
                >
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">متجر أو سوبر ماركت</h3>
                    <p className="text-sm text-muted">عروض المنتجات والخصومات</p>
                  </div>
                  <ArrowRight className="mr-auto text-muted group-hover:text-primary transition-colors" size={20} />
                </button>

                <button
                  onClick={() => handleGoalSelect("online")}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-card-border hover:border-primary/30 hover:bg-surface-1 transition-all text-right"
                >
                  <div className="p-3 rounded-lg bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">متجر إلكتروني</h3>
                    <p className="text-sm text-muted">تسويق المنتجات أونلاين</p>
                  </div>
                  <ArrowRight className="mr-auto text-muted group-hover:text-primary transition-colors" size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
                <CheckCircle2 size={40} className="text-success" />
              </div>
              
              <h1 className="text-3xl font-bold text-foreground">
                أنت جاهز للبدء!
              </h1>
              
              <p className="text-muted text-lg leading-relaxed max-w-sm mx-auto">
                لقد قمنا بإعداد الأدوات المناسبة لك. ابدأ الآن بإنشاء أول تصميم احترافي لك في ثوانٍ.
              </p>

              <div className="pt-6">
                <button
                  onClick={handleFinish}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
                >
                  ابدأ التصميم الآن
                </button>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer info */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          © 2026 Postaty AI. جميع الحقوق محفوظة.
        </p>
      </div>
    </main>
  );
}
