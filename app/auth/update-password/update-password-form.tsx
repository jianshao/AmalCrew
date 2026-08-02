"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { updatePassword, type AuthState } from "@/app/login/actions";
import { useI18n } from "@/components/locale-provider";

export function UpdatePasswordForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(updatePassword, {} as AuthState);
  const [visible, setVisible] = useState(false);
  return (
    <form action={action} className="space-y-4">
      <label className="field-label">{t("New password")}<span className="relative block"><input className="field-input pe-11" name="password" type={visible ? "text" : "password"} minLength={8} required autoComplete="new-password" /><button type="button" onClick={() => setVisible((value) => !value)} className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400" aria-label={t(visible ? "Hide password" : "Show password")}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
      <label className="field-label">{t("Confirm password")}<input className="field-input" name="confirmation" type={visible ? "text" : "password"} minLength={8} required autoComplete="new-password" /></label>
      {state.error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <button className="primary-button w-full" type="submit" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" size={18} /> : <>{t("Save new password")} <ArrowRight size={18} /></>}</button>
    </form>
  );
}
