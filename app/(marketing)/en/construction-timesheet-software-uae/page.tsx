import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Clock3,
  FileSpreadsheet,
  MapPin,
  MessageCircleMore,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { getSiteUrl } from "@/lib/site-url";
import { getTelegramContactUsername } from "@/lib/telegram-config";

const pagePath = "/en/construction-timesheet-software-uae";

const faqs = [
  {
    question: "Is AmalCrew payroll software?",
    answer:
      "No. AmalCrew is the approval layer before payroll: it collects project hours, records supervisor decisions and exports confirmed records as CSV for your existing finance or payroll process.",
  },
  {
    question: "Do construction workers need to install another app?",
    answer:
      "No dedicated AmalCrew mobile app is required. A worker opens the Telegram invitation, completes a guided submission and receives the approval result in the same conversation.",
  },
  {
    question: "Can a supervisor review overtime separately?",
    answer:
      "Yes. Workers submit regular and overtime hours separately. The project supervisor can review the entry with the worker and project context before making a decision.",
  },
  {
    question: "Can one company manage more than one UAE site?",
    answer:
      "Yes. Create projects for active sites, assign the relevant crew and supervisors, then review hours by project instead of mixing every worker into one spreadsheet.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "Managers can use the web workspace in English or Arabic. The guided worker flow is available in English, Arabic, Urdu and Hindi, helping mixed site crews complete the same simple steps.",
  },
  {
    question: "How much does AmalCrew cost?",
    answer:
      "Plans start at USD 29 per organization each month for a small contractor. Every plan includes the core project, timesheet and Telegram workflow.",
  },
];

export function generateMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${pagePath}`;

  return {
    title: "Construction Timesheet Software for UAE Contractors",
    description:
      "AmalCrew helps UAE contractors collect construction timesheets through Telegram, approve regular and overtime hours by project, and export confirmed CSV records.",
    keywords: [
      "construction timesheet software UAE",
      "construction timesheet app UAE",
      "UAE contractor timesheet software",
      "Dubai construction worker time tracking",
      "Telegram timesheet bot",
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "AmalCrew",
      title: "Construction Timesheet Software for UAE Contractors",
      description:
        "Collect site hours through Telegram, review them by project and give every worker a clear confirmation.",
      images: [
        {
          url: `${siteUrl}/og.png`,
          width: 1200,
          height: 630,
          alt: "AmalCrew construction timesheet software for UAE contractors",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Construction Timesheet Software for UAE Contractors",
      description:
        "Simple site timesheets, Telegram submissions and supervisor approvals for UAE contractors.",
      images: [`${siteUrl}/og.png`],
    },
    robots: { index: true, follow: true },
  };
}

function Brand() {
  return (
    <Link href="/en" className="inline-flex items-center gap-2.5" aria-label="AmalCrew home">
      <LogoMark className="ring-1 ring-black/5" />
      <span className="text-lg font-semibold tracking-[-0.025em] text-ink">AmalCrew</span>
    </Link>
  );
}

export default function ConstructionTimesheetSoftwareUaePage() {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${pagePath}`;
  const telegramUsername = getTelegramContactUsername();
  const telegramContactUrl = telegramUsername ? `https://t.me/${telegramUsername}` : null;
  const signUpUrl = "/login?mode=signup&source=seo_construction_timesheet_uae";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${canonical}#software`,
        name: "AmalCrew",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: canonical,
        description:
          "Construction timesheet software for UAE contractors to collect Telegram submissions, approve project hours and export confirmed CSV records.",
        inLanguage: "en-AE",
        areaServed: { "@type": "Country", name: "United Arab Emirates" },
        offers: {
          "@type": "Offer",
          price: "29",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}${signUpUrl}`,
        },
        featureList: [
          "Project-based construction timesheets",
          "Telegram worker timesheet submissions",
          "Regular and overtime hour approvals",
          "English, Arabic, Urdu and Hindi worker guidance",
          "CSV export of confirmed records",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "AmalCrew",
            item: `${siteUrl}/en`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Construction Timesheet Software UAE",
            item: canonical,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaf7] text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#fbfaf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Brand />
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link href="/en" className="hidden text-sm font-semibold text-stone-600 transition hover:text-ink sm:inline">
              Product overview
            </Link>
            <Link href="/en/contact" className="hidden text-sm font-semibold text-brand-700 transition hover:text-brand-800 lg:inline">
              Talk to AmalCrew
            </Link>
            <Link href="/ar" hrefLang="ar" className="hidden text-sm font-semibold text-stone-600 transition hover:text-ink md:inline">
              العربية
            </Link>
            <Link href={signUpUrl} className="inline-flex h-10 items-center rounded-xl bg-ink px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 sm:px-4">
              Start a pilot
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="marketing-hero-grid relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div className="absolute -start-28 top-20 size-80 rounded-full bg-brand-100/65 blur-3xl" />
          <div className="absolute -end-28 bottom-0 size-96 rounded-full bg-amber-100/65 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1180px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_.92fr] lg:gap-16">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/85 px-3 py-1.5 text-[11px] font-bold text-brand-800 shadow-sm">
                <MapPin size={13} /> Built for UAE construction and fit-out crews
              </p>
              <h1 className="mt-7 text-[46px] font-semibold leading-[.98] tracking-[-0.055em] text-ink sm:text-6xl lg:text-[66px]">
                Construction timesheet software for UAE contractors.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                Replace paper sheets, scattered chats and end-of-week guesswork with a clear daily flow: workers submit site hours through Telegram, supervisors approve them by project, and your office exports confirmed records when ready.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={signUpUrl} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(17,107,59,.2)] transition hover:-translate-y-0.5 hover:bg-brand-800">
                  Create a workspace <ArrowRight size={17} />
                </Link>
                <a href="#how-it-works" className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-300">
                  See the site workflow
                </a>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-stone-500"><Check size={14} className="text-brand-700" /> Start with one UAE site. No new worker app to roll out.</p>
            </div>

            <div className="marketing-shadow overflow-hidden rounded-[28px] border border-white/80 bg-white/95 p-5 text-start backdrop-blur sm:p-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">Daily site record</p>
                  <p className="mt-1 text-sm font-semibold text-ink">Jumeirah fit-out · Dubai</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">3 to review</span>
              </div>
              <div className="mt-5 rounded-2xl border border-stone-200 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-sand-100 text-xs font-bold text-ink">MR</span><div><p className="text-sm font-semibold">Mohammed R.</p><p className="mt-0.5 text-xs text-muted">Carpenter · Crew A</p></div></div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">Pending</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-sand-50 p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-stone-400">Regular</p><p className="mt-1 text-2xl font-semibold tracking-[-.04em]">8h</p></div>
                  <div className="rounded-xl bg-sand-50 p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-stone-400">Overtime</p><p className="mt-1 text-2xl font-semibold tracking-[-.04em]">1h</p></div>
                </div>
                <button type="button" tabIndex={-1} className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-semibold text-white"><Check size={16} />Approve hours</button>
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#eef8ff] p-3.5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#229ED9] text-white"><Send size={14} /></span><p className="text-xs leading-5 text-stone-600"><strong className="font-semibold text-ink">Telegram confirmation:</strong> “Your timesheet for 6 August was approved.”</p></div>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-200 bg-white">
          <div className="mx-auto grid max-w-[1180px] gap-4 px-5 py-5 sm:grid-cols-3 sm:px-8">
            {[
              [Clock3, "Separate regular and overtime hours"],
              [MessageCircleMore, "Guide workers through Telegram"],
              [FileSpreadsheet, "Export confirmed CSV records"],
            ].map(([Icon, text]) => {
              const FeatureIcon = Icon as typeof Clock3;
              return <div key={text as string} className="flex items-center gap-3 px-2 text-sm font-semibold text-stone-600"><FeatureIcon size={18} className="shrink-0 text-brand-700" />{text as string}</div>;
            })}
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[.74fr_1.26fr] lg:gap-20">
              <div><p className="eyebrow">For the reality of site work</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">A construction timesheet is more than a number at month end.</h2><p className="mt-5 max-w-lg text-base leading-7 text-stone-600">When crews move between sites, overtime changes and supervisors are busy, a clean record needs a simple daily handoff—not another long form or disconnected spreadsheet.</p></div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Users, title: "Mixed site crews", body: "Give workers a guided Telegram flow in a language they understand, while managers keep one web workspace." },
                  { icon: ClipboardCheck, title: "Project context", body: "Review a worker’s entry with the right project, supervisor, regular hours and overtime in view." },
                  { icon: ShieldCheck, title: "Clear confirmation trail", body: "Keep the submitted entry and approval outcome together, then send the result back to the worker." },
                ].map((item) => { const Icon = item.icon; return <article key={item.title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_10px_35px_rgba(22,35,28,.035)] sm:p-6"><span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon size={20} /></span><h3 className="mt-8 text-base font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-stone-600">{item.body}</p></article>; })}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 bg-ink py-24 text-white sm:py-32">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <div className="mx-auto max-w-3xl text-center"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-brand-300">From site to office</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">A UAE construction timesheet workflow your crew can follow.</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-300">Managers work in the browser. Workers use Telegram for the few actions they need to complete. The supervisor stays in control of every approval.</p></div>
            <ol className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="absolute inset-x-[12%] top-6 hidden border-t border-dashed border-white/15 lg:block" />
              {[
                ["01", "Create the project", "Add the active UAE site, dates and the supervisor who should review its hours."],
                ["02", "Invite the crew", "Share the project’s Telegram invitation link or QR code with the relevant workers."],
                ["03", "Collect site hours", "Workers submit their regular and overtime hours through a short, guided Telegram conversation."],
                ["04", "Approve and export", "The supervisor approves or rejects the entry. Workers receive a result, and confirmed records are ready for CSV export."],
              ].map(([number, title, body]) => <li key={number} className="relative list-none rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-6"><span className="grid size-12 place-items-center rounded-2xl border border-brand-400/30 bg-brand-400/10 text-sm font-bold text-brand-300">{number}</span><h3 className="mt-7 font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-stone-400">{body}</p></li>)}
            </ol>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1180px] items-start gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
            <div><p className="eyebrow">Keep finance handover cleaner</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Know what is confirmed before it reaches payroll.</h2><p className="mt-5 max-w-lg text-base leading-7 text-stone-600">AmalCrew does not try to replace your payroll system. It helps project teams create a reliable, reviewable source of hours before finance imports them into the process you already use.</p><ul className="mt-8 space-y-3 text-sm leading-6 text-stone-700">{["Keep workers and projects organized in one place", "See submitted, pending and reviewed timesheets", "Review regular and overtime hours separately", "Export clean CSV records after approval"].map((item) => <li key={item} className="flex items-start gap-3"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"><Check size={12} strokeWidth={2.5} /></span>{item}</li>)}</ul></div>
            <aside className="rounded-[28px] border border-stone-200 bg-sand-50 p-6 shadow-[0_18px_50px_rgba(22,35,28,.06)] sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-brand-700">A focused fit</p><h3 className="mt-3 text-2xl font-semibold tracking-[-.035em]">For small and growing UAE contractors.</h3><p className="mt-4 text-sm leading-7 text-stone-600">Use AmalCrew when your team needs a practical way to manage site hours across construction, fit-out, MEP, facilities, cleaning or security projects.</p><div className="my-6 border-t border-stone-200" /><p className="text-sm font-semibold">Not a fit if you need:</p><ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600"><li className="flex gap-3"><span className="text-stone-400">—</span>A full payroll, accounting or ERP replacement</li><li className="flex gap-3"><span className="text-stone-400">—</span>Complex enterprise workforce planning from day one</li></ul><Link href="/en" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800">Explore the full AmalCrew workflow <ArrowRight size={16} /></Link></aside>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 border-y border-stone-200 bg-white py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1080px] gap-10 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div><p className="eyebrow">Construction timesheet FAQ</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Questions UAE contractors ask before starting.</h2><p className="mt-5 text-base leading-7 text-stone-600">The goal is a cleaner, more traceable daily workflow—without a long software rollout for workers.</p></div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">{faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-semibold sm:text-base">{faq.question}<span className="grid size-6 shrink-0 place-items-center rounded-full border border-stone-200 text-lg font-normal leading-none text-stone-400 transition group-open:rotate-45">+</span></summary><p className="pe-8 pt-3 text-sm leading-6 text-stone-600">{faq.answer}</p></details>)}</div>
          </div>
        </section>

        <section className="px-5 py-8 sm:px-8 sm:py-12">
          <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[36px] bg-brand-700 px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-brand-300">Start with one active project</p><h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">See whether confirmed site hours reduce daily follow-up.</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-emerald-50/80 sm:text-base">Create your workspace, invite one crew and give the supervisor a clearer approval queue. Plans for UAE contractors start at USD 29 per month.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href={signUpUrl} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 text-sm font-semibold text-ink transition hover:bg-brand-300">Create a workspace <ArrowRight size={17} /></Link>{telegramContactUrl ? <a href={telegramContactUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-sky-300/40 bg-sky-400/10 px-5 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"><Send size={17} />Ask on Telegram</a> : null}</div></div>
        </section>
      </main>

      <footer className="px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-7 border-t border-stone-200 pt-8 sm:flex-row sm:items-end sm:justify-between"><div><Brand /><p className="mt-4 max-w-sm text-sm leading-6 text-stone-500">Simple workforce time tracking and confirmations for UAE and GCC field teams.</p></div><div className="text-sm text-stone-500 sm:text-end"><Link href="/en" className="font-semibold text-brand-700 transition hover:text-brand-800">AmalCrew product overview</Link><p className="mt-3">Dubai · United Arab Emirates</p><p className="mt-2 text-xs">© {new Date().getFullYear()} AmalCrew. All rights reserved.</p></div></div>
      </footer>

      {telegramContactUrl ? <a href={telegramContactUrl} target="_blank" rel="noreferrer" aria-label="Chat with AmalCrew on Telegram" className="fixed bottom-5 end-5 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-[#229ED9] px-4 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,158,217,.35)] transition hover:-translate-y-0.5 hover:bg-[#168dcc] focus:outline-none focus:ring-4 focus:ring-sky-200"><Send size={19} /><span className="hidden sm:inline">Chat on Telegram</span></a> : null}
    </div>
  );
}
