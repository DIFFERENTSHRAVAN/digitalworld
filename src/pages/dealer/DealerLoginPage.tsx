import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDealerAuth } from '../../context/DealerAuthContext';
import {
  Briefcase,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  Store,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { STORE_CONFIG } from '../../config/storeConfig';

export const DealerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useDealerAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<'pending' | 'suspended' | 'rejected' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorStatus(null);
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        navigate('/dealer/dashboard');
      } else {
        setError(res.error || 'Failed to sign in to dealer portal.');
        if (res.status === 'pending' || res.status === 'suspended' || res.status === 'rejected') {
          setErrorStatus(res.status);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (code: string, pass: string) => {
    setIdentifier(code);
    setPassword(pass);
    setError(null);
    setErrorStatus(null);
  };

  const cleanWhatsapp = STORE_CONFIG.whatsappNumber.replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-dark to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top Brand Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
          <div className="bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/20 inline-flex items-center gap-3 shadow-xl">
            <Logo />
            <span className="text-xs font-bold uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
              B2B Portal
            </span>
          </div>
        </Link>
        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Authorized Dealer Portal
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Exclusive wholesale pricing, refurbished laptop lots & bulk ordering
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white text-charcoal py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200">
          {/* Quick Demo Credentials Autofill Banner */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>Demo Dealer Credentials (One-Click Fill)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => fillDemoAccount('DLR-1001', 'dealer123')}
                className="px-2.5 py-1.5 bg-white border border-blue-300 hover:border-blue-500 hover:bg-blue-100/60 rounded-xl font-medium text-left transition-all"
              >
                <div className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Approved Dealer
                </div>
                <div className="text-[11px] text-slate-600">DLR-1001 • dealer123</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('DLR-1002', 'dealer123')}
                className="px-2.5 py-1.5 bg-white border border-amber-300 hover:border-amber-500 hover:bg-amber-100/60 rounded-xl font-medium text-left transition-all"
              >
                <div className="font-bold text-amber-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Pending Review
                </div>
                <div className="text-[11px] text-slate-600">DLR-1002 • dealer123</div>
              </button>
            </div>
          </div>

          {/* Account Status / Error Alerts */}
          {error && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm border leading-relaxed ${
                errorStatus === 'pending'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : errorStatus === 'suspended' || errorStatus === 'rejected'
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {errorStatus === 'pending' ? (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : errorStatus === 'suspended' ? (
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-2 flex-1">
                  <p className="font-semibold">{error}</p>
                  {errorStatus === 'pending' && (
                    <div className="pt-1">
                      <a
                        href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                          `Namaste Vishal ji, I registered as a dealer on Digital World and my application is pending verification. My Identifier: ${identifier}. Please expedite my approval.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Fast-Track on WhatsApp (+91 6377123270)</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
                Dealer Code / Registered Phone / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. DLR-1001 or 9829012345"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-charcoal font-medium placeholder:text-slate-400"
                />
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Enter your assigned Dealer Code (e.g. DLR-1001) or 10-digit registered mobile number.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                  Password
                </label>
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                    `Namaste Vishal ji, I am an authorized dealer and I forgot my dealer portal password. Please help me reset it.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-secondary hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-charcoal font-medium placeholder:text-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Verifying Dealer Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dealer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center space-y-3">
            <p className="text-xs text-slate-600">
              New electronics shop, computer technician, or laptop dealer?
            </p>
            <Link
              to="/dealer/register"
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>Apply for B2B Dealer Wholesale Account</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400 px-2">
          <Link to="/customer/login" className="hover:text-white flex items-center gap-1 transition-colors">
            <Store className="w-3.5 h-3.5" />
            <span>Retail Customer Login</span>
          </Link>
          <Link to="/" className="hover:text-white transition-colors">
            Back to Digital World Storefront →
          </Link>
        </div>
      </div>
    </div>
  );
};
