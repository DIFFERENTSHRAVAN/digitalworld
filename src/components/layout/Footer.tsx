import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

import { STORE_CONFIG } from '../../config/storeConfig';

export const Footer: React.FC = () => {
  const { settings } = useStoreSettings();
  const { t } = useLanguage();

  const effectivePhone = settings.contact_number || STORE_CONFIG.contactNumber;
  const effectiveWhatsapp = settings.whatsapp_number || STORE_CONFIG.whatsappNumber;
  const cleanWhatsapp = effectiveWhatsapp ? effectiveWhatsapp.replace(/\D/g, '') : '';
  const cleanPhone = effectivePhone ? effectivePhone.replace(/\D/g, '') : '';

  return (
    <footer className="bg-primary text-slate-300 border-t border-primary-dark pt-12 pb-8 mt-16 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Shop branding & statement */}
          <div className="space-y-4">
            <Logo isLight className="mb-2" />
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('footerAbout')}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-primary-dark/80 p-3 rounded-xl border border-primary-light/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Managed and verified by <strong>{settings.owner_name}</strong>. Certified 28-point tested laptops with in-shop warranty.
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-4 border-b border-primary-light/30 pb-2">
              Product Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/category/refurbished-laptops" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-light" />
                  Refurbished Laptops (Tested)
                </Link>
              </li>
              <li>
                <Link to="/category/new-laptops" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-light" />
                  Brand New Laptops
                </Link>
              </li>
              <li>
                <Link to="/category/storage-devices" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-light" />
                  Internal & External SSDs
                </Link>
              </li>
              <li>
                <Link to="/category/computer-accessories" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-light" />
                  Laptop Chargers & Adapters
                </Link>
              </li>
              <li>
                <Link to="/category/keyboards-and-mice" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-light" />
                  Keyboards & Mice
                </Link>
              </li>
              <li>
                <Link to="/category/monitors-and-displays" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-light" />
                  Monitors & Displays
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Policies */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-4 border-b border-primary-light/30 pb-2">
              Customer Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/order-lookup" className="hover:text-white transition-colors">
                  Track Your Order Status
                </Link>
              </li>
              <li>
                <Link to="/policies#warranty" className="hover:text-white transition-colors">
                  In-Shop Testing Warranty Policy
                </Link>
              </li>
              <li>
                <Link to="/policies#returns" className="hover:text-white transition-colors">
                  Replacement & Return Policy
                </Link>
              </li>
              <li>
                <Link to="/policies#delivery" className="hover:text-white transition-colors">
                  Delivery & Store Pickup Information
                </Link>
              </li>
              <li>
                <Link to="/policies#privacy" className="hover:text-white transition-colors">
                  Customer Privacy & Data Protection
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-400 hover:text-white transition-colors">
                  Shop Owner Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop Contact & Address */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-4 border-b border-primary-light/30 pb-2">
              Shop Contact Info
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-secondary-light shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white block">Shop Location:</span>
                  <span>{settings.business_address || STORE_CONFIG.businessAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-secondary-light shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white block">Opening Hours:</span>
                  <span>{settings.opening_hours || STORE_CONFIG.openingHours}</span>
                </div>
              </div>

              {cleanPhone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-secondary-light shrink-0" />
                  <a href={`tel:${cleanPhone}`} className="hover:text-white">
                    +{cleanPhone}
                  </a>
                </div>
              )}

              {cleanWhatsapp ? (
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    WhatsApp: +{cleanWhatsapp}
                  </a>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400">
                  (WhatsApp number configured in Admin)
                </div>
              )}

              {settings.email_address && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-secondary-light shrink-0" />
                  <a href={`mailto:${settings.email_address}`} className="hover:text-white">
                    {settings.email_address}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom banner & Copyright */}
        <div className="border-t border-primary-light/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} {settings.shop_name}. {t('rightsReserved')} Shop Owner: <strong>{settings.owner_name}</strong>.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Genuine Hardware
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Physical Store Inspection
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cash / Pay on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
