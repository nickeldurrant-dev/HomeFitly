import React from 'react';
import { Home, CheckSquare, Shield, Users, BookOpen, Star, ArrowRight, Download, Smartphone, Monitor, Crown, Zap, Calendar, FileText, Bell } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const features = [
    {
      icon: CheckSquare,
      title: 'Smart Task Management',
      description: 'Never miss important home maintenance with AI-powered task scheduling and smart reminders.'
    },
    {
      icon: Shield,
      title: 'Warranty Tracking',
      description: 'Scan and store all your warranties. Get alerts before they expire so you never lose coverage.'
    },
    {
      icon: Calendar,
      title: 'Maintenance Calendar',
      description: 'Personalized maintenance schedules based on your home\'s age, type, and features.'
    },
    {
      icon: FileText,
      title: 'Document Storage',
      description: 'Securely store receipts, manuals, and important home documents in the cloud.'
    },
    {
      icon: Users,
      title: 'Service Provider Network',
      description: 'Find trusted local contractors and service providers with verified reviews.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      content: 'HomeFitly has completely transformed how I manage my home. I never miss maintenance tasks anymore!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Property Manager',
      content: 'Managing multiple properties is so much easier now. The warranty tracking alone saves me thousands.',
      rating: 5
    },
    {
      name: 'Lisa Rodriguez',
      role: 'First-time Homeowner',
      content: 'As a new homeowner, HomeFitly taught me everything I needed to know about home maintenance.',
      rating: 5
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Happy Homeowners' },
    { number: '2M+', label: 'Tasks Completed' },
    { number: '$500K+', label: 'Warranty Claims Saved' },
    { number: '4.9/5', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">HomeFitly</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={onSignIn}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Home's
              <span className="text-blue-600 block">Best Friend</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The complete home management platform that helps you maintain, protect, and improve your home with smart reminders, warranty tracking, and expert guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <button
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg border border-gray-200 flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Download App</span>
              </button>
            </div>

            {/* Hero Image/Demo */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <CheckSquare className="h-8 w-8 text-green-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Tasks Completed</h3>
                    <div className="text-3xl font-bold text-green-600">24/30</div>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <Shield className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Warranties Tracked</h3>
                    <div className="text-3xl font-bold text-blue-600">12</div>
                    <p className="text-sm text-gray-600">Active coverage</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                    <Calendar className="h-8 w-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Next Service</h3>
                    <div className="text-lg font-bold text-orange-600">HVAC Tune-up</div>
                    <p className="text-sm text-gray-600">In 5 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Home
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From smart maintenance scheduling to warranty tracking, HomeFitly provides all the tools you need to keep your home in perfect condition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-blue-600" />
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
      <section className="py-20 bg-white">
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
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Set Up Your Home Profile</h3>
              <p className="text-gray-600">
                Enter your home details and we'll create a personalized maintenance plan based on your property's unique characteristics.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Smart Recommendations</h3>
              <p className="text-gray-600">
                Receive AI-powered task suggestions, maintenance schedules, and reminders tailored to your home's age, type, and features.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Stay on Top of Everything</h3>
              <p className="text-gray-600">
                Track warranties, complete tasks, store documents, and keep your home in perfect condition with minimal effort.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Homeowners Everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what our users are saying about HomeFitly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$0<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                  Up to 10 tasks
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                  Basic home profile
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                  Community support
                </li>
              </ul>
              
              <button
                onClick={onGetStarted}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Get Started Free
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Crown className="h-4 w-4" />
                  <span>Most Popular</span>
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$4.99<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600">Everything you need for home management</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                  Unlimited tasks & checklists
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                  Smart reminders & notifications
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                  Advanced warranty tracking
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                  Premium DIY guides
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                  Cloud document storage
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                  Priority support
                </li>
              </ul>
              
              <button
                onClick={onGetStarted}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Take HomeFitly Everywhere
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Download our mobile app to manage your home maintenance on the go. Available for iOS and Android.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center space-x-3">
              <Smartphone className="h-6 w-6" />
              <div className="text-left">
                <div className="text-xs text-gray-300">Download on the</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </button>
            <button 
              onClick={() => alert('iOS app launching soon! Sign up to be notified when it\'s available.')}
              className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center space-x-3"
            >
              <Smartphone className="h-6 w-6" />
              <div className="text-left">
                <div className="text-xs text-gray-300">Download on the</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </button>
            
            <button 
              onClick={() => alert('Android app launching soon! Sign up to be notified when it\'s available.')}
              className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center space-x-3"
            >
              <Smartphone className="h-6 w-6" />
              <div className="text-left">
                <div className="text-xs text-gray-300">Get it on</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </button>
            
            <button
              onClick={onGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center space-x-3"
            >
              <Monitor className="h-6 w-6" />
              <div className="text-left">
                <div className="text-xs text-blue-400">Or use the</div>
                <div className="text-lg font-semibold">Web App</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Home Management?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners who trust HomeFitly to keep their homes in perfect condition.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Get Started Today</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-gray-400 text-sm">
              No setup fees • Cancel anytime • Instant access
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Home className="h-8 w-8 text-blue-600" />
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
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                </button>
                <button 
                  onClick={() => window.open('https://twitter.com/homefitly', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                </button>
                <button 
                  onClick={() => window.open('https://instagram.com/homefitly', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Instagram</span>
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><button className="text-gray-400 hover:text-white transition-colors">Features</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Pricing</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Mobile App</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Integrations</button></li>
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
              © 2025 HomeFitly. All rights reserved. Made with ❤️ for homeowners everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;