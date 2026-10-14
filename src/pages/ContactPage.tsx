import React, { useState } from 'react';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { STORE_CONFIG } from '../config/storeConfig';
import { BankDetailsCard } from '../components/common/BankDetailsCard';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building,
  Send,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useStoreSettings();
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const effectivePhone = settings.contact_number || STORE_CONFIG.contactNumber;
  const effectiveWhatsapp = settings.whatsapp_number || STORE_CONFIG.whatsappNumber;
  const cleanWhatsapp = effectiveWhatsapp ? effectiveWhatsapp.replace(/\D/g, '') : '';
  const cleanPhone = effectivePhone ? effectivePhone.replace(/\D/g, '') : '';
  const address = settings.business_address || STORE_CONFIG.businessAddress;
  const mapsUrl = settings.google_maps_url || STORE_CONFIG.googleMapsUrl;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    // Send directly via WhatsApp
    const message = encodeURIComponent(
      `Hello Vishal Soni (Digital World),\n\nMy Name: ${formName.trim()}\nPhone: ${formPhone.trim()}\nQuery: ${formMessage.trim() || 'I have an inquiry regarding products and pricing.'}`
    );
    const targetWhatsapp = cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`;
    window.open(`https://wa.me/${targetWhatsapp}?text=${message}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">
          Contact Us & Store Information
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
          Visit our physical store in Sri Ganganagar, reach out to Vishal Soni directly for technical guidance, or make bank transfers using our official verified account.
        </p>
      </div>

      {/* Main Grid: Contact Cards & Bank Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Address, Contact channels & Quick message */}
        <div className="lg:col-span-7 space-y-6">
          {/* Business Address Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-700">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">Physical Store Address</h2>
                <p className="text-xs text-charcoal-muted">Visit us for live product demo and testing</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-primary">Digital World</h3>
                <p className="text-sm text-charcoal-muted leading-relaxed select-all">
                  {address}
                </p>
              </div>

              {mapsUrl && (
                <div className="pt-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Open in Google Maps for Directions</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                  </a>
                </div>
              )}
            </div>

            {/* Direct Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone Support</span>
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-bold text-sm text-primary hover:text-secondary flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>+{cleanPhone}</span>
                </a>
                <p className="text-[11px] text-charcoal-muted">Mon to Sat (10 AM - 9 PM)</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">WhatsApp Support</span>
                <a
                  href={`https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sm text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>+{cleanWhatsapp}</span>
                </a>
                <p className="text-[11px] text-emerald-800">Instant reply & video inspections</p>
              </div>

              {settings.email_address && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Official Email</span>
                  <a
                    href={`mailto:${settings.email_address}`}
                    className="font-bold text-xs text-primary hover:text-secondary flex items-center gap-1.5 break-all"
                  >
                    <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{settings.email_address}</span>
                  </a>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Store Timings</span>
                <div className="font-bold text-xs text-primary flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{settings.opening_hours || STORE_CONFIG.openingHours}</span>
                </div>
                <p className="text-[11px] text-charcoal-muted">Sunday: By prior appointment</p>
              </div>
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-primary flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-600" />
              <span>Send Direct Inquiry to Vishal Soni</span>
            </h2>

            {submitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Inquiry Launched on WhatsApp!</span>
                </p>
                <p>Vishal Soni will respond to your query shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-charcoal mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-charcoal mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Product or Requirement Details</label>
                  <textarea
                    rows={3}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Tell us which laptop, RAM, SSD, or electronics item you are looking for..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp for Instant Response</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Bank Details Card & Transfer Instructions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950 rounded-3xl p-6 sm:p-7 border-2 border-amber-500/40 shadow-xl space-y-5 text-slate-200">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                Official Account Information
              </span>
              <h2 className="text-xl font-black text-white">
                Bank Transfer Details
              </h2>
              <p className="text-xs text-slate-400">
                Use the following verified bank account details for RTGS, NEFT, IMPS, or net-banking payments.
              </p>
            </div>

            {/* Component Card */}
            <BankDetailsCard variant="dark" showInstructions={true} />

            {/* How to Confirm Payment */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <h3 className="font-bold text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>How to Complete Bank Transfer Orders:</span>
              </h3>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>Place your order on the website or finalize items with Vishal Soni.</li>
                <li>Transfer the exact amount using NEFT, IMPS, or your banking app.</li>
                <li>Take a screenshot of the payment confirmation with the UTR / Transaction ID.</li>
                <li>
                  Share the receipt along with your <strong>Order Number</strong> on WhatsApp (+{cleanWhatsapp}).
                </li>
                <li>We will verify the credit and dispatch your package with tracking within 24 hours.</li>
              </ol>
            </div>

            <div className="pt-2 text-center text-xs text-slate-400">
              <p className="text-[11px]">
                Need an official GST Invoice? Please share your 15-digit GSTIN upon placing your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
