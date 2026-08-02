import Link from "next/link";
import { BookOpen, Mail, MessageCircleMore, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { getI18n } from "@/lib/i18n/server";

const articles = [
  {
    topic: "getting-started",
    icon: BookOpen,
    title: "Getting started",
    body: "Create your organization, add a project, then assign workers from the crew directory.",
  },
  {
    topic: "messaging",
    icon: MessageCircleMore,
    title: "Messaging channels",
    body: "Generate a Telegram invitation from the project page. The worker scans it, taps Start and submits their details; approval connects the verified Telegram identity automatically.",
  },
  {
    topic: "support",
    icon: Mail,
    title: "Contact support",
    body: "Email the AmalCrew team with your organization name, browser and a short description of the problem.",
  },
];

export default async function HelpPage({ searchParams }: { searchParams: Promise<{ q?: string; topic?: string }> }) {
  const [filters, { t }] = await Promise.all([searchParams, getI18n()]);
  const localizedArticles = articles.map((article) => ({
    ...article,
    title: t(article.topic === "messaging" ? "Messaging channels help" : article.title),
    body: t(article.body),
  }));
  const query = filters.q?.trim().toLowerCase() ?? "";
  const visible = localizedArticles.filter((article) =>
    (!query || `${article.title} ${article.body}`.toLowerCase().includes(query)) &&
    (!filters.topic || article.topic === filters.topic),
  );

  return (
    <>
      <PageHeader eyebrow={t("Support")} title={t("How can we help?")} description={t("Find answers for owners, supervisors and field workers.")} />
      <form method="get" className="mx-auto mb-8 flex max-w-2xl gap-2">
        <label className="relative flex-1"><span className="sr-only">{t("Search help")}</span><Search className="absolute start-4 top-1/2 -translate-y-1/2 text-stone-400" size={19} /><input name="q" defaultValue={filters.q} className="field-input m-0 h-12 ps-12 text-base" placeholder={t("Search help articles")} /></label>
        <button className="primary-button h-12" type="submit">{t("Search")}</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-3">
        {visible.map(({ topic, icon: Icon, title, body }) => topic === "support" ? (
          <a key={topic} href="mailto:support@amalcrew.com" className="panel p-5 text-start transition hover:-translate-y-0.5 hover:border-brand-300"><Icon className="text-brand-700" size={22} /><p className="mt-5 font-semibold text-ink">{title}</p><p className="mt-2 text-sm leading-6 text-muted">{body}</p><span className="mt-4 block text-xs font-semibold text-brand-700">support@amalcrew.com</span></a>
        ) : (
          <Link key={topic} href={`/help?topic=${topic}`} className={`panel p-5 text-start transition hover:-translate-y-0.5 hover:border-brand-300 ${filters.topic === topic ? "border-brand-300 ring-2 ring-brand-100" : ""}`}><Icon className="text-brand-700" size={22} /><p className="mt-5 font-semibold text-ink">{title}</p><p className="mt-2 text-sm leading-6 text-muted">{body}</p><span className="mt-4 block text-xs font-semibold text-brand-700">{t("Read guide")}</span></Link>
        ))}
      </div>
      {!visible.length && <p className="panel py-12 text-center text-sm text-muted">{t("No help articles match your search. Try a broader phrase.")}</p>}
      {(filters.q || filters.topic) && <div className="mt-5 text-center"><Link href="/help" className="text-link">{t("Show all help topics")}</Link></div>}
    </>
  );
}
