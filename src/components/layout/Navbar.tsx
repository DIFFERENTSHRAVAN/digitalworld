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
  Languages,
  Clock,
  User,
  Briefcase,
  Home,
  Mic,
  Camera
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* =========================================================================
          MOBILE VIEWPORT (Exact Reference Image 5 Style: Festive Maroon & Gold Header)
          ========================================================================= */}
      <div className="md:hidden">
        {/* 1. Top Festive Status Bar (Image 5: "🪔 You are not logged in. 🪔") */}
        <div className="bg-[#6b0b1a] text-amber-200 text-[11px] py-1 px-3 text-center font-medium tracking-wide flex items-center justify-center gap-1.5 shadow-inner">
          <span className="text-amber-300">🪔</span>
          <span>
            {isLoggedIn && customer
              ? `Welcome, ${customer.name}`
              : 'You are not logged in.'}
          </span>
          <span className="text-amber-300">🪔</span>
        </div>

        {/* 2. Main Mobile Action Header (Image 5: Maroon Bar with Hamburger, Logo & Right Icons) */}
        <div className="bg-[#7b0c1e] text-white px-3 py-2 flex items-center justify-between shadow-md">
          {/* Left: Hamburger & Brand */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-white hover:text-amber-300 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                DW
              </div>
              <div className="leading-none">
                <span className="font-black text-sm tracking-wide text-white block">
                  DIGITAL <span className="text-amber-400">WORLD</span>
                </span>
                <span className="text-[8px] text-amber-200 tracking-wider uppercase font-semibold">
                  Electronics
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Icons (Image 5: Phone, Home, User, Cart with badge) */}
          <div className="flex items-center gap-3">
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="p-1.5 text-white hover:text-amber-300 transition-colors"
                title="Call Shop"
                aria-label="Call Shop"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}

            <Link
              to="/"
              className="p-1.5 text-white hover:text-amber-300 transition-colors"
              title="Home"
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
            </Link>

            <Link
              to={isLoggedIn ? "/account" : "/customer/login"}
              className="p-1.5 text-white hover:text-amber-300 transition-colors"
              title="Account"
              aria-label="Account"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Cart Button with Count Badge */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-1.5 text-white hover:text-amber-300 transition-colors relative cursor-pointer"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. Mobile Rounded Pill Search Bar (Image 5 Style) */}
        <div className="bg-[#fffdf9] px-3 py-2 border-b border-amber-300/40 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search laptops, printers, RAM, SSD..."
              className="w-full pl-9 pr-16 py-2 bg-white border border-amber-300/80 rounded-full text-xs text-charcoal shadow-inner focus:outline-hidden focus:border-[#7b0c1e] focus:ring-1 focus:ring-[#7b0c1e]/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />

            {/* Decorative icons matching Image 5 (Mic & Camera) or Search button */}
            <div className="absolute right-2.5 flex items-center gap-1.5 text-slate-400">
              <button
                type="submit"
                className="p-1 text-slate-500 hover:text-[#7b0c1e]"
                title="Search"
                aria-label="Submit search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-3 bg-slate-200" />
              <button
                type="button"
                onClick={() => handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}
                className="p-0.5 text-slate-400 hover:text-[#7b0c1e]"
                title="Voice Search"
                aria-label="Voice search"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}
                className="p-0.5 text-slate-400 hover:text-[#7b0c1e]"
                title="Visual Search"
                aria-label="Visual search"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* 4. Subtle Festive Golden Divider Garland (Image 5) */}
        <div className="h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" />
      </div>

      {/* =========================================================================
          DESKTOP VIEWPORT (Top utility bar & full navigation bar)
          ========================================================================= */}
      <div className="hidden md:block">
        {/* Top utility bar */}
        <div className="bg-[#0f172a] text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Shop Owner: <strong>{settings.owner_name}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{settings.opening_hours || STORE_CONFIG.openingHours}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-bold text-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp: +{cleanWhatsapp}</span>
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Shop</span>
                </a>
              )}

              {/* Dealer Wholesale B2B Button */}
              <Link
                to={isDealerLoggedIn ? "/dealer/dashboard" : "/dealer/login"}
                className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[11px] hover:from-amber-300 hover:to-amber-400 shadow-xs"
                title="Authorized Dealer Wholesale Portal"
              >
                <Briefcase className="w-3 h-3 text-slate-950" />
                <span>{isDealerLoggedIn ? `${dealer?.business_name || 'Dealer'} (B2B)` : 'Dealer B2B'}</span>
              </Link>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer text-xs"
                title="Toggle English / Hindi"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Main Navigation Bar */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="shrink-0">
              <Logo />
            </Link>

            {/* Desktop Search Bar with Golden Button */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laptops, RAM, SSD, monitors, CCTV..."
                className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-charcoal"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-xs transition-all cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Quick Links & Cart */}
            <div className="flex items-center gap-3">
              <Link
                to="/order-lookup"
                className="flex items-center gap-1.5 text-xs font-semibold text-charcoal hover:text-amber-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Package className="w-4 h-4 text-slate-500" />
                <span>Track Order</span>
              </Link>

              {/* Customer Account Button */}
              {isLoggedIn && customer ? (
                <Link
                  to="/account"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-amber-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-white transition-all shadow-xs"
                >
                  <User className="w-4 h-4 text-amber-600" />
                  <span className="max-w-[100px] truncate">{customer.name.split(' ')[0]}</span>
                </Link>
              ) : (
                <Link
                  to="/customer/login"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-amber-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white transition-all shadow-xs"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Customer Sign In</span>
                </Link>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-charcoal font-bold text-xs transition-all relative cursor-pointer"
                aria-label="Open cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span>{t('cart')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Category Navigation Sub-bar */}
        <nav className="bg-[#fffdfa] border-t border-slate-200/80 text-xs font-semibold">
          <div className="container mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1">
            <Link
              to="/products"
              className="px-3 py-1.5 rounded-lg text-slate-800 hover:text-amber-700 hover:bg-white transition-colors shrink-0"
            >
              All Electronics
            </Link>
            <Link
              to="/category/second-hand-laptops"
              className="px-3 py-1.5 rounded-lg text-amber-900 font-extrabold bg-amber-100/80 hover:bg-amber-200 transition-colors flex items-center gap-1.5 shrink-0 border border-amber-300"
            >
              <Laptop className="w-3.5 h-3.5 text-amber-700" />
              <span>2nd-Hand Laptops</span>
              <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase">
                Tested
              </span>
            </Link>
            <Link
              to="/category/ram-and-ssd"
              className="px-3 py-1.5 rounded-lg text-slate-800 hover:text-amber-700 hover:bg-white transition-colors shrink-0 font-bold"
            >
              RAM & SSD
            </Link>
            <Link
              to="/category/desktop-computers"
              className="px-3 py-1.5 rounded-lg text-slate-800 hover:text-amber-700 hover:bg-white transition-colors shrink-0"
            >
              Desktops
            </Link>
            <Link
              to="/category/cctv-and-security"
              className="px-3 py-1.5 rounded-lg text-slate-800 hover:text-amber-700 hover:bg-white transition-colors shrink-0"
            >
              CCTV & Security
            </Link>
            <Link
              to="/category/computer-accessories"
              className="px-3 py-1.5 rounded-lg text-slate-800 hover:text-amber-700 hover:bg-white transition-colors shrink-0"
            >
              Accessories
            </Link>
            <Link
              to="/contact"
              className="px-3 py-1.5 rounded-lg text-amber-900 hover:text-amber-950 font-bold hover:bg-amber-50 transition-colors shrink-0 flex items-center gap-1 ml-auto"
            >
              <span>Bank & Address</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OUT DRAWER MENU
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 animate-fade-in shadow-2xl">
          {/* Quick User / Dealer Shortcuts */}
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
                  <div className="text-[10px] text-charcoal-muted">My Account</div>
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
                  <div className="font-bold">Customer Login</div>
                  <div className="text-[10px] text-charcoal-muted">Sign In / Register</div>
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
                <div className="text-[10px] text-amber-800">B2B Wholesale</div>
              </div>
            </Link>
          </div>

          {/* Quick Nav Links */}
          <div className="border-t border-slate-100 pt-2 space-y-1 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-50 font-bold"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-50"
            >
              All Electronics Catalog
            </Link>
            <Link
              to="/category/second-hand-laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-amber-900 font-bold hover:bg-amber-50 flex items-center justify-between"
            >
              <span>Second-Hand Laptops (Tested)</span>
              <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                28-Pt Test
              </span>
            </Link>
            <Link
              to="/category/ram-and-ssd"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-50"
            >
              RAM and SSD Memory
            </Link>
            <Link
              to="/category/desktop-computers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-50"
            >
              Desktop Computers
            </Link>
            <Link
              to="/category/cctv-and-security"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-50"
            >
              CCTV & Security
            </Link>
            <Link
              to="/category/printers-and-scanners"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-50"
            >
              Printers & Scanners
            </Link>
            <Link
              to="/category/computer-accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-50"
            >
              Computer Accessories & Hubs
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[#7b0c1e] font-bold hover:bg-amber-50"
            >
              Business Address & Bank Details
            </Link>
            <Link
              to="/order-lookup"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-secondary font-semibold hover:bg-blue-50"
            >
              Track Order Status
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-50 text-xs"
            >
              Shop Owner Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
