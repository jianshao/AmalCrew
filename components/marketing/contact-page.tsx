"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, LoaderCircle, MessageCircleMore, Send, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";

type ContactLanguage = "en" | "ar";

const copy = {
  en: {
    direction: "ltr" as const,
    home: "Product overview",
    signUp: "Start a pilot",
    eyebrow: "Talk to AmalCrew",
    title: "Get the information your site team needs.",
    body: "Ask about plans, Telegram setup, worker languages or starting with one project. Choose the quickest route for you—we will keep the next step simple.",
    telegramTitle: "Chat directly on Telegram",
    telegramBody: "Best for a quick product question or an early-stage conversation.",
    telegramButton: "Chat on Telegram",
    hours: "Dubai time 09:00–18:00",
    formEyebrow: "Request a walkthrough",
    formTitle: "Tell us what you need.",
    formBody: "Share a few details and AmalCrew will reply with the most relevant next step for your team.",
    fullName: "Full name",
    email: "Work email",
    company: "Company name",
    teamSize: "Approximate active workers",
    requestType: "What would you like help with?",
    preferredLanguage: "Preferred reply language",
    message: "Your question or goal",
    messageHint: "For example: We run three fit-out crews in Dubai and want to see the Telegram worker flow.",
    selectPlaceholder: "Choose an option",
    teamSizes: ["1–15 workers", "16–50 workers", "51–150 workers", "150+ workers", "Still planning"],
    requestTypes: [
      ["PRODUCT_QUESTION", "Product question"],
      ["PRICING", "Pricing and plans"],
      ["DEMO", "Request a walkthrough"],
      ["SUPPORT", "Existing workspace support"],
    ],
    languages: [["en", "English"], ["ar", "العربية"]],
    consent: "By sending this request, you agree that AmalCrew may contact you about it.",
    submit: "Send request",
    sending: "Sending request…",
    successTitle: "Your request has been received.",
    successBody: "We will use the details you provided to reply with the right next step. For a quick question, you can also message us on Telegram.",
    sendAnother: "Send another request",
    error: "We could not send your request. Please try Telegram, or try again in a moment.",
    directAnswers: "Prefer to explore first?",
    pricing: "View plans and pricing",
    workflow: "See how the workflow works",
    footer: "Simple workforce time tracking and confirmations for UAE and GCC field teams.",
    location: "Dubai · United Arab Emirates",
  },
  ar: {
    direction: "rtl" as const,
    home: "نظرة عامة على المنتج",
    signUp: "ابدأ تجربة",
    eyebrow: "تواصل مع AmalCrew",
    title: "احصل على المعلومات التي يحتاجها فريق موقعك.",
    body: "اسأل عن الباقات أو إعداد تيليجرام أو لغات العمال أو البدء بمشروع واحد. اختر أسهل طريقة لك وسنحافظ على الخطوة التالية بسيطة.",
    telegramTitle: "تواصل مباشرة عبر تيليجرام",
    telegramBody: "الأفضل لسؤال سريع عن المنتج أو محادثة أولية.",
    telegramButton: "تواصل عبر تيليجرام",
    hours: "بتوقيت دبي 09:00–18:00",
    formEyebrow: "اطلب جولة تعريفية",
    formTitle: "أخبرنا بما تحتاجه.",
    formBody: "شارك بعض التفاصيل وسيرد AmalCrew بالخطوة التالية الأنسب لفريقك.",
    fullName: "الاسم الكامل",
    email: "بريد العمل الإلكتروني",
    company: "اسم الشركة",
    teamSize: "العدد التقريبي للعمال النشطين",
    requestType: "بماذا تحتاج المساعدة؟",
    preferredLanguage: "لغة الرد المفضلة",
    message: "سؤالك أو هدفك",
    messageHint: "مثال: ندير ثلاثة فرق تجهيز في دبي ونريد مشاهدة مسار العامل عبر تيليجرام.",
    selectPlaceholder: "اختر خياراً",
    teamSizes: ["1–15 عاملاً", "16–50 عاملاً", "51–150 عاملاً", "أكثر من 150 عاملاً", "ما زلنا في مرحلة التخطيط"],
    requestTypes: [
      ["PRODUCT_QUESTION", "سؤال عن المنتج"],
      ["PRICING", "الأسعار والباقات"],
      ["DEMO", "طلب جولة تعريفية"],
      ["SUPPORT", "دعم مساحة العمل الحالية"],
    ],
    languages: [["ar", "العربية"], ["en", "English"]],
    consent: "بإرسال هذا الطلب، توافق على أن يتواصل AmalCrew معك بشأنه.",
    submit: "إرسال الطلب",
    sending: "جارٍ إرسال الطلب…",
    successTitle: "تم استلام طلبك.",
    successBody: "سنستخدم التفاصيل التي قدمتها للرد بالخطوة التالية المناسبة. وللسؤال السريع يمكنك مراسلتنا عبر تيليجرام أيضاً.",
    sendAnother: "إرسال طلب آخر",
    error: "تعذر إرسال الطلب. يرجى استخدام تيليجرام أو المحاولة مرة أخرى بعد قليل.",
    directAnswers: "تفضل الاستكشاف أولاً؟",
    pricing: "عرض الباقات والأسعار",
    workflow: "شاهد طريقة عمل المسار",
    footer: "تتبع بسيط لساعات العمل وتأكيداتها لفرق المواقع في الإمارات والخليج.",
    location: "دبي · الإمارات العربية المتحدة",
  },
};

export function ContactPage({ lang, telegramContactUrl }: { lang: ContactLanguage; telegramContactUrl: string | null }) {
  const text = copy[lang];
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          sourcePath: window.location.pathname,
          referrer: document.referrer,
        }),
      });
      if (!response.ok) throw new Error("Unable to submit contact request.");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div dir={text.direction} className="min-h-screen overflow-hidden bg-[#fbfaf7] text-ink">
      <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#fbfaf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Link href={`/${lang}`} className="inline-flex items-center gap-2.5" aria-label="AmalCrew home"><LogoMark className="ring-1 ring-black/5" /><span className="text-lg font-semibold tracking-[-0.025em] text-ink">AmalCrew</span></Link>
          <div className="flex items-center gap-3"><Link href={`/${lang}`} className="hidden text-sm font-semibold text-stone-600 transition hover:text-ink sm:inline">{text.home}</Link><Link href="/login?mode=signup&source=contact" className="inline-flex h-10 items-center rounded-xl bg-ink px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 sm:px-4">{text.signUp}</Link></div>
        </div>
      </header>

      <main>
        <section className="marketing-hero-grid relative overflow-hidden pb-16 pt-16 sm:pb-24 sm:pt-24">
          <div className="absolute -start-24 top-14 size-80 rounded-full bg-brand-100/65 blur-3xl" />
          <div className="absolute -end-20 bottom-0 size-80 rounded-full bg-amber-100/65 blur-3xl" />
          <div className="relative mx-auto max-w-[920px] px-5 text-center sm:px-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/85 px-3 py-1.5 text-[11px] font-bold text-brand-800 shadow-sm"><MessageCircleMore size={13} />{text.eyebrow}</p>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">{text.title}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{text.body}</p>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="mx-auto grid max-w-[1080px] gap-6 lg:grid-cols-[.82fr_1.18fr]">
            <aside className="rounded-[28px] bg-ink p-6 text-white shadow-[0_24px_60px_rgba(23,37,29,.16)] sm:p-8">
              <span className="grid size-12 place-items-center rounded-2xl bg-sky-400/15 text-sky-300"><Send size={22} /></span>
              <h2 className="mt-7 text-2xl font-semibold tracking-[-0.035em]">{text.telegramTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-stone-300">{text.telegramBody}</p>
              {telegramContactUrl ? <a href={telegramContactUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-5 text-sm font-semibold text-white transition hover:bg-[#168dcc]"><Send size={17} />{text.telegramButton}</a> : <p className="mt-7 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">Telegram contact is being configured. Please use the form.</p>}
              <p className="mt-5 flex items-center gap-2 text-xs text-stone-400"><Clock3 size={14} className="text-brand-300" />{text.hours}</p>
              <div className="my-8 border-t border-white/10" />
              <p className="text-sm font-semibold text-white">{text.directAnswers}</p>
              <div className="mt-4 space-y-2"><Link href={`/${lang}#pricing`} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/[.06]">{text.pricing}<ArrowRight size={16} /></Link><Link href={`/${lang}#workflow`} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/[.06]">{text.workflow}<ArrowRight size={16} /></Link></div>
            </aside>

            <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(22,35,28,.05)] sm:p-8">
              {status === "success" ? <div className="flex min-h-[490px] flex-col items-center justify-center text-center"><span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700"><CheckCircle2 size={28} /></span><h2 className="mt-6 text-2xl font-semibold tracking-[-0.035em]">{text.successTitle}</h2><p className="mt-4 max-w-md text-sm leading-7 text-stone-600">{text.successBody}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row">{telegramContactUrl ? <a href={telegramContactUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 text-sm font-semibold text-white"><Send size={16} />{text.telegramButton}</a> : null}<button type="button" onClick={() => setStatus("idle")} className="inline-flex h-11 items-center justify-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700">{text.sendAnother}</button></div></div> : <><p className="eyebrow">{text.formEyebrow}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{text.formTitle}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">{text.formBody}</p><form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2"><label className="field-label">{text.fullName}<input name="fullName" autoComplete="name" className="field-input" minLength={2} maxLength={160} required /></label><label className="field-label">{text.email}<input name="email" type="email" autoComplete="email" className="field-input" maxLength={254} required /></label><label className="field-label">{text.company}<input name="company" autoComplete="organization" className="field-input" maxLength={160} /></label><label className="field-label">{text.teamSize}<select name="teamSize" className="field-input" defaultValue=""><option value="" disabled>{text.selectPlaceholder}</option>{text.teamSizes.map((teamSize) => <option key={teamSize} value={teamSize}>{teamSize}</option>)}</select></label><label className="field-label"><span>{text.requestType}</span><select name="requestType" className="field-input" defaultValue=""><option value="" disabled>{text.selectPlaceholder}</option>{text.requestTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="field-label">{text.preferredLanguage}<select name="preferredLanguage" className="field-input" defaultValue={lang}>{text.languages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="field-label sm:col-span-2">{text.message}<textarea name="message" className="field-input min-h-30 h-auto py-3" minLength={10} maxLength={2000} placeholder={text.messageHint} required /></label><label className="hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label><input type="hidden" name="language" value={lang} /><div className="sm:col-span-2"><p className="text-xs leading-5 text-stone-500">{text.consent}</p>{status === "error" ? <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{text.error}</p> : null}<button type="submit" disabled={status === "submitting"} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(17,107,59,.16)] transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-65">{status === "submitting" ? <><LoaderCircle size={17} className="animate-spin" />{text.sending}</> : <>{text.submit}<ArrowRight size={17} /></>}</button></div></form></>}
            </section>
          </div>
        </section>

        <section className="border-y border-stone-200 bg-white py-12"><div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 px-5 text-center sm:flex-row sm:text-start"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><ShieldCheck size={21} /></span><p className="text-sm leading-6 text-stone-600">AmalCrew is built for the daily handoff between field workers, supervisors and owners. Tell us your workflow; we will tell you plainly whether the current product is a fit.</p></div></section>
      </main>

      <footer className="px-5 py-12 sm:px-8"><div className="mx-auto flex max-w-[1180px] flex-col gap-7 border-t border-stone-200 pt-8 sm:flex-row sm:items-end sm:justify-between"><div><Link href={`/${lang}`} className="inline-flex items-center gap-2.5"><LogoMark className="ring-1 ring-black/5" /><span className="text-lg font-semibold tracking-[-0.025em]">AmalCrew</span></Link><p className="mt-4 max-w-sm text-sm leading-6 text-stone-500">{text.footer}</p></div><div className="text-sm text-stone-500 sm:text-end"><nav className="flex flex-wrap gap-x-4 gap-y-2 font-semibold text-brand-700 sm:justify-end"><Link href={`/${lang}/pricing`}>{text.pricing}</Link><Link href={`/${lang}/privacy`}>{lang === "en" ? "Privacy" : "الخصوصية"}</Link><Link href={`/${lang}/terms`}>{lang === "en" ? "Terms" : "الشروط"}</Link></nav><p className="mt-3">{text.location}</p></div></div></footer>
    </div>
  );
}
