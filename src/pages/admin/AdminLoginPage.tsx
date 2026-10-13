import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin, getCurrentAdmin, requestAdminPasswordResetOtp, verifyOtpAndChangeAdminPassword } from '../../services/api';
import { Logo } from '../../components/common/Logo';
import { Lock, Mail, ShieldAlert, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound, Phone, User } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

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

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetNotice(null);
    if (!resetEmail) {
      setError('Please enter your registered admin email.');
      return;
    }
    setOtpSending(true);
    try {
      const res = await requestAdminPasswordResetOtp(resetEmail);
      setOtpSent(true);
      setResetNotice(res.message);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtpAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!resetOtp || resetOtp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    if (!newResetPassword || newResetPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    try {
      const res = verifyOtpAndChangeAdminPassword({
        newPassword: newResetPassword,
        otp: resetOtp,
        isForgotPassword: true
      });
      setResetSuccess(res.message);
      setTimeout(() => {
        setIsForgotPassword(false);
        setPassword(newResetPassword);
        setEmail(resetEmail);
        setResetSuccess(null);
        setOtpSent(false);
        setResetNotice(null);
      }, 2000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-card space-y-6 text-left">
        <div className="text-center space-y-2">
          <Logo className="justify-center" />
          <h1 className="text-xl font-extrabold text-primary pt-2">
            {isForgotPassword ? 'Reset Admin Password' : 'Shop Owner Portal'}
          </h1>
          <p className="text-xs text-charcoal-muted">
            {isForgotPassword 
              ? 'Receive a 6-digit verification OTP on your registered email to reset password'
              : 'Authorized administrative access for Vishal Soni'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Security Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {resetSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold">Password Reset Successful</p>
              <p>{resetSuccess} Redirecting to login...</p>
            </div>
          </div>
        )}

        {resetNotice && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2">
            <Mail className="w-4 h-4 shrink-0 text-secondary mt-0.5" />
            <div>
              <p className="font-bold">OTP Dispatched</p>
              <p>{resetNotice}</p>
            </div>
          </div>
        )}

        {!isForgotPassword ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-charcoal mb-1">
                Admin Email or 10-Digit Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@digitalworld.com or 6377123270"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-charcoal">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError(null);
                    setResetEmail(email || 'admin@digitalworld.com');
                  }}
                  className="text-[11px] text-secondary font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
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

            <div className="flex items-center justify-between text-[11px] text-charcoal-muted pt-1">
              <span className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted Owner Access</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Digital World Admin</span>
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
        ) : (
          <div className="space-y-4 text-xs">
            {!otpSent ? (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    Enter Registered Admin Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      placeholder="admin@digitalworld.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpSending}
                  className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-secondary-light" />
                  <span>{otpSending ? 'Sending Security Code...' : 'Send OTP to Email'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    6-Digit Verification OTP Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      required
                      placeholder="123456"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-mono tracking-widest text-center text-base font-bold focus:border-secondary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    New Secret Password (Min 6 chars)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Enter new password"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Verify OTP & Set New Password</span>
                </button>
              </form>
            )}

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                  setResetNotice(null);
                  setOtpSent(false);
                }}
                className="text-xs text-charcoal-muted hover:text-primary font-semibold"
              >
                ← Back to Admin Sign In
              </button>
            </div>
          </div>
        )}

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
