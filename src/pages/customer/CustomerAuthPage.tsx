import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import {
  User,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const CustomerAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, sendOtp, verifyOtpLogin } = useCustomerAuth();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  // Login Sub-mode: 'password' | 'otp'
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  // Form fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [displayOtp, setDisplayOtp] = useState<string | null>(null);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if there is a redirect destination (e.g. /checkout)
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/account';

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        navigate(redirectPath);
      } else {
        setError(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpNotice(null);
    setDisplayOtp(null);

    const clean = identifier.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10 && !identifier.includes('@')) {
      setError('Please enter a valid 10-digit mobile number or email address.');
      return;
    }

    setOtpSending(true);
    try {
      const res = await sendOtp(identifier);
      if (res.success) {
        setOtpSent(true);
        setOtpNotice(res.message);
        if (res.previewOtp) {
          setDisplayOtp(res.previewOtp);
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpLogin(identifier, otpCode);
      if (res.success) {
        navigate(redirectPath);
      } else {
        setError(res.error || 'Invalid OTP code.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name,
        phone: cleanPhone,
        email: email.trim() || undefined,
        password
      });

      if (res.success) {
        navigate(redirectPath);
      } else {
        setError(res.error || 'Failed to register account.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-muted/40">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6 text-left">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {authMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
          </h1>
          <p className="text-xs text-slate-500">
            {authMode === 'login' 
              ? 'Sign in to view your orders, saved addresses, and express checkout'
              : 'Join Digital World for fast order tracking and warranty service'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="flex p-1 bg-surface-muted rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-white text-primary shadow-xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'register'
                ? 'bg-white text-primary shadow-xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Authentication Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {otpNotice && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Security OTP Sent</p>
              <p>{otpNotice}</p>
            </div>
          </div>
        )}

        {/* ===================== TAB 1: SIGN IN ===================== */}
        {authMode === 'login' && (
          <div className="space-y-4 text-xs">
            {/* Sub-method toggle: Password vs OTP */}
            <div className="flex items-center justify-center gap-4 text-xs border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setOtpSent(false);
                  setError(null);
                }}
                className={`font-semibold pb-1 border-b-2 transition-all ${
                  loginMethod === 'password'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-charcoal-muted hover:text-charcoal'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp');
                  setError(null);
                }}
                className={`font-semibold pb-1 border-b-2 transition-all ${
                  loginMethod === 'otp'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-charcoal-muted hover:text-charcoal'
                }`}
              >
                Instant Mobile OTP
              </button>
            </div>

            {/* Method A: Password Login */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    10-Digit Mobile Number or Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      placeholder="e.g. 9876543210 or yourname@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-secondary-light" />
                  <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
                </button>
              </form>
            )}

            {/* Method B: Instant Mobile OTP */}
            {loginMethod === 'otp' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block font-bold text-charcoal mb-1">
                        10-Digit Mobile Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 font-bold text-charcoal-muted text-xs">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                          required
                          placeholder="9876543210"
                          className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={otpSending}
                      className="w-full py-3.5 bg-secondary hover:bg-secondary-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{otpSending ? 'Sending OTP Code...' : 'Get 6-Digit OTP'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* Prominent Instant OTP Display Box */}
                    {displayOtp && (
                      <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Security OTP Generated</span>
                          </span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                            Valid 10 Min
                          </span>
                        </div>

                        <p className="text-xs text-emerald-900">
                          Your 6-digit login verification code for <strong>+91 {identifier.replace(/\D/g, '').slice(-10)}</strong>:
                        </p>

                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 font-mono text-2xl font-black text-center tracking-widest text-[#7b0c1e] bg-white border border-emerald-300 py-1.5 rounded-xl shadow-inner select-all">
                            {displayOtp}
                          </div>
                          <button
                            type="button"
                            onClick={() => setOtpCode(displayOtp)}
                            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Auto-Fill</span>
                          </button>
                        </div>

                        <div className="text-[10.5px] text-slate-500 bg-white/80 p-2 rounded-lg border border-slate-200/60 leading-relaxed">
                          ℹ️ Enter the 6-digit verification code above or click <strong>Auto-Fill</strong>, then click <strong>Verify OTP</strong> to sign in.
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-charcoal mb-1 text-center">
                        Enter 6-Digit Code for +91 {identifier.slice(-10)}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder="123456"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-mono tracking-widest text-center text-lg font-bold focus:border-secondary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{loading ? 'Verifying...' : 'Verify OTP & Log In'}</span>
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode('');
                          setOtpNotice(null);
                          setDisplayOtp(null);
                        }}
                        className="text-[11px] text-charcoal-muted hover:text-primary cursor-pointer underline"
                      >
                        Change Mobile Number
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: REGISTER ===================== */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-charcoal mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1">
                10-Digit Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-charcoal-muted text-xs">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="9876543210"
                  className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1">
                Email Address <span className="text-slate-400 text-[10px]">(Optional for bills)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-charcoal mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ArrowRight className="w-4 h-4 text-secondary-light" />
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>
        )}

        {/* Security badge footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-charcoal-muted">
          <span className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </span>
          <Link to="/" className="text-secondary hover:underline">
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
};
