import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin, getCurrentAdmin } from '../../services/api';
import { Logo } from '../../components/common/Logo';
import { Lock, Mail, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@digitalworld.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const current = await getCurrentAdmin();
      if (current) {
        navigate('/admin');
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-card space-y-6 text-left">
        <div className="text-center space-y-2">
          <Logo className="justify-center" />
          <h1 className="text-xl font-extrabold text-primary pt-2">
            Shop Owner Portal
          </h1>
          <p className="text-xs text-charcoal-muted">
            Authorized administrative access for Vishal Soni
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Access Denied</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-charcoal mb-1">
              Admin Email / Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@digitalworld.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-charcoal-muted space-y-1">
            <span className="font-semibold text-primary block">Default Local Credentials:</span>
            <p>Email: <strong className="text-charcoal font-mono">admin@digitalworld.com</strong></p>
            <p>Password: <strong className="text-charcoal font-mono">admin123</strong></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-secondary-light" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-charcoal-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
