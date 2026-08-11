import React from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Store,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Globe,
  Lock,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onExploreDemo,
}) => {
  return (
    <div className="min-h-screen bg-jaxmart-bg text-jaxmart-navy flex flex-col font-sans">
      
      {/* Public Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-jaxmart-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-jaxmart-primary flex items-center justify-center text-white font-bold text-2xl shadow-jaxmart-card">
              J
            </div>
            <div>
              <span className="text-2xl font-black text-jaxmart-navy tracking-tight">
                Jaxmart<span className="text-jaxmart-teal">.</span>
              </span>
              <span className="ml-2 text-xs font-bold uppercase text-jaxmart-mediumBlue tracking-wider hidden sm:inline-block">
                B2B Network
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-jaxmart-primary transition-colors">Platform Features</a>
            <a href="#hierarchy" className="hover:text-jaxmart-primary transition-colors">Role Hierarchy</a>
            <a href="#security" className="hover:text-jaxmart-primary transition-colors">Security & Audits</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateLogin}
              className="px-4 py-2 text-sm font-semibold text-jaxmart-primary hover:text-jaxmart-navy transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={onNavigateRegister}
              className="px-5 py-2 bg-jaxmart-teal text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors shadow-sm"
            >
              Register Partner
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-jaxmart-navy via-jaxmart-primary to-jaxmart-navy text-white py-20 lg:py-28">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#36ADA3_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-jaxmart-teal mb-6">
            <ShieldCheck className="w-4 h-4 text-jaxmart-teal" />
            <span>Next-Gen Enterprise B2B Supply Chain Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Empowering B2B Commerce Across <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-jaxmart-teal via-white to-blue-200">
              Admins, Captains & Sellers
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Jaxmart provides an end-to-end B2B management suite built with 4-level Role Based Access Control, real-time audit logs, regional captain supervision, and seller catalog fulfillment.
          </p>

          {/* Action Callouts */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={onNavigateRegister}
              className="w-full sm:w-auto px-8 py-3.5 bg-jaxmart-teal text-white rounded-xl font-bold text-sm hover:bg-teal-500 shadow-jaxmart-lg transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Register Partner Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
            >
              <Globe className="w-4 h-4 text-jaxmart-teal" />
              <span>Explore Interactive Demo</span>
            </button>
          </div>

          {/* Trust Banner */}
          <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-gray-300 text-xs">
            <div>
              <span className="text-2xl font-extrabold text-white block">₹500Cr+</span>
              <span>Annual B2B Volume</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white block">10,000+</span>
              <span>Verified Sellers</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white block">500+</span>
              <span>Regional Captains</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white block">99.9%</span>
              <span>Audit Compliance</span>
            </div>
          </div>

        </div>
      </section>

      {/* Business Hierarchy Architecture Section */}
      <section id="hierarchy" className="py-16 lg:py-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase text-jaxmart-teal tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              4-Tier Governance Model
            </span>
            <h2 className="text-3xl font-extrabold text-jaxmart-navy mt-3">
              Structured Role-Based Access Control
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Every action flows seamlessly down the hierarchy while audit logs stream upward to Super Admins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Level 1: Super Admin */}
            <div className="p-6 bg-purple-50/50 rounded-xl border border-purple-200 shadow-jaxmart-sm flex flex-col justify-between hover:shadow-jaxmart-card transition-all">
              <div>
                <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold mb-4 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Level 1</span>
                <h3 className="text-xl font-bold text-jaxmart-navy mt-1">Super Admin</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Complete platform governance, security log monitoring, permission matrix configuration, and immutable audit logs inspection.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-purple-200/60 space-y-1.5 text-xs text-purple-900 font-semibold">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Full Audit Trail</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Manage Admins</li>
              </ul>
            </div>

            {/* Level 2: Admin */}
            <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-200 shadow-jaxmart-sm flex flex-col justify-between hover:shadow-jaxmart-card transition-all">
              <div>
                <div className="w-12 h-12 bg-jaxmart-primary text-white rounded-xl flex items-center justify-center font-bold mb-4 shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Level 2</span>
                <h3 className="text-xl font-bold text-jaxmart-navy mt-1">Regional Admin</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Oversee regional operations, onboard and supervise Captains, manage catalog approvals, and regional fulfillment pipelines.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-blue-200/60 space-y-1.5 text-xs text-blue-900 font-semibold">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-jaxmart-primary" /> Onboard Captains</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-jaxmart-primary" /> Regional Scope</li>
              </ul>
            </div>

            {/* Level 3: Captain */}
            <div className="p-6 bg-teal-50/50 rounded-xl border border-teal-200 shadow-jaxmart-sm flex flex-col justify-between hover:shadow-jaxmart-card transition-all">
              <div>
                <div className="w-12 h-12 bg-jaxmart-teal text-white rounded-xl flex items-center justify-center font-bold mb-4 shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Level 3</span>
                <h3 className="text-xl font-bold text-jaxmart-navy mt-1">Captain</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Direct supervision over Sellers, multi-step Seller onboarding, GST verification, product pricing sanity checks.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-teal-200/60 space-y-1.5 text-xs text-teal-900 font-semibold">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-jaxmart-teal" /> Onboard Sellers</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-jaxmart-teal" /> Seller Support</li>
              </ul>
            </div>

            {/* Level 4: Seller */}
            <div className="p-6 bg-amber-50/50 rounded-xl border border-amber-200 shadow-jaxmart-sm flex flex-col justify-between hover:shadow-jaxmart-card transition-all">
              <div>
                <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold mb-4 shadow-sm">
                  <Store className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Level 4</span>
                <h3 className="text-xl font-bold text-jaxmart-navy mt-1">Seller Partner</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Manage store products, update inventory levels, track customer purchase orders, and access revenue analytics.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-amber-200/60 space-y-1.5 text-xs text-amber-900 font-semibold">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Catalog & Stock</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Isolated View</li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* Platform Features Grid */}
      <section id="features" className="py-16 lg:py-24 bg-jaxmart-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-jaxmart-navy">
              Built for High-Scale Enterprise B2B Operations
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Everything required to scale B2B commerce with 100% compliance and visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-sm space-y-3">
              <div className="w-10 h-10 bg-jaxmart-primary/10 text-jaxmart-primary rounded-lg flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-jaxmart-navy">Multi-Step Wizards</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Streamlined 4-step Captain and 5-step Seller wizards with field validation, temporary credential generation, and instant audit log triggers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-sm space-y-3">
              <div className="w-10 h-10 bg-jaxmart-teal/10 text-jaxmart-teal rounded-lg flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-jaxmart-navy">Before/After Diff Drawer</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Super Admins can inspect exact field-level state changes (`OLD VALUE` vs `NEW VALUE`), IP telemetry, and user-agent metadata.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-sm space-y-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-jaxmart-navy">Permission Matrix</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Centralized matrix mapping platform features across all 4 role levels with real-time toggle switches and rule enforcement.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-jaxmart-navy text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to access the Jaxmart Management Portal?</h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto">
            Choose whether to sign in with your credentials or register a new Captain/Seller account.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={onNavigateLogin}
              className="w-full sm:w-auto px-8 py-3 bg-white text-jaxmart-navy font-bold rounded-lg text-sm hover:bg-gray-100 transition-colors shadow-md"
            >
              Sign In to Account
            </button>

            <button
              onClick={onNavigateRegister}
              className="w-full sm:w-auto px-8 py-3 bg-jaxmart-teal text-white font-bold rounded-lg text-sm hover:bg-teal-600 transition-colors shadow-md"
            >
              Register Partner Account
            </button>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="bg-jaxmart-navy border-t border-white/10 py-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Jaxmart B2B Platform. All rights reserved.</span>
          <div className="flex items-center space-x-4">
            <a href="#security" className="hover:text-white">Security Policy</a>
            <a href="#terms" className="hover:text-white">Terms of Governance</a>
            <a href="#privacy" className="hover:text-white">Privacy</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
