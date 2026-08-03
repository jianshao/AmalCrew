import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileCheck2,
  FolderKanban,
  Languages,
  MessageCircleMore,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { MarketingLanguage } from "@/lib/marketing";
import { marketingContent } from "@/lib/marketing";

function MarketingBrand({ lang, inverse = false }: { lang: MarketingLanguage; inverse?: boolean }) {
  return (
    <Link href={`/${lang}`} className="inline-flex items-center gap-2.5" aria-label="AmalCrew home">
      <span className={`grid size-9 place-items-center rounded-[11px] text-base font-bold ${inverse ? "bg-brand-400 text-ink" : "bg-brand-700 text-white"}`}>A</span>
      <span className={`text-lg font-semibold tracking-[-0.025em] ${inverse ? "text-white" : "text-ink"}`}>AmalCrew</span>
    </Link>
  );
}

function ProductPreview({ lang }: { lang: MarketingLanguage }) {
  const text = marketingContent[lang].visual;
  return (
    <div className="relative mx-auto w-full max-w-[620px] pb-24 sm:pb-20 lg:ms-auto">
      <div className="marketing-shadow overflow-hidden rounded-[26px] border border-white/80 bg-white/95 text-start backdrop-blur">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">{text.overview}</p>
            <p className="mt-1 text-xs text-stone-400">{text.today}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><i className="size-1.5 rounded-full bg-emerald-500" />{text.live}</span>
        </div>
        <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-2xl bg-ink p-5 text-white">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-300"><Users size={15} />{text.reported}</div>
            <p className="mt-5 text-4xl font-semibold tracking-[-0.05em]">75%</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-brand-400" /></div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {["12", "3", "1"].map((value, index) => <div key={value + index} className="rounded-xl bg-white/[0.06] px-2 py-2.5"><strong className="block text-base">{value}</strong><span className="text-[9px] text-stone-400">{index === 0 ? "Submitted" : index === 1 ? "Waiting" : "Review"}</span></div>)}
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 p-4">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold text-ink">{text.approval}</p><span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">3</span></div>
            <div className="mt-4 flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="grid size-9 place-items-center rounded-full bg-sand-100 text-[10px] font-bold">MR</span>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-ink">{text.worker}</p><p className="mt-0.5 truncate text-[10px] text-muted">{text.project}</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between"><strong className="text-xs text-ink">{text.hours}</strong><span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">{text.pending}</span></div>
            <button type="button" tabIndex={-1} className="mt-5 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 text-[10px] font-bold text-white"><Check size={13} />Approve</button>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-stone-100 bg-sand-50/70 px-5 py-3 text-[10px] text-stone-500 sm:px-6">
          <span className="flex items-center gap-1.5"><FolderKanban size={13} />4 projects</span>
          <span className="flex items-center gap-1.5"><Users size={13} />28 workers</span>
          <span className="flex items-center gap-1.5"><Clock3 size={13} />216h</span>
        </div>
      </div>

      <div className="absolute -bottom-1 end-2 w-[225px] rounded-[28px] border-[5px] border-ink bg-ink p-2 shadow-2xl sm:-end-5 sm:w-[245px]">
        <div className="overflow-hidden rounded-[20px] bg-[#eef8ff]">
          <div className="flex items-center gap-2 bg-[#5b9bd5] px-3 py-2.5 text-white"><span className="grid size-7 place-items-center rounded-full bg-white/20"><Send size={13} /></span><div><p className="text-[10px] font-bold">{text.telegramTitle}</p><p className="text-[8px] text-white/70">bot</p></div></div>
          <div className="p-3">
            <div className="max-w-[85%] rounded-xl rounded-es-sm bg-white p-3 shadow-sm"><p className="text-[10px] leading-4 text-stone-700">{text.telegramBody}</p><p className="mt-2 text-end text-[8px] text-stone-400">08:42 ✓✓</p></div>
            <div className="mt-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-center text-[9px] font-bold text-sky-700">{text.telegramAction}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketingSite({ lang }: { lang: MarketingLanguage }) {
  const content = marketingContent[lang];
  const alternate = lang === "en" ? "ar" : "en";
  const problemIcons = [Users, FileCheck2, ShieldCheck];
  const productIcons = [FolderKanban, CheckCircle2, Languages, BarChart3];

  return (
    <div dir={content.dir} className="min-h-screen overflow-hidden bg-[#fbfaf7] text-ink">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/70 bg-[#fbfaf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <MarketingBrand lang={lang} />
          <nav className="hidden items-center gap-5 text-sm font-medium text-stone-600 lg:flex xl:gap-7" aria-label="Marketing navigation">
            <a className="transition hover:text-ink" href="#product">{content.nav.product}</a>
            <a className="transition hover:text-ink" href="#workflow">{content.nav.workflow}</a>
            <a className="transition hover:text-ink" href="#industries">{content.nav.industries}</a>
            <a className="transition hover:text-ink" href="#pricing">{content.nav.pricing}</a>
            <a className="transition hover:text-ink" href="#faq">{content.nav.faq}</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={`/${alternate}`} hrefLang={alternate} className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-stone-600 transition hover:bg-white hover:text-ink"><Languages size={15} />{content.alternateLabel}</Link>
            <Link href="/login" className="hidden text-sm font-semibold text-stone-700 sm:block">{content.nav.signIn}</Link>
            <Link href="/login?mode=signup" className="inline-flex h-10 items-center rounded-xl bg-ink px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800 sm:px-4 sm:text-sm">{content.hero.primary}</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="marketing-hero-grid relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
          <div className="absolute -start-24 top-32 size-72 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="absolute -end-20 bottom-20 size-96 rounded-full bg-amber-100/60 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-16 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
            <div className="max-w-2xl text-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-brand-800 shadow-sm"><Sparkles size={13} />{content.hero.eyebrow}</div>
              <h1 className="mt-7 text-[46px] font-semibold leading-[.98] tracking-[-0.055em] text-ink sm:text-6xl lg:text-[72px]">{content.hero.title}</h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{content.hero.body}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login?mode=signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(17,107,59,.2)] transition hover:-translate-y-0.5 hover:bg-brand-800">{content.hero.primary}<ArrowRight size={17} /></Link>
                <a href="#workflow" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-300">{content.hero.secondary}</a>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-stone-500"><Check size={14} className="text-brand-700" />{content.hero.note}</p>
            </div>
            <ProductPreview lang={lang} />
          </div>
        </section>

        <section className="border-y border-stone-200 bg-white">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-stone-100 px-5 py-1 sm:px-8 lg:grid-cols-4 rtl:divide-x-reverse">
            {content.badges.map((badge, index) => <div key={badge} className="flex min-h-20 items-center gap-2.5 px-3 py-4 text-xs font-semibold text-stone-600 sm:px-5 sm:text-sm">{index === 0 ? <Clock3 size={17} className="shrink-0 text-brand-700" /> : index === 1 ? <MessageCircleMore size={17} className="shrink-0 text-sky-600" /> : index === 2 ? <Languages size={17} className="shrink-0 text-amber-700" /> : <Download size={17} className="shrink-0 text-brand-700" />}{badge}</div>)}
          </div>
        </section>

        <section id="product" className="scroll-mt-20 py-24 sm:py-32">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
              <div className="text-start"><p className="eyebrow">{content.problem.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">{content.problem.title}</h2><p className="mt-5 max-w-lg text-base leading-7 text-stone-600">{content.problem.body}</p></div>
              <div className="grid gap-4 sm:grid-cols-3">
                {content.problem.cards.map((card, index) => { const Icon = problemIcons[index]; return <article key={card.title} className="rounded-2xl border border-stone-200 bg-white p-5 text-start shadow-[0_10px_35px_rgba(22,35,28,.035)] sm:p-6"><span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon size={20} /></span><h3 className="mt-8 text-base font-semibold">{card.title}</h3><p className="mt-3 text-sm leading-6 text-stone-600">{card.body}</p></article>; })}
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-20 bg-ink py-24 text-white sm:py-32">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="mx-auto max-w-3xl text-center"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-brand-300">{content.workflow.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{content.workflow.title}</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-300">{content.workflow.body}</p></div>
            <div className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="absolute inset-x-[12%] top-6 hidden border-t border-dashed border-white/15 lg:block" />
              {content.workflow.steps.map((step, index) => <article key={step.title} className="relative rounded-2xl border border-white/10 bg-white/[.04] p-5 text-start sm:p-6"><span className="grid size-12 place-items-center rounded-2xl border border-brand-400/30 bg-brand-400/10 text-sm font-bold text-brand-300">0{index + 1}</span><h3 className="mt-7 font-semibold text-white">{step.title}</h3><p className="mt-3 text-sm leading-6 text-stone-400">{step.body}</p></article>)}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1240px] items-start gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-24">
            <div className="text-start"><p className="eyebrow">{content.product.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">{content.product.title}</h2><p className="mt-5 max-w-lg text-base leading-7 text-stone-600">{content.product.body}</p></div>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-stone-200 bg-stone-200 sm:grid-cols-2">
              {content.product.items.map((item, index) => { const Icon = productIcons[index]; return <article key={item.title} className="bg-white p-6 text-start sm:min-h-56 sm:p-7"><Icon size={22} className="text-brand-700" /><h3 className="mt-10 font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-stone-600">{item.body}</p></article>; })}
            </div>
          </div>
        </section>

        <section id="industries" className="scroll-mt-20 border-y border-stone-200 bg-sand-100/60 py-24 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="mx-auto max-w-3xl text-center"><p className="eyebrow">{content.industries.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{content.industries.title}</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-600">{content.industries.body}</p></div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {content.industries.items.map((item, index) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-start text-sm font-semibold shadow-sm">{index === 0 ? <Building2 size={18} className="text-brand-700" /> : <BriefcaseBusiness size={18} className="text-brand-700" />}{item}</div>)}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 py-24 sm:py-32">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">{content.pricing.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{content.pricing.title}</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-600">{content.pricing.body}</p>
              <p className="mt-4 text-xs font-semibold text-stone-400">{content.pricing.currencyNote}</p>
            </div>

            <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
              {content.pricing.plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative flex flex-col rounded-[28px] border p-6 text-start sm:p-8 ${
                    plan.featured
                      ? "border-ink bg-ink text-white shadow-[0_24px_70px_rgba(23,37,29,.18)] lg:-translate-y-3"
                      : "border-stone-200 bg-white text-ink shadow-[0_12px_40px_rgba(23,37,29,.05)]"
                  }`}
                >
                  {plan.featured ? <span className="absolute end-5 top-5 rounded-full bg-brand-400 px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-ink">{content.pricing.popular}</span> : null}
                  <p className={`text-sm font-semibold ${plan.featured ? "text-brand-300" : "text-brand-700"}`}>{plan.name}</p>
                  <div className="mt-6 flex items-end gap-2" dir="ltr">
                    <span className="pb-2 text-xl font-semibold">$</span>
                    <strong className="text-6xl font-semibold tracking-[-0.055em]">{plan.price}</strong>
                    <span className={`pb-2 text-xs ${plan.featured ? "text-stone-400" : "text-muted"}`}>/ {content.pricing.monthly}</span>
                  </div>
                  <p className={`mt-5 min-h-16 text-sm leading-6 ${plan.featured ? "text-stone-300" : "text-stone-600"}`}>{plan.description}</p>
                  <Link
                    href={`/login?mode=signup&source=pricing&lang=${lang}&plan=${plan.id}`}
                    className={`mt-6 inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition ${plan.featured ? "bg-brand-400 text-ink hover:bg-brand-300" : "bg-brand-700 text-white hover:bg-brand-800"}`}
                  >
                    {plan.cta}
                  </Link>
                  <div className={`my-7 border-t ${plan.featured ? "border-white/10" : "border-stone-200"}`} />
                  <ul className="space-y-3.5">
                    {plan.features.map((feature) => <li key={feature} className={`flex items-start gap-3 text-sm leading-5 ${plan.featured ? "text-stone-200" : "text-stone-700"}`}><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${plan.featured ? "bg-brand-400/15 text-brand-300" : "bg-brand-50 text-brand-700"}`}><Check size={12} strokeWidth={2.5} /></span>{feature}</li>)}
                  </ul>
                </article>
              ))}
            </div>
            <p className="mx-auto mt-9 max-w-3xl text-center text-xs leading-5 text-stone-500">{content.pricing.footnote}</p>
          </div>
        </section>

        <section className="border-t border-stone-200 py-24 sm:py-32">
          <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
            <div className="overflow-hidden rounded-[32px] bg-brand-700 px-6 py-12 text-white sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-16">
              <div className="max-w-2xl text-start"><Languages size={28} className="text-brand-300" /><h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.languages.title}</h2><p className="mt-4 text-sm leading-7 text-emerald-50/80 sm:text-base">{content.languages.body}</p></div>
              <div className="mt-9 grid grid-cols-2 gap-2 lg:mt-0 lg:w-[360px]">{content.languages.items.map((item) => <span key={item} className="rounded-xl border border-white/15 bg-white/[.08] px-4 py-3 text-center text-sm font-semibold">{item}</span>)}</div>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 pb-24 sm:pb-32">
          <div className="mx-auto grid max-w-[1080px] gap-10 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div className="text-start"><p className="eyebrow">{content.faq.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.faq.title}</h2></div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {content.faq.items.map((item) => <details key={item.question} className="group py-5 text-start"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-semibold sm:text-base">{item.question}<ChevronDown size={18} className="shrink-0 text-stone-400 transition group-open:rotate-180" /></summary><p className="pe-8 pt-3 text-sm leading-6 text-stone-600">{item.answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="px-5 pb-8 sm:px-8">
          <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[36px] bg-ink px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-brand-300">{content.cta.eyebrow}</p><h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">{content.cta.title}</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">{content.cta.body}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/login?mode=signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 text-sm font-semibold text-ink transition hover:bg-brand-300">{content.cta.primary}<ArrowRight size={17} /></Link><Link href="/login" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/5">{content.cta.secondary}</Link></div>
          </div>
        </section>
      </main>

      <footer className="px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-8 border-t border-stone-200 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-start"><MarketingBrand lang={lang} /><p className="mt-4 max-w-sm text-sm leading-6 text-stone-500">{content.footer.description}</p></div>
          <div className="text-start text-xs text-stone-500 sm:text-end"><p>{content.footer.location}</p><p className="mt-2">© {new Date().getFullYear()} AmalCrew. {content.footer.copyright}</p></div>
        </div>
      </footer>
    </div>
  );
}
