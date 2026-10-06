import React, { useState } from 'react';
import { CheckSquare, Shield, Lightbulb, Hammer, Calendar, FileText, Facebook, Twitter, Instagram, Bell, Check, ChevronDown } from 'lucide-react';

// HomeFitly logo: H monogram with roofline crossbar
const HomeFitlyLogo = ({ size = 32, variant = 'default' }: { size?: number; variant?: 'default' | 'white' }) => {
  const bg = variant === 'white' ? '#FAF7F2' : '#2D5A3D';
  const fg = variant === 'white' ? '#2D5A3D' : '#FAF7F2';
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" aria-label="HomeFitly logo">
      <rect x="8" y="8" width="56" height="56" rx="16" fill={bg}/>
      <path d="M22 50 V22 M50 50 V22 M22 36 L36 26 L50 36" stroke={fg} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// ---------- Waitlist form ----------
type Platform = 'iphone' | 'android';

const WaitlistForm: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState<Platform>('iphone');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setErrorMsg('Something went wrong. Please try again later.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ email: trimmed, platform }),
      });
      if (res.ok || res.status === 409) {
        // 409 = already on the list (unique email); treat as success
        setStatus('done');
      } else {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="bg-brand-50 border border-brand-200 rounded-2xl px-6 py-5 flex items-start space-x-3 max-w-xl mx-auto">
        <span className="bg-brand-600 rounded-full p-1.5 mt-0.5 shrink-0">
          <Check className="h-4 w-4 text-white" />
        </span>
        <div className="text-left">
          <p className="font-semibold text-brand-800">You&apos;re on the list!</p>
          <p className="text-brand-700 text-sm mt-1">We&apos;ll email you when HomeFitly launches.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto">
      <div className={`flex flex-col ${compact ? 'sm:flex-row' : 'sm:flex-row'} gap-3`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent text-base"
          disabled={status === 'sending'}
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          <Bell className="h-5 w-5" />
          <span>{status === 'sending' ? 'Joining...' : 'Notify Me'}</span>
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 mt-4" role="group" aria-label="Choose your platform">
        <span className="text-sm text-gray-500 mr-1">I use:</span>
        {(['iphone', 'android'] as Platform[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlatform(p)}
            aria-pressed={platform === p}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              platform === p
                ? 'bg-brand-700 border-brand-700 text-white'
                : 'bg-white border-gray-300 text-gray-600 hover:border-brand-600 hover:text-brand-700'
            }`}
          >
            {p === 'iphone' ? 'iPhone' : 'Android'}
          </button>
        ))}
      </div>
      {status === 'error' && (
        <p className="text-red-600 text-sm mt-3" role="alert">{errorMsg}</p>
      )}
    </form>
  );
};

// ---------- iPhone mockup frames ----------
const PhoneFrame: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <div className="flex flex-col items-center">
    <div className="w-[270px] rounded-[2.8rem] bg-gray-900 p-[10px] shadow-xl">
      <div className="rounded-[2.3rem] overflow-hidden bg-cream relative" style={{ backgroundColor: '#FAF7F2' }}>
        {/* Dynamic island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full z-10" />
        {/* Status bar */}
        <div className="flex justify-between items-center px-7 pt-3 pb-1 text-[11px] font-semibold text-gray-900">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-2.5 bg-gray-900 rounded-[3px] inline-block" />
          </span>
        </div>
        <div className="px-4 pb-5 pt-1 min-h-[380px]">
          {children}
        </div>
        {/* Home indicator */}
        <div className="flex justify-center pb-2">
          <div className="w-28 h-1 bg-gray-900/80 rounded-full" />
        </div>
      </div>
    </div>
    <p className="text-sm font-medium text-gray-600 mt-4 text-center max-w-[240px]">{label}</p>
  </div>
);

const MockupSchedule = () => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Maintenance</p>
    <h4 className="text-lg font-bold text-gray-900 mb-3">This month</h4>
    {[
      { task: 'Change HVAC filter', due: 'Due Oct 12', color: 'bg-clay-100 text-clay-700' },
      { task: 'Clean gutters', due: 'Due Oct 20', color: 'bg-brand-100 text-brand-700' },
      { task: 'Test smoke detectors', due: 'Due Oct 28', color: 'bg-brand-100 text-brand-700' },
    ].map((t, i) => (
      <div key={i} className="bg-white rounded-xl p-3 mb-2.5 shadow-sm border border-gray-100 flex items-center gap-3">
        <span className="w-5 h-5 rounded-md border-2 border-brand-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 truncate">{t.task}</p>
          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${t.color}`}>{t.due}</span>
        </div>
      </div>
    ))}
    <div className="bg-brand-700 rounded-xl p-3 mt-1 text-center">
      <p className="text-white text-[13px] font-semibold">+ 4 more scheduled</p>
    </div>
  </div>
);

const MockupQuotes = () => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Project</p>
    <h4 className="text-lg font-bold text-gray-900 mb-3">Fence Installation</h4>
    {[
      { name: 'ReMade Fence', price: '$8,500', best: true },
      { name: 'Titan Fence', price: '$9,200', best: false },
      { name: 'Top Rail', price: '$7,800', best: false },
    ].map((q, i) => (
      <div key={i} className={`rounded-xl p-3 mb-2.5 border ${q.best ? 'bg-white border-brand-600 shadow-sm' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-gray-900">{q.name}</p>
          <p className="text-[15px] font-bold text-brand-700">{q.price}</p>
        </div>
        {q.best && <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 bg-brand-100 text-brand-700">Best value</span>}
      </div>
    ))}
    <div className="bg-clay-600 rounded-xl p-3 mt-1 text-center">
      <p className="text-white text-[13px] font-semibold">Compare quotes</p>
    </div>
  </div>
);

const MockupFamily = () => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Household</p>
    <h4 className="text-lg font-bold text-gray-900 mb-3">Today&apos;s tasks</h4>
    {[
      { who: 'Andrew', task: 'Mow the lawn', done: true },
      { who: 'Zeke', task: 'Water the plants', done: true },
      { who: 'Mom', task: 'Review completed tasks', done: false },
    ].map((t, i) => (
      <div key={i} className="bg-white rounded-xl p-3 mb-2.5 shadow-sm border border-gray-100 flex items-center gap-3">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${t.done ? 'bg-brand-100 text-brand-700' : 'bg-clay-100 text-clay-700'}`}>
          {t.who[0]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-gray-500">{t.who}</p>
          <p className={`text-[13px] font-semibold ${t.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.task}</p>
        </div>
        {t.done
          ? <span className="bg-brand-600 rounded-full p-1 shrink-0"><Check className="h-3.5 w-3.5 text-white" /></span>
          : <span className="w-5 h-5 rounded-md border-2 border-gray-300 shrink-0" />}
      </div>
    ))}
    <p className="text-[11px] text-gray-500 text-center mt-2">Everyone helps keep home running beautifully</p>
  </div>
);

// ---------- FAQ item ----------
const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => (
  <details className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm group">
    <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
      {q}
      <ChevronDown className="h-5 w-5 text-gray-400 shrink-0 ml-4 transition-transform group-open:rotate-180" />
    </summary>
    <p className="text-gray-600 mt-3">{a}</p>
  </details>
);

// ---------- Main page ----------
const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Lightbulb,
      title: 'Capture Ideas',
      description: 'Save inspiration the moment you find it. Photos, links, and notes for the home you are dreaming about, all in one place.',
      accent: 'clay'
    },
    {
      icon: Hammer,
      title: 'Plan Projects',
      description: 'Turn ideas into real projects. Outline the work, organize and compare contractor quotes, and track every step until it is done.',
      accent: 'brand'
    },
    {
      icon: CheckSquare,
      title: 'Smart Task Management',
      description: 'Never miss important home maintenance with smart scheduling and reminders tailored to your home.',
      accent: 'brand'
    },
    {
      icon: Shield,
      title: 'Warranty Tracking',
      description: 'Scan and store all your warranties. Get alerts before they expire so you never lose coverage.',
      accent: 'brand'
    },
    {
      icon: Calendar,
      title: 'Maintenance Calendar',
      description: 'Personalized maintenance schedules based on your home\u2019s age, type, and features.',
      accent: 'brand'
    },
    {
      icon: FileText,
      title: 'Document Storage',
      description: 'Securely store receipts, manuals, and important home documents in the cloud.',
      accent: 'brand'
    }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <HomeFitlyLogo size={32} />
              <span className="text-2xl font-bold text-gray-900">HomeFitly</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Pricing
              </button>
              <a
                href="/help"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Help
              </a>
              <button
                onClick={() => scrollToSection('notify')}
                className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center space-x-2"
              >
                <Bell className="h-4 w-4" />
                <span>Notify Me</span>
              </button>
            </nav>

            {/* Mobile notify button */}
            <button
              onClick={() => scrollToSection('notify')}
              className="md:hidden bg-brand-700 hover:bg-brand-800 text-white font-semibold px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <Bell className="h-4 w-4" />
              <span>Notify Me</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 to-clay-100 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block bg-brand-700 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              Coming soon for iPhone
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your home,
              <span className="text-clay-600 block">from idea to done.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              HomeFitly keeps your home running beautifully. Get personalized maintenance reminders, organize projects, and share tasks with your household.
            </p>
            <div className="mb-14">
              <button
                onClick={() => scrollToSection('notify')}
                className="bg-brand-700 hover:bg-brand-800 text-white text-lg font-semibold px-10 py-4 rounded-xl transition-colors inline-flex items-center space-x-2 shadow-lg"
              >
                <Bell className="h-5 w-5" />
                <span>Notify Me at Launch</span>
              </button>
            </div>

            {/* App preview: iPhone mockups */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 md:gap-8">
              <PhoneFrame label="A personalized maintenance schedule for your home">
                <MockupSchedule />
              </PhoneFrame>
              <PhoneFrame label="Compare contractor quotes side by side">
                <MockupQuotes />
              </PhoneFrame>
              <PhoneFrame label="Share tasks with the whole household">
                <MockupFamily />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              One Place for Your Ideas, Projects, and Upkeep
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From the first spark of inspiration to the finished renovation, and every filter change in between.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isClay = feature.accent === 'clay';
              return (
                <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100">
                  <div className={`${isClay ? 'bg-clay-100' : 'bg-brand-100'} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
                    <Icon className={`h-6 w-6 ${isClay ? 'text-clay-600' : 'text-brand-600'}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How HomeFitly Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes and transform your home management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-clay-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-clay-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Tell us about your home.</h3>
              <p className="text-gray-600">
                Add its type, age, and features.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-brand-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get your maintenance plan.</h3>
              <p className="text-gray-600">
                Review suggested tasks and reminders tailored to your home.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-brand-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Manage everything together.</h3>
              <p className="text-gray-600">
                Save records, organize projects, and share responsibilities with your household.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you&apos;re ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 flex flex-col h-full">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$0<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Unlimited tasks
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Basic reminders
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Basic home profile
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  3 warranties, 5 contacts, 1 project
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  10 receipts, 3 project ideas
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Email support
                </li>
              </ul>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-brand-50 to-clay-100 rounded-2xl p-8 border-2 border-brand-600 relative flex flex-col h-full">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">$4.99<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-brand-800 font-semibold text-lg mb-4">or $49.99/year <span className="text-brand-600 font-medium text-sm">save about 17%</span></p>
                <p className="text-gray-600">Everything in Free, plus:</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Unlimited projects, warranties, contacts, receipts, and ideas
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Family management with task assignment
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Review and approve children&apos;s completed tasks
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Receipt and document scanning
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Warranty tracking with expiration alerts
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Contractor quote comparison
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Cross-device sync
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Advanced task recommendations
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3 shrink-0" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Subscriptions will be available inside the app at launch.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Common Questions
            </h2>
          </div>

          <div className="space-y-4">
            <FaqItem
              q="What\u2019s included in the free plan?"
              a="Unlimited tasks, a home profile, basic reminders, plus 3 warranties, 5 contacts, 1 project, 10 receipts, and 3 project ideas."
            />
            <FaqItem
              q="When will the app be available?"
              a="HomeFitly launches first on iPhone and is coming soon to the App Store, with Android to follow after the iOS launch."
            />
            <FaqItem
              q="Can I share tasks with family?"
              a="Yes, Premium includes family household management with task assignment and rotation, plus review and approval of children\u2019s completed tasks."
            />
            <FaqItem
              q="How do subscriptions work?"
              a="Premium is $4.99/month or $49.99/year, managed through your app store. Cancel anytime. Subscriptions will be available inside the app at launch."
            />
          </div>
        </div>
      </section>

      {/* Final CTA: Notify me at launch */}
      <section id="notify" className="py-24 bg-gradient-to-br from-brand-700 to-brand-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-white/15 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Coming soon for iPhone
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Be first to know when HomeFitly launches
          </h2>
          <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
            Join the waitlist and we&apos;ll email you the moment HomeFitly hits the App Store.
          </p>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/15">
            <WaitlistForm />
          </div>
          <p className="text-brand-200 text-sm mt-6">
            No spam, ever. One email at launch, unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <HomeFitlyLogo size={32} variant="white" />
                <span className="text-2xl font-bold text-white">HomeFitly</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The complete home management platform that helps you maintain, protect, and improve your home with smart technology.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => window.open('https://facebook.com/homefitly', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </button>
                <button
                  onClick={() => window.open('https://twitter.com/homefitly', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-6 h-6" />
                </button>
                <button
                  onClick={() => window.open('https://instagram.com/homefitly', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection('notify')} className="text-gray-400 hover:text-white transition-colors">Notify Me</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="mailto:support@homefitly.com" className="text-gray-400 hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="/account-deletion" className="text-gray-400 hover:text-white transition-colors">Account Deletion</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2026 HomeFitly. All rights reserved. Made with care for homeowners everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
