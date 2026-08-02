"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/locale-provider";

export function CopyInviteLink({ value }: { value: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="secondary-button mt-2 w-full justify-center"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <><Check size={16} /> {t("Copied")}</> : <><Copy size={16} /> {t("Copy invitation link")}</>}
    </button>
  );
}
