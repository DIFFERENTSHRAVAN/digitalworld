import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDealerAuth } from '../../context/DealerAuthContext';
import {
  Briefcase,
  User,
  Phone,
  Mail,
  Lock,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { STORE_CONFIG } from '../../config/storeConfig';
import { DealerUser } from '../../types';

const INDIAN_STATES = [
  'Rajasthan', 'Gujarat', 'Delhi', 'Haryana', 'Madhya Pradesh', 'Punjab',
  'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana',
  'Andhra Pradesh', 'Bihar', 'West Bengal', 'Odisha', 'Assam', 'Kerala'
];

export const DealerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useDealerAuth();

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [businessType, setBusinessType] = useState('Computer & Laptop Hardware Retailer');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Rajasthan');
  const [pincode, setPincode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Submission Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedDealer, setSubmittedDealer] = useState<DealerUser | null>(null);

  const cleanWhatsapp = STORE_CONFIG.whatsappNumber.replace(/\D/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
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
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!address.trim() || !city.trim() || !pincode.trim()) {
      setError('Please complete the shop / business address details.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        business_name: businessName,
        contact_person: contactPerson,
        phone: cleanPhone,
        email,
        password,
        gst_number: gstNumber,
        business_type: businessType,
        address,
        city,
        state,
        pincode
      });

      if (res.success && res.dealer) {
        setSubmittedDealer(res.dealer);
      } else {
        setError(res.error || 'Failed to submit registration request. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN: Application Submitted and Pending
  if (submittedDealer) {
    const approvalChatText = `Namaste Vishal ji, I have registered my business "${submittedDealer.business_name}" on Digital World Dealer Portal. My assigned Dealer Reference is ${submittedDealer.dealer_code} and Phone is +91 ${submittedDealer.phone}. Please review and approve my B2B wholesale access.`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-dark to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
          <div className="bg-white text-charcoal py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                Application Pending Admin Approval
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-primary">
                Application Received!
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Thank you for applying for a Digital World B2B Wholesale account. Your application has been logged under:
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Dealer Reference:</span>
                <span className="font-bold text-primary">{submittedDealer.dealer_code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Business Name:</span>
                <span className="font-semibold">{submittedDealer.business_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Contact Person:</span>
                <span className="font-medium">{submittedDealer.contact_person}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Registered Mobile:</span>
                <span className="font-medium">+91 {submittedDealer.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold text-amber-600 uppercase">Pending Verification</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-slate-700 leading-relaxed text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <strong>Verification Policy:</strong> Our store proprietor, <strong>Vishal Soni</strong>, verifies all dealer registrations to ensure trade safety and provide wholesale pricing discounts. Accounts are usually activated within 2 to 4 business hours.
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(approvalChatText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Fast-Track Verification on WhatsApp</span>
              </a>

              <Link
                to="/dealer/login"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Return to Dealer Login Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-dark to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white relative">
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <div className="bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/20 inline-flex items-center gap-3 shadow-xl">
              <Logo />
              <span className="text-xs font-bold uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                B2B Registration
              </span>
            </div>
          </Link>
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-white">
            Apply for B2B Dealer Wholesale Account
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            Get access to dealer wholesale pricing, refurbished laptop lots, and bulk order discounts
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white text-charcoal py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information Section */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-secondary" />
                <span>1. Business / Firm Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-muted mb-1">
                    Registered Business / Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Soni Infotech"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-muted mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Full name of owner / manager"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-muted mb-1">
                    GSTIN Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 08AAAAA0000A1Z5"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-muted mb-1">
                    Business Nature
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                  >
                    <option value="Computer & Laptop Hardware Retailer">Computer & Laptop Hardware Retailer</option>
                    <option value="Laptop Repair & Refurbished Resale">Laptop Repair & Refurbished Resale</option>
                    <option value="IT Service & AMC Provider">IT Service & AMC Provider</option>
                    <option value="Mobile & Electronics Shop">Mobile & Electronics Shop</option>
                    <option value="CCTV & Networking Integrator">CCTV & Networking Integrator</option>
                    <option value="Other Electronics Business">Other Electronics Business</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary" />
                <span>2. Contact & Communications</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-muted mb-1">
                    10-Digit Mobile / WhatsApp Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-500 text-xs font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9829012345"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-r-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Used for WhatsApp order alerts and dealer login.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-muted mb-1">
                    Business Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shop@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Business Address Section */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>3. Shop / Warehouse Location</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-muted mb-1">
                    Shop / Warehouse Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop number, market, road name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal-muted mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Jaipur"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-muted mb-1">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-muted mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="302001"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Portal Security / Password */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-secondary" />
                <span>4. Portal Password</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-muted mb-1">
                    Create Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-muted mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Dealer Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Already have an account */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <span className="text-xs text-slate-500">Already have an approved dealer account? </span>
            <Link to="/dealer/login" className="text-xs font-bold text-secondary hover:underline">
              Sign In to Dealer Portal
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Digital World Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
