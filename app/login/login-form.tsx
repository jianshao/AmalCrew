"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { authenticate, type AuthState } from "@/app/login/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/locale-provider";

const initialState: AuthState = {};

export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(authenticate, initialState);

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-4"><p className="eyebrow">{t("Workforce operations")}</p><LanguageSwitcher compact /></div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
          {t(mode === "login" ? "Welcome back" : mode === "signup" ? "Start your workspace" : "Reset your password")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {t(mode === "login"
            ? "Sign in to review today's crews, hours and approvals."
            : mode === "signup"
              ? "Create the owner account for your company. You can invite supervisors next."
              : "Enter your work email and we’ll send a secure reset link.")}
        </p>
      </div>

      <div className={`mb-6 grid grid-cols-2 rounded-xl bg-sand-100 p-1 ${mode === "forgot" ? "hidden" : ""}`}>
        {(["login", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              mode === item
                ? "bg-white text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {t(item === "login" ? "Sign in" : "Create account")}
          </button>
        ))}
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="intent" value={mode} />

        {mode === "signup" && (
          <label className="field-label">
            {t("Full name")}
            <input
              name="fullName"
              autoComplete="name"
              className="field-input"
              placeholder="Omar Hassan"
              required
            />
          </label>
        )}

        <label className="field-label">
          {t("Work email")}
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="field-input"
            placeholder="you@company.ae"
            required
          />
        </label>

        {mode !== "forgot" && <label className="field-label">
          <span className="flex items-center justify-between">
            {t("Password")}
            {mode === "login" && (
              <button type="button" onClick={() => setMode("forgot")} className="text-xs font-medium text-brand-700">
                {t("Forgot password?")}
              </button>
            )}
          </span>
          <span className="relative block">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="field-input pe-11"
              placeholder={t("At least 8 characters")}
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={t(showPassword ? "Hide password" : "Show password")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-ink"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>}

        {state.error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="primary-button w-full"
        >
          {pending ? (
            <LoaderCircle className="animate-spin" size={18} />
          ) : (
            <>
              {t(mode === "login" ? "Sign in" : mode === "signup" ? "Create workspace" : "Send reset link")}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {mode === "forgot" && <button type="button" onClick={() => setMode("login")} className="mt-4 w-full text-center text-sm font-semibold text-brand-700">{t("Back to sign in")}</button>}

      {demoMode && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm font-semibold text-amber-950">{t("Preview mode")}</p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            {t("Supabase is not connected. The interface is available, but live organization data and account actions are disabled.")}
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-950"
          >
            {t("Open interface")} <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <p className="mt-7 text-center text-xs leading-5 text-stone-500">
        {t("By continuing, you agree to AmalCrew's Terms and Privacy Policy.")}
      </p>
    </div>
  );
}
