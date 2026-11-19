import { Bell, ClipboardList, FolderOpen, LayoutGrid, Moon, Play, Users } from 'lucide-react';

const appStoreUrl = 'https://apps.apple.com/us/app/homefitly/id6774662613';

const googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.homefitly.app';

const features = [
  { icon: Bell, title: 'Set recurring reminders', description: 'Set a schedule for the jobs you do again and again, from changing filters to testing smoke alarms.' },
  { icon: ClipboardList, title: 'Make a checklist your own', description: 'Browse maintenance checklists and turn a suggestion into a task with its own due date and reminder.' },
  { icon: FolderOpen, title: 'Keep home records together', description: 'Move projects from Ideas to Planning to Active, and keep receipts, warranties and service contacts close at hand.' },
  { icon: Users, title: 'Share the household work', description: 'With Premium, assign existing tasks, review completions and follow shared points and history. Choose who has Owner, Admin or Member access.' },
  { icon: Moon, title: 'Choose light or dark', description: 'On Android, pick Light, Dark or System in Settings. Appearance choices are also available in the newer iOS test build.' },
  { icon: LayoutGrid, title: 'Keep tasks on your home screen', description: 'Add task widgets on iPhone, iPad or Android. Android also offers household overview and approval widgets based on your access.' },
];

const steps = [
  { title: 'Install and open HomeFitly', description: 'Choose Continue as Guest to start with records stored on this device.' },
  { title: 'Add one maintenance task', description: 'Choose an area of your home and start with a job you already do, like changing your air filter.' },
  { title: 'Choose when it repeats', description: 'Set a due date and reminder. Allow notifications on your device if you want reminder alerts.' },
];

const supportLinks = [
  { label: 'Help Center', href: '/help/' },
  { label: 'Contact support', href: 'mailto:support@homefitly.com' },
  { label: 'Privacy Policy', href: '/privacy/' },
  { label: 'Terms of Use', href: '/terms/' },
  { label: 'Account & data deletion', href: '/account-deletion/' },
];

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-800';
const container = 'mx-auto max-w-6xl px-5 sm:px-8';

function Brand() {
  return (
    <a href="/" className={`inline-flex min-h-11 items-center gap-1.5 rounded font-bold text-brand-800 ${focus}`}>
      <svg width="36" height="36" viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="56" height="56" rx="16" fill="#2D5A3D" />
        <path d="M22 50 V22 M50 50 V22 M22 36 L36 26 L50 36" stroke="#FAF7F2" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      HomeFitly
    </a>
  );
}

function DownloadLink() {
  return (
    <a href={googlePlayUrl} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800 ${focus}`}>
      <Play className="size-4" aria-hidden="true" />
      Get it on Google Play
    </a>
  );
}

function AppleDownloadLink() {
  return (
    <a href={appStoreUrl} className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700 ${focus}`}>
      Download on the App Store
    </a>
  );
}

function AppPreview() {
  return (
    <figure className="mx-auto w-full max-w-72">
      <img src="/screenshots/home.png" width="1080" height="2400" alt="HomeFitly Home screen showing an air-filter task due today, warranty information and Family." className="h-auto w-full rounded-3xl border border-brand-200 shadow-lg shadow-brand-800/10" />
      <figcaption className="mt-3 text-center text-sm text-slate-600">Actual Android app · example home records</figcaption>
    </figure>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <a href="#main" className={`sr-only z-10 rounded bg-white p-3 font-semibold focus:not-sr-only focus:absolute focus:left-4 focus:top-4 ${focus}`}>
        Skip to content
      </a>
      <header className="border-b border-brand-100 bg-[#FAF7F2]">
        <div className={`${container} flex min-h-16 flex-wrap items-center justify-between gap-x-4`}>
          <Brand />
          <nav aria-label="Main navigation" className="flex flex-wrap gap-x-4 text-sm font-semibold text-brand-800 sm:gap-x-7">
            <a href="#how-it-works" className={`inline-flex min-h-11 items-center rounded hover:underline ${focus}`}>How it works</a>
            <a href="#downloads" className={`inline-flex min-h-11 items-center rounded hover:underline ${focus}`}>Download</a>
            <a href="/help/" className={`inline-flex min-h-11 items-center rounded hover:underline ${focus}`}>Help</a>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="bg-[#FAF7F2]">
          <div className={`${container} grid items-center gap-9 py-10 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20`}>
            <div>
              <p className="mb-3 text-sm font-bold tracking-wider text-brand-700 uppercase">Now on the App Store and Google Play</p>
              <h1 className="max-w-xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">A little care for everything at home.</h1>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-700">Bring your tasks, home projects, receipts and warranties together. Plan what’s next, remember what’s due, and share the work with your household.</p>
              <div className="mt-6 flex flex-wrap gap-3"><AppleDownloadLink /><DownloadLink /></div>
              <p className="mt-3 text-sm text-slate-600">Free to start · optional Premium subscription</p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-700">New on Android: version 1.1.3 brings clearer task dates and approval states, simpler Family navigation, and clearer widget actions. The iPhone/iPad update is awaiting Apple review.</p>
              <a href="/help/#downloads" className={`mt-2 inline-flex min-h-11 items-center rounded text-sm font-medium text-brand-800 underline underline-offset-4 ${focus}`}>iPhone and iPad download help</a>
            </div>
            <AppPreview />
          </div>
        </section>

        <section id="features" className={`${container} py-12 sm:py-16`}>
          <h2 className="text-3xl font-bold tracking-tight">From everyday chores to your next project</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
                <Icon className="mb-3 size-6 text-brand-700" aria-hidden="true" />
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-slate-700">{description}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-3xl leading-relaxed text-slate-600">On Android, multiple Owners can share full household access while one account manages the subscription. This option is in the newer iOS test build, not the current App Store release. Admins manage shared Tasks and Family; Members participate without approval rights. Restricted child-phone connections are not open to new customers yet.</p>
          <div className="mt-2 flex flex-wrap gap-x-6">
            <a href="/help/#family" className={`inline-flex min-h-11 items-center rounded font-semibold text-brand-800 underline underline-offset-4 ${focus}`}>Family access explained</a>
            <a href="/help/#widgets" className={`inline-flex min-h-11 items-center rounded font-semibold text-brand-800 underline underline-offset-4 ${focus}`}>Choose a widget</a>
          </div>
        </section>

        <section aria-labelledby="app-screens" className={`${container} pb-12 sm:pb-16`}>
          <h2 id="app-screens" className="text-3xl font-bold tracking-tight">Take a look inside</h2>
          <p className="mt-3 text-slate-600">Actual Android screens from our Google Play listing, with example tasks and projects.</p>
          <div className="mx-auto mt-7 grid max-w-2xl grid-cols-2 items-start gap-4 sm:gap-8">
            {[
              { file: 'tasks', title: 'Know what’s due', alt: 'HomeFitly Tasks with Today, Upcoming, Calendar and History views, and a task to replace the air filter.' },
              { file: 'projects', title: 'Give your next idea a home', alt: 'HomeFitly Projects with Ideas, Planning, Active and Completed stages, and an entryway project idea.' },
            ].map(({ file, title, alt }) => (
              <figure key={file}>
                <img src={`/screenshots/${file}.png`} width="1080" height="2400" loading="lazy" alt={alt} className="h-auto w-full rounded-2xl border border-brand-200" />
                <figcaption className="mt-3 font-semibold text-brand-800">{title}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-[#FAF7F2]">
          <div className={`${container} py-12 sm:py-16`}>
            <h2 className="text-3xl font-bold tracking-tight">Start with one task</h2>
            <ol className="mt-6 grid list-decimal gap-6 pl-6 marker:font-bold marker:text-brand-800 md:grid-cols-3 md:gap-10">
              {steps.map(({ title, description }) => (
                <li key={title} className="pl-1">
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-700">{description}</p>
                </li>
              ))}
            </ol>
            <a href="/help/#getting-started" className={`mt-4 inline-flex min-h-11 items-center rounded font-semibold text-brand-800 underline underline-offset-4 ${focus}`}>Read the setup guide</a>
          </div>
        </section>

        <section id="pricing" className={`${container} py-12 sm:py-16`}>
          <h2 className="text-3xl font-bold tracking-tight">Start free, share upkeep when you’re ready</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-700">The free plan includes unlimited tasks, recurring schedules and reminders, plus starter checklists and limited project, receipt, warranty and contact records. Premium adds cloud sync, expanded records, all 13 checklists and household task sharing.</p>
          <p className="mt-3 font-semibold">Premium: $9.99/month or $99.99/year in the U.S.</p>
          <p className="mt-2 text-sm text-slate-600">Optional, automatically renewing subscription. Review the price and billing period in your app store before subscribing.</p>
          <a href="/help/#membership" className={`mt-3 inline-flex min-h-11 items-center rounded font-semibold text-brand-800 underline underline-offset-4 ${focus}`}>See membership details</a>
        </section>

        <section id="downloads" className="border-y border-brand-200 bg-brand-50">
          <div className={`${container} py-10`}>
            <span id="notify" />
            <h2 className="text-2xl font-bold">Download HomeFitly</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-slate-700">Get HomeFitly from the App Store in the United States or from Google Play. If you already have HomeFitly, update the existing installation to keep using your saved home records.</p>
            <div className="mt-4 flex flex-wrap gap-3"><AppleDownloadLink /><DownloadLink /></div>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600">HomeFitly is available for iPhone and iPad on the U.S. App Store. Existing testers can continue using TestFlight. <a href="/help/#downloads" className={`rounded font-semibold text-brand-800 underline underline-offset-4 ${focus}`}>Download help</a></p>
          </div>
        </section>
      </main>

      <footer className="bg-[#FAF7F2]">
        <div className={`${container} py-7`}>
          <Brand />
          <nav aria-label="Support and policies" className="mt-2">
            <ul className="flex flex-wrap gap-x-6">
              {supportLinks.map(({ label, href }) => (
                <li key={href}><a href={href} className={`inline-flex min-h-11 items-center rounded text-sm font-medium text-brand-800 underline underline-offset-4 ${focus}`}>{label}</a></li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
