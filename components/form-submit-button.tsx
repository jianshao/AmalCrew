"use client";

import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useI18n } from "@/components/locale-provider";

export function FormSubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "primary-button",
  disabled = false,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending || disabled}>
      {pending ? <><LoaderCircle size={16} className="animate-spin" /> {t(pendingLabel)}</> : children}
    </button>
  );
}
