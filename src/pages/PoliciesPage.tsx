import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { STORE_CONFIG } from '../config/storeConfig';
import { ShieldCheck, RotateCcw, Truck, Lock, CheckCircle2 } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const { settings } = useStoreSettings();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-10 text-left">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-primary">Store Policies & Transparency</h1>
        <p className="text-xs text-charcoal-muted mt-1">
          Honest terms, clear warranty conditions, and genuine personal accountability by Vishal Soni.
        </p>
      </div>

      {/* Warranty Policy */}
      <section id="warranty" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-blue-50 text-secondary rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">In-Shop Testing Warranty Policy</h2>
            <p className="text-xs text-charcoal-muted">Applicable to all certified refurbished laptops</p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-charcoal-muted leading-relaxed space-y-3">
          <p>
            {settings.warranty_policy_text}
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-charcoal">
            <p className="font-bold text-primary">What is covered under our 30-Day Testing Warranty:</p>
            <ul className="list-disc pl-5 space-y-1 text-charcoal-muted">
              <li>Motherboard, processor, RAM, and internal SSD hardware integrity.</li>
              <li>Keyboard keys, trackpad, and physical connectivity ports.</li>
              <li>Display panel functionality (excluding customer-induced accidental cracks or liquid spills).</li>
              <li>Charger and power delivery operation.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Returns and Replacements */}
      <section id="returns" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Replacement & Return Policy</h2>
            <p className="text-xs text-charcoal-muted">Fair replacement process for defective items</p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-charcoal-muted leading-relaxed space-y-3">
          <p>
            {settings.return_policy_text}
          </p>
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <p className="font-bold">Simple Replacement Process:</p>
            <p>
              If you experience any technical or hardware issue with a purchased item, simply send a message or video of the issue to Vishal Soni on WhatsApp (+{settings.whatsapp_number || STORE_CONFIG.whatsappNumber}). We will arrange immediate inspection and replacement.
            </p>
          </div>
        </div>
      </section>

      {/* Delivery and Pickup */}
      <section id="delivery" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Delivery & Store Pickup Terms</h2>
            <p className="text-xs text-charcoal-muted">Dispatch timelines and courier handling</p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-charcoal-muted leading-relaxed space-y-2">
          <p>{settings.delivery_service_areas}</p>
          <p>
            All electronic items are packaged using multi-layer bubble wrap and reinforced corrugated boxing to ensure zero transit damage.
          </p>
        </div>
      </section>

      {/* Privacy and Personal Data */}
      <section id="privacy" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-slate-100 text-charcoal rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Customer Privacy & Security</h2>
            <p className="text-xs text-charcoal-muted">How we protect your phone number and address</p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-charcoal-muted leading-relaxed space-y-2">
          <p>
            At Digital World, your phone number, WhatsApp contact, and delivery address are strictly used for order fulfillment, dispatch updates, and warranty verification. We never sell or share customer contact data with third-party telemarketers or advertisers.
          </p>
          <p>
            No credit or debit card details are ever stored on our servers.
          </p>
        </div>
      </section>
    </div>
  );
};
