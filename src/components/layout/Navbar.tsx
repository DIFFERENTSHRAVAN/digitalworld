import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Phone,
  MessageCircle,
  Package,
  ShieldCheck,
  Laptop,
  Sparkles,
  Languages,
  Clock,
  User,
  Briefcase
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useDealerAuth } from '../../context/DealerAuthContext';
import { STORE_CONFIG } from '../../config/storeConfig';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { settings } = useStoreSettings();
  const { customer, isLoggedIn } = useCustomerAuth();
  const { dealer, isDealerLoggedIn } = useDealerAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const effectivePhone = settings.contact_number || STORE_CONFIG.contactNumber;
  const effectiveWhatsapp = settings.whatsapp_number || STORE_CONFIG.whatsappNumber;
  const cleanPhone = effectivePhone ? effectivePhone.replace(/\D/g, '') : '';
  const cleanWhatsapp = effectiveWhatsapp ? effectiveWhatsapp.replace(/\D/g, '') : '';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top utility bar */}
      <div className="bg-primary text-slate-200 text-xs py-1.5 px-4 border-b border-primary-dark">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary-light" />
              <span>Owner: <strong>{settings.owner_name}</strong></span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-secondary-light" />
              <span>{settings.opening_hours || '10:00 AM - 08:30 PM'}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {cleanWhatsapp ? (
              <a
                href={`https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">WhatsApp:</span>
                <span>+{cleanWhatsapp}</span>
              </a>
            ) : (
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                WhatsApp available after launch
              </span>
            )}

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="hidden lg:flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Shop</span>
              </a>
            )}

            {/* Dealer Quick Access Pill */}
            <Link
              to={isDealerLoggedIn ? "/dealer/dashboard" : "/dealer/login"}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-[11px] transition-colors shadow-xs"
              title="Authorized Dealer Wholesale Portal"
            >
              <Briefcase className="w-3 h-3 text-slate-950" />
              <span>{isDealerLoggedIn ? `${dealer?.business_name || 'Dealer'} (B2B)` : 'Dealer B2B'}</span>
            </Link>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary-light hover:bg-secondary text-white font-medium transition-colors cursor-pointer"
              title="Toggle English / Hindi"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-24 py-2 bg-surface-muted border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-charcoal placeholder:text-charcoal-light"
            />
            <Search className="w-4 h-4 text-charcoal-light absolute left-3.5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-light transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick links & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/order-lookup"
              className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-secondary px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>{t('navTrackOrder')}</span>
            </Link>

            {/* Customer Account / Sign In */}
            {isLoggedIn && customer ? (
              <Link
                to="/account"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary px-3 py-1.5 rounded-xl border border-slate-200 hover:border-secondary bg-surface-muted/60 hover:bg-white transition-all shadow-xs"
                title="Customer Account & Orders"
              >
                <User className="w-4 h-4 text-secondary" />
                <span className="max-w-[100px] truncate">{customer.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                to="/customer/login"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-charcoal hover:text-primary px-3 py-1.5 rounded-xl border border-slate-200 hover:border-primary/40 bg-white transition-all shadow-xs"
                title="Customer Sign In / Register"
              >
                <User className="w-4 h-4 text-charcoal-muted" />
                <span>Customer Sign In</span>
              </Link>
            )}

            {/* Dealer Portal B2B Button */}
            <Link
              to={isDealerLoggedIn ? "/dealer/dashboard" : "/dealer/login"}
              className="hidden lg:flex items-center gap-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 px-3 py-1.5 rounded-xl border border-amber-500/30 shadow-xs transition-all"
              title="Authorized Dealer Wholesale Portal"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isDealerLoggedIn ? 'Dealer Hub' : 'Dealer Portal'}</span>
              <span className="bg-slate-950 text-white text-[9px] px-1 py-0.2 rounded font-black tracking-wider uppercase ml-0.5">
                B2B
              </span>
            </Link>

            <Link
              to="/admin/login"
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-primary px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span>{t('navAdmin')}</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-surface-muted hover:bg-slate-100 border border-slate-200 rounded-xl text-charcoal font-semibold text-sm transition-all relative cursor-pointer"
              aria-label="Open cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-primary" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-primary">
                {t('cart')}
              </span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal hover:bg-slate-100 rounded-xl md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-2.5 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-20 py-2 bg-surface-muted border border-slate-300 rounded-xl text-sm text-charcoal"
            />
            <Search className="w-4 h-4 text-charcoal-light absolute left-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Category Navigation Bar (Desktop) */}
      <nav className="hidden md:block bg-surface-muted border-t border-slate-200/80 text-xs font-semibold">
        <div className="container mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1">
          <Link
            to="/products"
            className="px-3 py-1.5 rounded-lg text-charcoal hover:text-secondary hover:bg-white transition-colors shrink-0"
          >
            {t('navAllProducts')}
          </Link>
          <Link
            to="/category/refurbished-laptops"
            className="px-3 py-1.5 rounded-lg text-secondary font-bold bg-blue-50/80 hover:bg-blue-100/80 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{t('navUsedLaptops')}</span>
            <span className="bg-secondary text-white text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase">
              Tested
            </span>
          </Link>
          <Link
            to="/category/new-laptops"
            className="px-3 py-1.5 rounded-lg text-charcoal hover:text-secondary hover:bg-white transition-colors shrink-0"
          >
            {t('navNewLaptops')}
          </Link>
          <Link
            to="/category/computer-accessories"
            className="px-3 py-1.5 rounded-lg text-charcoal hover:text-secondary hover:bg-white transition-colors shrink-0"
          >
            {t('navAccessories')}
          </Link>
          <Link
            to="/category/storage-devices"
            className="px-3 py-1.5 rounded-lg text-charcoal hover:text-secondary hover:bg-white transition-colors shrink-0"
          >
            SSDs & Storage
          </Link>
          <Link
            to="/category/keyboards-and-mice"
            className="px-3 py-1.5 rounded-lg text-charcoal hover:text-secondary hover:bg-white transition-colors shrink-0"
          >
            Keyboards & Mice
          </Link>
          <Link
            to="/category/monitors-and-displays"
            className="px-3 py-1.5 rounded-lg text-charcoal hover:text-secondary hover:bg-white transition-colors shrink-0"
          >
            Monitors
          </Link>
          <Link
            to="/category/networking-devices"
            className="px-3 py-1.5 rounded-lg text-charcoal hover:text-secondary hover:bg-white transition-colors shrink-0"
          >
            Networking
          </Link>

          {/* Dealer Wholesale B2B Shortcut */}
          <div className="ml-auto pl-2 shrink-0">
            <Link
              to={isDealerLoggedIn ? "/dealer/dashboard" : "/dealer/login"}
              className="px-2.5 py-1 rounded-lg text-slate-950 font-bold bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-1.5 text-[11px] shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-slate-950" />
              <span>Wholesale Lots & Rates</span>
              <span className="bg-slate-950 text-white text-[9px] px-1 py-0.2 rounded font-black uppercase">
                B2B
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 animate-fade-in shadow-xl">
          {/* Customer & Dealer Quick Actions in Mobile Drawer */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {isLoggedIn && customer ? (
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-blue-50/80 text-primary border border-blue-200 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-secondary shrink-0" />
                <div className="truncate text-left">
                  <div className="font-bold truncate">{customer.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-charcoal-muted">Customer Account</div>
                </div>
              </Link>
            ) : (
              <Link
                to="/customer/login"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 text-charcoal border border-slate-200 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-charcoal-muted shrink-0" />
                <div className="text-left">
                  <div className="font-bold">Customer Sign In</div>
                  <div className="text-[10px] text-charcoal-muted">Login or Register</div>
                </div>
              </Link>
            )}

            <Link
              to={isDealerLoggedIn ? "/dealer/dashboard" : "/dealer/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-amber-50 text-slate-950 border border-amber-300 flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="truncate text-left">
                <div className="font-bold truncate">{isDealerLoggedIn ? 'Dealer Hub' : 'Dealer Portal'}</div>
                <div className="text-[10px] text-amber-800">Wholesale B2B</div>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              to="/category/refurbished-laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-blue-50 text-secondary border border-blue-200 flex flex-col gap-1 items-start"
            >
              <Laptop className="w-5 h-5 text-secondary" />
              <span>{t('navUsedLaptops')}</span>
              <span className="text-[10px] text-blue-600 font-normal">30-Day Testing Warranty</span>
            </Link>

            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-slate-50 text-primary border border-slate-200 flex flex-col gap-1 items-start"
            >
              <Sparkles className="w-5 h-5 text-secondary" />
              <span>{t('navAllProducts')}</span>
              <span className="text-[10px] text-slate-500 font-normal">Full Catalog</span>
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-2 space-y-1 text-sm font-medium">
            <Link
              to="/category/new-laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-charcoal hover:bg-slate-50"
            >
              New Laptops
            </Link>
            <Link
              to="/category/computer-accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-charcoal hover:bg-slate-50"
            >
              Computer Accessories & Chargers
            </Link>
            <Link
              to="/category/storage-devices"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-charcoal hover:bg-slate-50"
            >
              SSDs & Storage
            </Link>
            <Link
              to="/category/keyboards-and-mice"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-charcoal hover:bg-slate-50"
            >
              Keyboards & Mice
            </Link>
            <Link
              to="/order-lookup"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-secondary font-semibold hover:bg-blue-50"
            >
              Track Existing Order
            </Link>
            <Link
              to="/dealer/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-amber-700 font-semibold hover:bg-amber-50"
            >
              Dealer / B2B Wholesale Portal
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-charcoal-muted hover:bg-slate-50"
            >
              Shop Owner Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
