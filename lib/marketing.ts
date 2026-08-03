export const marketingLanguages = ["en", "ar"] as const;
export type MarketingLanguage = (typeof marketingLanguages)[number];

export function isMarketingLanguage(value: string): value is MarketingLanguage {
  return marketingLanguages.includes(value as MarketingLanguage);
}

type MarketingContent = {
  locale: string;
  dir: "ltr" | "rtl";
  languageLabel: string;
  alternateLabel: string;
  nav: { product: string; workflow: string; industries: string; pricing: string; faq: string; signIn: string };
  hero: { eyebrow: string; title: string; body: string; primary: string; secondary: string; note: string };
  badges: string[];
  visual: {
    overview: string; today: string; reported: string; approval: string; worker: string;
    project: string; hours: string; pending: string; telegramTitle: string; telegramBody: string;
    telegramAction: string; live: string;
  };
  problem: { eyebrow: string; title: string; body: string; cards: Array<{ title: string; body: string }> };
  workflow: { eyebrow: string; title: string; body: string; steps: Array<{ title: string; body: string }> };
  product: { eyebrow: string; title: string; body: string; items: Array<{ title: string; body: string }> };
  industries: { eyebrow: string; title: string; body: string; items: string[] };
  pricing: {
    eyebrow: string; title: string; body: string; monthly: string; currencyNote: string; popular: string;
    plans: Array<{ id: "basic" | "advanced" | "professional"; name: string; price: number; description: string; cta: string; featured?: boolean; features: string[] }>;
    footnote: string;
  };
  languages: { title: string; body: string; items: string[] };
  faq: { eyebrow: string; title: string; items: Array<{ question: string; answer: string }> };
  cta: { eyebrow: string; title: string; body: string; primary: string; secondary: string };
  contact: { telegram: string; telegramAriaLabel: string };
  footer: { description: string; product: string; company: string; location: string; copyright: string };
  metadata: { title: string; description: string; ogDescription: string };
};

export const marketingContent: Record<MarketingLanguage, MarketingContent> = {
  en: {
    locale: "en-AE", dir: "ltr", languageLabel: "English", alternateLabel: "العربية",
    nav: { product: "Product", workflow: "How it works", industries: "Industries", pricing: "Pricing", faq: "FAQ", signIn: "Sign in" },
    hero: {
      eyebrow: "Built for UAE & GCC field teams",
      title: "Site hours, clearly confirmed.",
      body: "Simple construction timesheets and workforce approvals for contractors who need cleaner records—without training every worker on another business app.",
      primary: "Create your workspace", secondary: "See how it works", note: "Start with one project. No card required during the pilot.",
    },
    badges: ["Project-based timesheets", "Telegram worker flow", "English & Arabic interface", "CSV-ready records"],
    visual: {
      overview: "Operations overview", today: "Today · Dubai", reported: "12 of 16 workers reported", approval: "Pending approvals",
      worker: "Mohammed R.", project: "Jumeirah fit-out", hours: "8h + 1h OT", pending: "Pending", telegramTitle: "AmalCrew Bot",
      telegramBody: "Your timesheet for 1 August was approved.", telegramAction: "View timesheet", live: "Live",
    },
    problem: {
      eyebrow: "Less chasing. Better records.", title: "Replace scattered chats and paper timesheets with one clear workflow.",
      body: "AmalCrew is focused on the daily handoff between site workers, supervisors and owners—not a heavyweight ERP implementation.",
      cards: [
        { title: "Know who reported", body: "See submitted, missing and disputed hours across active projects from one operations view." },
        { title: "Approve with context", body: "Review regular and overtime hours by worker and project before they reach finance." },
        { title: "Keep a clean trail", body: "Worker submissions, supervisor decisions and confirmation status stay attached to the record." },
      ],
    },
    workflow: {
      eyebrow: "From site to office", title: "A practical flow your crew can follow from day one.",
      body: "Managers work on the web. Workers use a guided Telegram conversation in their preferred language.",
      steps: [
        { title: "Create a project", body: "Set the site, dates and supervisor in a few steps." },
        { title: "Invite the crew", body: "Share a QR code or Telegram invitation link with workers." },
        { title: "Collect site hours", body: "Workers submit regular and overtime hours through the bot." },
        { title: "Approve and export", body: "Supervisors decide, workers get notified, and confirmed records export to CSV." },
      ],
    },
    product: {
      eyebrow: "Workforce operations, kept simple", title: "The essentials for small contractors and field-service teams.",
      body: "Start with reliable time records today. Add broader workforce processes only when your operation needs them.",
      items: [
        { title: "Project crew management", body: "Keep active workers, supervisors and project assignments organized." },
        { title: "Timesheet approvals", body: "Approve, reject and resolve changes with a visible record history." },
        { title: "Multilingual worker experience", body: "Guide workers in English, Arabic, Urdu or Hindi through Telegram." },
        { title: "Operations reporting", body: "Review weekly and monthly hours, then export clean CSV records." },
      ],
    },
    industries: {
      eyebrow: "Made for work on site", title: "Useful wherever crews move between projects and supervisors.",
      body: "A focused fit for growing UAE companies that still manage hours through spreadsheets, paper or chat threads.",
      items: ["Construction & contracting", "Fit-out & renovation", "MEP & HVAC", "Facilities management", "Cleaning services", "Security services"],
    },
    pricing: {
      eyebrow: "Simple monthly pricing", title: "Choose a plan that fits your field team.",
      body: "Every plan includes the core project, timesheet and Telegram workflow. Upgrade as your crew and operating team grow.",
      monthly: "per month", currencyNote: "USD · billed monthly per organization", popular: "Most popular",
      plans: [
        {
          id: "basic", name: "Basic", price: 29, description: "For a small contractor moving its first crew away from paper and spreadsheets.", cta: "Start with Basic",
          features: ["Up to 15 active workers", "3 active projects", "2 manager accounts", "Telegram timesheet submissions", "Timesheet approval workflow", "English, Arabic, Urdu & Hindi", "CSV exports", "Standard email support"],
        },
        {
          id: "advanced", name: "Advanced", price: 49, featured: true, description: "For growing teams coordinating several active sites and supervisors.", cta: "Choose Advanced",
          features: ["Up to 50 active workers", "10 active projects", "5 manager accounts", "Everything in Basic", "Weekly and monthly reports", "Timesheet disputes and confirmations", "Notification delivery tracking", "Priority email support"],
        },
        {
          id: "professional", name: "Professional", price: 99, description: "For established field operations that need more sites, managers and oversight.", cta: "Choose Professional",
          features: ["Up to 150 active workers", "Unlimited active projects", "15 manager accounts", "Everything in Advanced", "Full approval and audit history", "Multi-site operations reporting", "Priority Telegram notification queue", "Guided workspace onboarding"],
        },
      ],
      footnote: "Early-access customers can test one project before selecting a paid plan. Applicable taxes are not included in the displayed prices.",
    },
    languages: {
      title: "One operation. Four working languages.",
      body: "Managers can use an English or Arabic web interface. Workers choose the language that makes daily submission clearest to them.",
      items: ["English", "العربية", "اردو", "हिन्दी"],
    },
    faq: {
      eyebrow: "Common questions", title: "What contractors ask before starting.",
      items: [
        { question: "Is AmalCrew payroll software?", answer: "No. The MVP focuses on collecting, approving and exporting workforce hours. Your finance team can use the confirmed CSV records in its existing payroll process." },
        { question: "Do workers need to install a new AmalCrew app?", answer: "No dedicated AmalCrew mobile app is required. Workers join and submit through the AmalCrew Telegram Bot, while managers use the web dashboard." },
        { question: "Can each project have a different crew?", answer: "Yes. Workers can be assigned to projects, and supervisors review timesheets with the relevant project context." },
        { question: "Does it support Arabic and South Asian languages?", answer: "Yes. The manager interface supports English and Arabic, and the worker workflow supports English, Arabic, Urdu and Hindi." },
        { question: "Is AmalCrew suitable for a small contractor?", answer: "That is the primary use case. The product is designed to start with a simple project, crew and approval workflow rather than a long ERP rollout." },
        { question: "Can I change plans as my crew grows?", answer: "Yes. The plans are designed around active workers, projects and manager accounts, so an organization can move to a higher plan as its field operation expands." },
      ],
    },
    cta: {
      eyebrow: "Run a cleaner pilot", title: "Start with one site and one crew.",
      body: "Create a workspace, invite your team and see whether confirmed digital timesheets reduce the daily follow-up for your supervisors.",
      primary: "Create workspace", secondary: "Sign in",
    },
    contact: {
      telegram: "Chat with us on Telegram",
      telegramAriaLabel: "Contact AmalCrew on Telegram",
    },
    footer: {
      description: "Simple workforce time tracking and confirmations for UAE and GCC field teams.", product: "Product", company: "AmalCrew", location: "Dubai · United Arab Emirates", copyright: "All rights reserved.",
    },
    metadata: {
      title: "Construction Timesheet Software for UAE Field Teams",
      description: "Manage project crews, collect Telegram timesheets, approve hours and export clean records. UAE contractor plans start at $29 per month.",
      ogDescription: "Clear site timesheets and workforce approvals for UAE contractors.",
    },
  },
  ar: {
    locale: "ar-AE", dir: "rtl", languageLabel: "العربية", alternateLabel: "English",
    nav: { product: "المنتج", workflow: "طريقة العمل", industries: "القطاعات", pricing: "الأسعار", faq: "الأسئلة", signIn: "تسجيل الدخول" },
    hero: {
      eyebrow: "مصمم لفرق المواقع في الإمارات والخليج",
      title: "ساعات الموقع، مؤكدة بوضوح.",
      body: "برنامج بسيط لسجلات دوام البناء وموافقات القوى العاملة، للمقاولين الذين يريدون سجلات أدق دون تدريب كل عامل على تطبيق أعمال جديد.",
      primary: "أنشئ مساحة العمل", secondary: "شاهد طريقة العمل", note: "ابدأ بمشروع واحد. لا تحتاج إلى بطاقة خلال الفترة التجريبية.",
    },
    badges: ["سجلات حسب المشروع", "تجربة العامل عبر تيليجرام", "واجهة عربية وإنجليزية", "تصدير CSV"],
    visual: {
      overview: "نظرة عامة على العمليات", today: "اليوم · دبي", reported: "سجل 12 من 16 عاملاً", approval: "الموافقات المعلقة",
      worker: "محمد ر.", project: "تجهيزات جميرا", hours: "8 س + 1 س إضافي", pending: "معلق", telegramTitle: "بوت AmalCrew",
      telegramBody: "تمت الموافقة على سجل دوامك ليوم 1 أغسطس.", telegramAction: "عرض سجل الدوام", live: "مباشر",
    },
    problem: {
      eyebrow: "متابعة أقل. سجلات أفضل.", title: "استبدل المحادثات المتفرقة والسجلات الورقية بمسار عمل واضح.",
      body: "يركز AmalCrew على التسليم اليومي بين العامل والمشرف والمالك، دون تعقيد تطبيق نظام ERP ضخم.",
      cards: [
        { title: "اعرف من سجّل ساعاته", body: "شاهد الساعات المرسلة والناقصة والمتنازع عليها لجميع المشاريع النشطة." },
        { title: "وافق مع كل التفاصيل", body: "راجع الساعات العادية والإضافية حسب العامل والمشروع قبل إرسالها إلى المالية." },
        { title: "احتفظ بسجل واضح", body: "تبقى طلبات العامل وقرارات المشرف وحالة التأكيد مرتبطة بالسجل نفسه." },
      ],
    },
    workflow: {
      eyebrow: "من الموقع إلى المكتب", title: "مسار عملي يستطيع فريقك استخدامه من اليوم الأول.",
      body: "يعمل المديرون على الويب، ويستخدم العمال محادثة تيليجرام موجهة بلغتهم المفضلة.",
      steps: [
        { title: "أنشئ المشروع", body: "حدد الموقع والتواريخ والمشرف بخطوات قليلة." },
        { title: "ادعُ فريق العمل", body: "شارك رمز QR أو رابط دعوة تيليجرام مع العمال." },
        { title: "اجمع ساعات الموقع", body: "يرسل العمال الساعات العادية والإضافية عبر البوت." },
        { title: "وافق وصدّر", body: "يقرر المشرف، يصل الإشعار للعامل، ثم تُصدّر السجلات المؤكدة إلى CSV." },
      ],
    },
    product: {
      eyebrow: "إدارة بسيطة للقوى العاملة", title: "الأساسيات للمقاولين الصغار وفرق الخدمات الميدانية.",
      body: "ابدأ اليوم بسجلات ساعات موثوقة، وأضف عمليات أوسع فقط عندما يحتاجها عملك.",
      items: [
        { title: "إدارة فرق المشاريع", body: "نظّم العمال النشطين والمشرفين وتعيينات المشاريع." },
        { title: "موافقات سجلات الدوام", body: "وافق أو ارفض أو عالج التعديلات مع سجل تاريخ واضح." },
        { title: "تجربة عامل متعددة اللغات", body: "وجّه العمال بالعربية أو الإنجليزية أو الأردية أو الهندية عبر تيليجرام." },
        { title: "تقارير العمليات", body: "راجع الساعات الأسبوعية والشهرية وصدّر سجلات CSV مرتبة." },
      ],
    },
    industries: {
      eyebrow: "مصمم للعمل الميداني", title: "مفيد لكل فريق ينتقل بين المشاريع والمشرفين.",
      body: "حل مركز للشركات الإماراتية النامية التي ما زالت تدير الساعات عبر الجداول أو الورق أو المحادثات.",
      items: ["البناء والمقاولات", "التجهيزات والتجديد", "الأعمال الكهروميكانيكية والتكييف", "إدارة المرافق", "خدمات التنظيف", "خدمات الأمن"],
    },
    pricing: {
      eyebrow: "أسعار شهرية واضحة", title: "اختر الباقة المناسبة لفريقك الميداني.",
      body: "تشمل كل باقة إدارة المشاريع وسجلات الدوام ومسار تيليجرام الأساسي. انتقل إلى باقة أعلى مع نمو الفريق والإدارة.",
      monthly: "شهرياً", currencyNote: "دولار أمريكي · فوترة شهرية لكل مؤسسة", popular: "الأكثر اختياراً",
      plans: [
        {
          id: "basic", name: "الأساسية", price: 29, description: "للمقاول الصغير الذي ينقل فريقه الأول من الورق والجداول إلى نظام واضح.", cta: "ابدأ بالأساسية",
          features: ["حتى 15 عاملاً نشطاً", "3 مشاريع نشطة", "حسابان للإدارة", "إرسال الدوام عبر تيليجرام", "مسار موافقة سجلات الدوام", "العربية والإنجليزية والأردية والهندية", "تصدير CSV", "دعم اعتيادي عبر البريد"],
        },
        {
          id: "advanced", name: "المتقدمة", price: 49, featured: true, description: "للفرق النامية التي تنسق عدة مواقع ومشرفين في الوقت نفسه.", cta: "اختر المتقدمة",
          features: ["حتى 50 عاملاً نشطاً", "10 مشاريع نشطة", "5 حسابات للإدارة", "كل مزايا الأساسية", "تقارير أسبوعية وشهرية", "النزاعات وتأكيدات العمال", "متابعة تسليم الإشعارات", "دعم أولوية عبر البريد"],
        },
        {
          id: "professional", name: "الاحترافية", price: 99, description: "للعمليات الميدانية المستقرة التي تحتاج إلى مواقع ومديرين ورقابة أكثر.", cta: "اختر الاحترافية",
          features: ["حتى 150 عاملاً نشطاً", "مشاريع نشطة غير محدودة", "15 حساباً للإدارة", "كل مزايا المتقدمة", "سجل كامل للموافقات والتدقيق", "تقارير العمليات متعددة المواقع", "أولوية في طابور إشعارات تيليجرام", "تهيئة موجهة لمساحة العمل"],
        },
      ],
      footnote: "يمكن لعملاء الوصول المبكر تجربة مشروع واحد قبل اختيار الباقة المدفوعة. الأسعار المعروضة لا تشمل الضرائب المطبقة.",
    },
    languages: {
      title: "عملية واحدة. أربع لغات عمل.",
      body: "يمكن للمدير استخدام واجهة عربية أو إنجليزية، ويختار العامل اللغة الأوضح لإرسال بياناته اليومية.",
      items: ["العربية", "English", "اردو", "हिन्दी"],
    },
    faq: {
      eyebrow: "أسئلة شائعة", title: "ما يسأل عنه المقاولون قبل البدء.",
      items: [
        { question: "هل AmalCrew برنامج رواتب؟", answer: "لا. تركز النسخة الأولى على جمع ساعات العمل واعتمادها وتصديرها. يستطيع فريق المالية استخدام ملفات CSV المؤكدة ضمن نظام الرواتب الحالي." },
        { question: "هل يحتاج العامل إلى تثبيت تطبيق AmalCrew؟", answer: "لا يحتاج إلى تطبيق AmalCrew منفصل. ينضم العامل ويرسل الساعات عبر بوت تيليجرام، بينما يستخدم المدير لوحة التحكم على الويب." },
        { question: "هل يمكن أن يكون لكل مشروع فريق مختلف؟", answer: "نعم. يمكن تعيين العمال للمشاريع، ويراجع المشرف سجلات الدوام ضمن سياق المشروع المناسب." },
        { question: "هل يدعم العربية ولغات العمال من جنوب آسيا؟", answer: "نعم. تدعم واجهة المدير العربية والإنجليزية، ويدعم مسار العامل العربية والإنجليزية والأردية والهندية." },
        { question: "هل يناسب AmalCrew المقاول الصغير؟", answer: "هذه هي حالة الاستخدام الأساسية. صُمم المنتج للبدء بمشروع وفريق ومسار موافقة بسيط بدلاً من تنفيذ ERP طويل." },
        { question: "هل يمكنني تغيير الباقة مع نمو الفريق؟", answer: "نعم. تعتمد الباقات على عدد العمال النشطين والمشاريع وحسابات الإدارة، ويمكن للمؤسسة الانتقال إلى باقة أعلى مع توسع عملياتها الميدانية." },
      ],
    },
    cta: {
      eyebrow: "ابدأ تجربة أوضح", title: "ابدأ بموقع واحد وفريق واحد.",
      body: "أنشئ مساحة العمل وادعُ فريقك واختبر كيف تقلل سجلات الدوام الرقمية المؤكدة من المتابعة اليومية على المشرفين.",
      primary: "إنشاء مساحة العمل", secondary: "تسجيل الدخول",
    },
    contact: {
      telegram: "تواصل معنا عبر تيليجرام",
      telegramAriaLabel: "تواصل مع AmalCrew عبر تيليجرام",
    },
    footer: {
      description: "تتبع بسيط لساعات العمل وتأكيداتها لفرق المواقع في الإمارات والخليج.", product: "المنتج", company: "AmalCrew", location: "دبي · الإمارات العربية المتحدة", copyright: "جميع الحقوق محفوظة.",
    },
    metadata: {
      title: "برنامج سجلات دوام البناء لفرق المواقع في الإمارات",
      description: "أدر فرق المشاريع واجمع الدوام عبر تيليجرام ووافق على الساعات وصدّر سجلات مرتبة. باقات المقاولين في الإمارات تبدأ من 29 دولاراً شهرياً.",
      ogDescription: "سجلات دوام واضحة وموافقات سهلة للمقاولين في الإمارات.",
    },
  },
};
