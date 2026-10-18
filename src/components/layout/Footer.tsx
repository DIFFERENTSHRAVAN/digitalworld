import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { STORE_CONFIG } from '../../config/storeConfig';
import { BankDetailsCard } from '../common/BankDetailsCard';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Building,
  CreditCard,
  Truck
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useStoreSettings();
  const { t } = useLanguage();

  const effectivePhone = settings.contact_number || STORE_CONFIG.contactNumber;
  const effectiveWhatsapp = settings.whatsapp_number || STORE_CONFIG.whatsappNumber;
  const cleanWhatsapp = effectiveWhatsapp ? effectiveWhatsapp.replace(/\D/g, '') : '';
  const cleanPhone = effectivePhone ? effectivePhone.replace(/\D/g, '') : '';
  const address = settings.business_address || STORE_CONFIG.businessAddress;
  const mapsUrl = settings.google_maps_url || STORE_CONFIG.googleMapsUrl;

  return (
    <footer className="bg-slate-950 text-slate-300 border-t-2 border-amber-500/40 pt-14 pb-8 mt-20 text-sm">
      {/* Decorative top gold gradient accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent -mt-14 mb-14" />

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* Column 1: Store Brand & About (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <Logo isLight className="mb-2" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Your premier destination for certified laptops, desktop PCs, genuine RAM, ultra-fast SSDs, CCTV security systems, and high-performance electronics at genuine pricing.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Electronics Store</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Managed personally by <strong>{settings.owner_name}</strong>. Every refurbished laptop passes 28-point rigorous diagnostic testing before delivery.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700 font-semibold">
                ★ 4.9/5 Rating
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-semibold">
                ● 100% Genuine Parts
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links & Portals (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-amber-400 uppercase text-xs tracking-wider pb-2 border-b border-amber-500/30 flex items-center gap-1.5">
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-500/70" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-500/70" />
                  <span>All Electronics</span>
                </Link>
              </li>
              <li>
                <Link to="/category/second-hand-laptops" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-300 font-medium">
                  <ChevronRight className="w-3 h-3 text-amber-400" />
                  <span>2nd-Hand Laptops</span>
                </Link>
              </li>
              <li>
                <Link to="/order-lookup" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-500/70" />
                  <span>Track Order Status</span>
                </Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-500/70" />
                  <span>Store Policies & Warranty</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-500/70" />
                  <span>Contact & Bank Details</span>
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <Link
                  to="/dealer/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Dealer Portal (B2B)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Business Address (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-amber-400 uppercase text-xs tracking-wider pb-2 border-b border-amber-500/30 flex items-center gap-1.5">
              <span>Business Address</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Digital World</span>
                    <p className="text-slate-300 leading-relaxed text-[11px] mt-0.5 select-all">
                      {address}
                    </p>
                  </div>
                </div>

                {mapsUrl && (
                  <div className="pt-1.5">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline"
                    >
                      <span>Get Directions on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-300">
                    {settings.opening_hours || STORE_CONFIG.openingHours}
                  </span>
                </div>

                {cleanPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <a href={`tel:${cleanPhone}`} className="hover:text-white font-medium">
                      +{cleanPhone}
                    </a>
                  </div>
                )}

                {cleanWhatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <a
                      href={`https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-bold"
                    >
                      WhatsApp: +{cleanWhatsapp}
                    </a>
                  </div>
                )}

                {settings.email_address && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <a href={`mailto:${settings.email_address}`} className="hover:text-white text-slate-300">
                      {settings.email_address}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 4: Official Bank Details (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-extrabold text-amber-400 uppercase text-xs tracking-wider pb-2 border-b border-amber-500/30 flex items-center justify-between">
              <span>Official Bank Details</span>
              <span className="text-[10px] lowercase font-normal text-slate-400">1-click copy</span>
            </h4>
            <BankDetailsCard variant="dark" showInstructions={true} />
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div className="py-4 px-6 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300 mb-8">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-[11px]">100% Genuine Hardware</p>
              <p className="text-[10px] text-slate-400">Original OEM components</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-[11px]">30-Day Testing Warranty</p>
              <p className="text-[10px] text-slate-400">Direct in-shop support</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-[11px]">Safe All-India Delivery</p>
              <p className="text-[10px] text-slate-400">Multi-layer bubble packing</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-[11px]">COD & Pay on Delivery</p>
              <p className="text-[10px] text-slate-400">Cash, UPI, or Bank Transfer</p>
            </div>
          </div>
        </div>

        {/* Bottom bar & Copyright */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} <strong className="text-white">{settings.shop_name}</strong>. All rights reserved. Shop Owner: <strong className="text-white">{settings.owner_name}</strong>.
          </p>
          <div className="flex items-center gap-5 text-[11px]">
            <Link to="/policies#warranty" className="hover:text-amber-400 transition-colors">
              Warranty Terms
            </Link>
            <Link to="/policies#returns" className="hover:text-amber-400 transition-colors">
              Return Policy
            </Link>
            <Link to="/policies#privacy" className="hover:text-amber-400 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
