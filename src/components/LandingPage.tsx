import { Bell, CalendarDays, Home, Play } from 'lucide-react';

const googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.homefitly.app';

const features = [
  { icon: Bell, title: 'Set recurring reminders', description: 'Set a schedule for the jobs you do again and again, from changing filters to testing smoke alarms.' },
  { icon: Home, title: 'Organize upkeep by area', description: 'Group tasks by the parts of your home you care for, like the kitchen, yard, or heating and cooling system.' },
  { icon: CalendarDays, title: 'See what’s coming up', description: 'Use the maintenance calendar to see what’s due and plan your next weekend of home care.' },
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

function MaintenancePreview() {
  return (
    <figure className="rounded-3xl border border-brand-200 bg-white p-5 shadow-lg shadow-brand-800/5 sm:p-7">
      <figcaption className="flex items-center gap-2 text-sm font-semibold text-brand-800">
        <CalendarDays className="size-5" aria-hidden="true" />
        Example maintenance schedule
      </figcaption>
      <p className="mt-3 text-2xl font-bold text-slate-900">Coming up at home</p>
      <ul className="mt-4 divide-y divide-brand-100">
        {[
          { name: 'Change the air filter', area: 'Heating & cooling', date: 'This week' },
          { name: 'Test smoke alarms', area: 'Home safety', date: 'Next week' },
          { name: 'Clean the gutters', area: 'Exterior', date: 'Later this month' },
        ].map(({ name, area, date }) => (
          <li key={name} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3">
            <div>
              <p className="font-semibold text-slate-900">{name}</p>
              <p className="text-sm text-slate-600">{area}</p>
            </div>
            <span className="rounded-full bg-clay-50 px-2.5 py-1 text-xs font-semibold text-[#783d27]">{date}</span>
          </li>
        ))}
      </ul>
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
            <a href="/help/" className={`inline-flex min-h-11 items-center rounded hover:underline ${focus}`}>Help</a>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="bg-[#FAF7F2]">
          <div className={`${container} grid items-center gap-9 py-10 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20`}>
            <div>
              <p className="mb-3 text-sm font-bold tracking-wider text-brand-700 uppercase">Home maintenance app</p>
              <h1 className="max-w-xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">Keep up with your home’s maintenance</h1>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-700">Schedule recurring upkeep, set reminders, and see what’s due around your home in one calendar.</p>
              <div className="mt-6"><DownloadLink /></div>
              <a href="/help/#downloads" className={`mt-2 inline-flex min-h-11 items-center rounded text-sm font-medium text-brand-800 underline underline-offset-4 ${focus}`}>iPhone and iPad download help</a>
            </div>
            <MaintenancePreview />
          </div>
        </section>

        <section id="features" className={`${container} py-12 sm:py-16`}>
          <h2 className="text-3xl font-bold tracking-tight">Make a plan for routine upkeep</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
                <Icon className="mb-3 size-6 text-brand-700" aria-hidden="true" />
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-slate-700">{description}</p>
              </div>
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
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-700">The free plan includes recurring tasks and reminders. HomeFitly Premium adds cloud sync and optional household task sharing where available. Check the app for current plan details.</p>
          <a href="/help/#membership" className={`mt-3 inline-flex min-h-11 items-center rounded font-semibold text-brand-800 underline underline-offset-4 ${focus}`}>See membership details</a>
        </section>

        <section id="notify" className="border-y border-brand-200 bg-brand-50">
          <div className={`${container} py-10`}>
            <h2 className="text-2xl font-bold">Ready to plan your home’s upkeep?</h2>
            <div className="mt-4"><DownloadLink /></div>
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
