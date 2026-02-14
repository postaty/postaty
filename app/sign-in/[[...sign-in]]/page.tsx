import { HeroVisual } from "@/app/components/hero-visual";
import { SignInForm } from "@/app/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex w-full">
      {/* Visual Side (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative bg-surface-2 items-center justify-center overflow-hidden border-l border-card-border">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center max-w-lg text-center p-8">
          <div className="mb-8 scale-125">
             <HeroVisual />
          </div>
          <h2 className="text-3xl font-black mb-4 mt-8">
            أهلاً بك في <span className="text-gradient">Postaty</span>
          </h2>
          <p className="text-muted text-lg">
            منصتك الذكية لتصميم إعلانات احترافية في ثوانٍ.
            سجل دخولك وابدأ الإبداع.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-background">
        <SignInForm />
      </div>
    </div>
  );
}