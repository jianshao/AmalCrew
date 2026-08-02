import { redirect } from "next/navigation";
import { CheckCircle2, Languages, MessageCircleMore } from "lucide-react";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/app/login/login-form";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { t } = await getI18n();
  if (isSupabaseConfigured && (await getCurrentUser())) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-canvas lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-ink px-12 py-10 text-white lg:flex lg:flex-col xl:px-20 xl:py-14">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
        <div className="absolute bottom-24 left-12 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />

        <Brand inverse />

        <div className="relative my-auto max-w-xl py-16">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
            {t("Built for GCC field teams")}
          </p>
          <h2 className="text-5xl font-semibold leading-[1.06] tracking-[-0.045em] xl:text-6xl">
            {t("Every hour. Clearly confirmed.")}
          </h2>
          <p className="mt-7 max-w-lg text-base leading-7 text-stone-300">
            {t("Keep supervisors, site crews and owners aligned without asking workers to learn another app.")}
          </p>

          <div className="mt-12 grid max-w-lg gap-4 sm:grid-cols-3">
            {[
              { icon: MessageCircleMore, label: t("Telegram notifications") },
              { icon: CheckCircle2, label: t("Clear approvals") },
              { icon: Languages, label: t("Four-language ready") },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="border-s border-white/15 ps-4">
                <Icon className="mb-3 text-brand-300" size={20} />
                <p className="text-sm leading-5 text-stone-200">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>Dubai · United Arab Emirates</span>
          <span>العربية · English · اردو · हिन्दी</span>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-12 lg:hidden">
            <Brand />
          </div>
          <LoginForm demoMode={!isSupabaseConfigured} />
        </div>
      </section>
    </main>
  );
}
