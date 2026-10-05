import React from 'react';
import { Home, CheckSquare, Shield, Lightbulb, Hammer, Download, Smartphone, Calendar, FileText, Facebook, Twitter, Instagram } from 'lucide-react';

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
      description: 'Personalized maintenance schedules based on your home\'s age, type, and features.',
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
              <Home className="h-8 w-8 text-brand-600" />
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
            </nav>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 to-clay-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your home,
              <span className="text-clay-600 block">from idea to done.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get maintenance suggestions tailored to your home, organize and compare contractor quotes alongside your projects, and find every home record in seconds. Share responsibilities with your household so everyone helps keep your home running beautifully.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <button
                onClick={() => scrollToSection('download')}
                className="bg-white text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg border border-gray-200 flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Download App</span>
              </button>
            </div>

            {/* Hero Image/Demo */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 text-center mb-6">Sample home</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-clay-50 to-clay-100 rounded-xl p-6 border border-clay-200">
                    <Lightbulb className="h-8 w-8 text-clay-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Ideas Saved</h3>
                    <div className="text-3xl font-bold text-clay-600">18</div>
                    <p className="text-sm text-gray-600">and counting</p>
                  </div>
                  <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-xl p-6 border border-brand-200">
                    <Hammer className="h-8 w-8 text-brand-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Projects Planned</h3>
                    <div className="text-3xl font-bold text-brand-600">3</div>
                    <p className="text-sm text-gray-600">quotes in hand</p>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100">
                    <CheckSquare className="h-8 w-8 text-amber-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Tasks Done</h3>
                    <div className="text-3xl font-bold text-amber-600">24/30</div>
                    <p className="text-sm text-gray-600">this month</p>
                  </div>
                </div>
              </div>
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
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Capture Your Ideas</h3>
              <p className="text-gray-600">
                Save photos, links, and notes for the home you want. Every great project starts with a spark.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-brand-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Plan Your Projects</h3>
              <p className="text-gray-600">
                Turn ideas into plans. Outline the work, gather quotes, and keep everything organized in one place.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-brand-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Stay on Top of Maintenance</h3>
              <p className="text-gray-600">
                Get smart reminders and schedules tailored to your home, so nothing important ever slips.
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
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Unlimited tasks
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Basic home profile
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  3 warranties, 5 contacts, 1 project
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  10 receipts, 3 project ideas
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Community support
                </li>
              </ul>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-brand-50 to-clay-100 rounded-2xl p-8 border-2 border-brand-600 relative flex flex-col h-full">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">$4.99<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-500 text-sm mb-4">or $49.99/year, save about 17%</p>
                <p className="text-gray-600">Everything you need for home management</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Unlimited tasks and projects
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Unlimited warranties, contacts, receipts, ideas
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Family management with task assignment
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Kid task approval workflows
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Receipt and document scanning
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Warranty tracking with expiration alerts
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Contractor quote comparison
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Advanced task recommendations
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-brand-600 mr-3" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Select Premium to start your subscription. You can cancel anytime from your app store settings.
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
            <details className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What&apos;s included in the free plan?
              </summary>
              <p className="text-gray-600 mt-3">
                Unlimited tasks, a home profile, basic reminders, plus 3 warranties, 5 contacts, 1 project, 10 receipts, and 3 project ideas.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                When will the app be available?
              </summary>
              <p className="text-gray-600 mt-3">
                HomeFitly launches first on iPhone and is coming soon to the App Store, with Android to follow after the iOS launch.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I share tasks with family?
              </summary>
              <p className="text-gray-600 mt-3">
                Yes, Premium includes family household management with task assignment and rotation, plus kid task approval workflows.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                How do subscriptions work?
              </summary>
              <p className="text-gray-600 mt-3">
                Premium is $4.99/month or $49.99/year, managed through your app store. Cancel anytime.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section id="download" className="py-20 bg-gradient-to-r from-brand-700 to-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Take HomeFitly Everywhere
          </h2>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            HomeFitly for iPhone is coming soon to the App Store, with Android to follow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div
              className="bg-black text-white px-8 py-4 rounded-xl font-medium flex items-center space-x-3 relative cursor-default"
            >
              <Smartphone className="h-6 w-6" />
              <div className="text-left">
                <div className="text-lg font-semibold">App Store</div>
              </div>
              <span className="absolute -top-2.5 -right-2.5 bg-clay-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">Coming Soon</span>
            </div>

            <div
              className="bg-black text-white px-8 py-4 rounded-xl font-medium flex items-center space-x-3 relative cursor-default"
            >
              <Smartphone className="h-6 w-6" />
              <div className="text-left">
                <div className="text-lg font-semibold">Google Play</div>
              </div>
              <span className="absolute -top-2.5 -right-2.5 bg-clay-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Take Your Home From Idea to Done?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            HomeFitly for iPhone is coming soon to the App Store.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Home className="h-8 w-8 text-brand-600" />
                <span className="text-2xl font-bold text-white">HomeFitly</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The complete home management platform that helps you maintain, protect, and improve your home with smart technology.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => window.open('https://facebook.com/homefitly', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Facebook</span>
                  <Facebook className="w-6 h-6" />
                </button>
                <button
                  onClick={() => window.open('https://twitter.com/homefitly', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  <Twitter className="w-6 h-6" />
                </button>
                <button
                  onClick={() => window.open('https://instagram.com/homefitly', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Instagram</span>
                  <Instagram className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection('download')} className="text-gray-400 hover:text-white transition-colors">Mobile App</button></li>
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
              © 2026 HomeFitly. All rights reserved. Made with ❤️ for homeowners everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
