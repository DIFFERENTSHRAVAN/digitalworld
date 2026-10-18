import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Store,
  Headphones,
  FileText,
  ChevronDown,
  Heart,
  ArrowRight
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { ShopByCategoryAccordion } from '../category/ShopByCategoryAccordion';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useDealerAuth } from '../../context/DealerAuthContext';
import { STORE_CONFIG } from '../../config/storeConfig';
import { formatINR, getCategories, getPopularBrands } from '../../services/api';

const DESKTOP_NAV_CATEGORIES = [
  {
    id: 'refurbished-laptops',
    name: 'Refurbished Laptops',
    slug: 'refurbished-laptops',
    subcategories: [
      'Certified Refurbished Laptops (Tested)',
      'Commercial / Business Laptops (ThinkPad, Latitude)',
      'Gaming Laptops (High Performance)',
      'Laptop RAM (DDR4 / DDR5)',
      'Laptop NVMe SSD Storage',
      'Laptop Adapters & Original Chargers',
      'Laptop Keyboards & Batteries'
    ]
  },
  {
    id: 'desktop',
    name: 'Desktops',
    slug: 'desktop-computers',
    subcategories: [
      'Barebone Desktop',
      'Branded Desktop',
      'CPU (Processor)',
      'Open Box Desktop',
      'CPU Fan & Coolers',
      'Motherboard',
      'Desktop RAM (Memory)',
      'Graphic Card (GPU)',
      'Cabinet | RGB Fan'
    ]
  },
  {
    id: 'ram-ssd',
    name: 'RAM & SSD',
    slug: 'ram-and-ssd',
    subcategories: [
      'DDR4 High-Speed RAM',
      'DDR5 Next-Gen RAM',
      'M.2 NVMe Gen3 & Gen4 SSD',
      '2.5" SATA SSD',
      'DDR3 Desktop & Laptop RAM'
    ]
  },
  {
    id: 'storage',
    name: 'Storage',
    slug: 'storage-devices',
    subcategories: [
      'M.2 NVMe SSD (Gen3 & Gen4)',
      '2.5" SATA SSD (Crucial, EVM)',
      'Internal Desktop HDD',
      'Surveillance Hard Drives',
      'External Portable Hard Disk',
      'USB Pen Drives & MicroSD'
    ]
  },
  {
    id: 'display',
    name: 'Monitors',
    slug: 'monitors-and-displays',
    subcategories: [
      'Gaming Monitors (144Hz+)',
      'Full HD IPS Monitors (22", 24", 27")',
      '4K Professional Displays',
      'Curved Monitors',
      'Monitor Wall Mounts & Arms',
      'HDMI & DisplayPort Cables'
    ]
  },
  {
    id: 'security',
    name: 'CCTV Security',
    slug: 'cctv-and-security',
    subcategories: [
      'Dome CCTV Cameras (Indoor)',
      'Bullet CCTV Cameras (Outdoor IP67)',
      '4 / 8 / 16 Channel DVR & NVR',
      'CCTV Power Supply (SMPS)',
      '3+1 CCTV Cable Rolls (90m, 180m)',
      'BNC & DC Connectors',
      'Biometric Fingerprint & Face Machines'
    ]
  },
  {
    id: 'peripherals',
    name: 'Keyboards/Mice',
    slug: 'keyboards-and-mice',
    subcategories: [
      'Mechanical Gaming Keyboards',
      'Wireless Keyboard & Mouse Combos',
      'Ergonomic Optical Mice',
      'Gaming Mousepads',
      'HD Webcams with Mic',
      'USB Numeric Keypads'
    ]
  },
  {
    id: 'printers',
    name: 'Printers',
    slug: 'printers-and-scanners',
    subcategories: [
      'All-in-One Ink Tank Printers',
      'Monochrome Laser Printers',
      'Original Ink Bottles & Cartridges',
      'Thermal Receipt Printers',
      'Flatbed Document Scanners',
      'Barcode Scanners & Ribbons'
    ]
  },
  {
    id: 'networking',
    name: 'Networking',
    slug: 'networking-devices',
    subcategories: [
      'Dual-Band Wi-Fi 6 Routers',
      'Gigabit Network Switches',
      'CAT6 LAN Cable Rolls',
      'RJ45 Connectors & Crimpers',
      'USB Wi-Fi Dongles & Adapters',
      'Wi-Fi Range Extenders'
    ]
  },
  {
    id: 'mobility',
    name: 'Mobile Acc',
    slug: 'mobile-accessories',
    subcategories: [
      'Fast Charging Power Banks',
      'Type-C PD Fast Adapters',
      'Heavy Duty Braided Cables',
      'Mobile Stands & Car Mounts',
      'Bluetooth Earbuds & Neckbands'
    ]
  },
  {
    id: 'accessories',
    name: 'PC Accessories',
    slug: 'computer-accessories',
    subcategories: [
      'Thermal Paste (Cooler Master, Arctic)',
      'PC Cleaning Kits & Blower',
      'Spike Guards & Surge Protectors',
      'Cable Management Ties',
      'Anti-Static Screen Cleaners',
      'HDMI to VGA Converters',
      'SATA to USB 3.0 Adapter'
    ]
  },
  {
    id: 'software',
    name: 'Software',
    slug: 'other-electronics',
    subcategories: [
      'Quick Heal Total Security',
      'Kaspersky Antivirus',
      'Net Protector Total Security',
      'Windows 11 Pro License',
      'MS Office Professional'
    ]
  }
];

const POPULAR_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'Apple',
  'Crucial', 'EVM', 'Western Digital', 'Seagate', 'Kingston',
  'CP Plus', 'Hikvision', 'Dahua', 'Logitech', 'Zebronics',
  'TP-Link', 'D-Link', 'Canon', 'Epson', 'Frontech'
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems, subtotal, setIsCartDrawerOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { settings } = useStoreSettings();
  const { customer, isLoggedIn } = useCustomerAuth();
  const { dealer, isDealerLoggedIn } = useDealerAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [navCategories, setNavCategories] = useState(DESKTOP_NAV_CATEGORIES);
  const [navBrands, setNavBrands] = useState(POPULAR_BRANDS);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getCategories().then(cats => {
      if (cats && cats.length > 0) {
        const cleanCats = cats.filter(c =>
          c.slug !== 'laptops' &&
          c.slug !== 'new-laptops' &&
          c.id !== 'c2' &&
          !c.name.toLowerCase().includes('new laptop')
        );
        setNavCategories(cleanCats.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          subcategories: (c.subcategories || []).filter(sub => !sub.toLowerCase().includes('brand new'))
        })));
      }
    });
    getPopularBrands().then(brnds => {
      if (brnds && brnds.length > 0) {
        setNavBrands(brnds);
      }
    });
  }, []);

  const handleNavMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setBrandDropdownOpen(false);
      setMoreDropdownOpen(false);
    }, 200);
  };

  const handleCategoryMouseEnter = (catId: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveDropdown(catId);
    setBrandDropdownOpen(false);
    setMoreDropdownOpen(false);
  };

  const handleBrandMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setBrandDropdownOpen(true);
    setActiveDropdown(null);
    setMoreDropdownOpen(false);
  };

  const handleMoreMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMoreDropdownOpen(true);
    setActiveDropdown(null);
    setBrandDropdownOpen(false);
  };

  const activeCategoryData = navCategories.find(c => c.id === activeDropdown);
  // Show all store categories directly in the ribbon to fill the entire bar without empty gaps
  const primaryRibbonCats = navCategories.slice(0, 10);
  const moreRibbonCats = navCategories.slice(10);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleOpenDrawer = () => setCategoryDrawerOpen(true);
    window.addEventListener('open-category-drawer', handleOpenDrawer);
    return () => window.removeEventListener('open-category-drawer', handleOpenDrawer);
  }, []);

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
              <img
                src="/logo.png"
                alt="Digital World"
                className="w-8 h-8 rounded-full object-cover shrink-0 shadow-xs border border-amber-400/60"
              />
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
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-5">
            {/* Logo */}
            <Link to="/" className="shrink-0">
              <Logo />
            </Link>

            {/* Desktop Search Bar with Voice, Camera & Maroon Search Button (Matching Reference Image) */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laptops, printers, RAM, SSD..."
                className="w-full pl-4 pr-32 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#7b0c1e] focus:ring-1 focus:ring-[#7b0c1e]/20 text-charcoal shadow-inner"
              />
              <div className="absolute right-24 flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={() => handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}
                  className="p-1 hover:text-[#7b0c1e] transition-colors cursor-pointer"
                  title="Voice Search"
                  aria-label="Voice Search"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}
                  className="p-1 hover:text-[#7b0c1e] transition-colors cursor-pointer"
                  title="Visual Search"
                  aria-label="Visual Search"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <button
                type="submit"
                className="absolute right-1 px-4 py-1.5 bg-[#7b0c1e] hover:bg-[#5e0915] text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            {/* Quick Links & Cart (Matching Reference Image Icons) */}
            <div className="flex items-center gap-3.5">
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex flex-col items-center text-slate-600 hover:text-[#7b0c1e] transition-colors"
                  title="Call Shop"
                >
                  <Phone className="w-4 h-4 text-slate-700" />
                  <span className="text-[10px] font-semibold mt-0.5">Call</span>
                </a>
              )}

              <Link
                to="/contact"
                className="flex flex-col items-center text-slate-600 hover:text-[#7b0c1e] transition-colors"
                title="Store & Address"
              >
                <Store className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] font-semibold mt-0.5">Store</span>
              </Link>

              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-slate-600 hover:text-[#7b0c1e] transition-colors"
                  title="Customer Support"
                >
                  <Headphones className="w-4 h-4 text-slate-700" />
                  <span className="text-[10px] font-semibold mt-0.5">Help</span>
                </a>
              )}

              <Link
                to="/order-lookup"
                className="flex flex-col items-center text-slate-600 hover:text-[#7b0c1e] transition-colors"
                title="Track Order / Wishlist"
              >
                <Heart className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] font-semibold mt-0.5">Track</span>
              </Link>

              <Link
                to={isDealerLoggedIn ? "/dealer/dashboard" : "/dealer/login"}
                className="flex flex-col items-center text-amber-800 hover:text-[#7b0c1e] transition-colors"
                title="B2B Wholesale Portal"
              >
                <FileText className="w-4 h-4 text-amber-700" />
                <span className="text-[10px] font-bold mt-0.5">Wholesale</span>
              </Link>

              {/* Customer Account Button */}
              {isLoggedIn && customer ? (
                <Link
                  to="/account"
                  className="flex flex-col items-center text-slate-800 hover:text-[#7b0c1e] transition-colors"
                  title="My Account"
                >
                  <User className="w-4 h-4 text-[#7b0c1e]" />
                  <span className="text-[10px] font-bold mt-0.5 max-w-[65px] truncate">
                    {customer.name.split(' ')[0]}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/customer/login"
                  className="flex flex-col items-center text-slate-600 hover:text-[#7b0c1e] transition-colors"
                  title="Customer Login / Sign In"
                >
                  <User className="w-4 h-4 text-slate-700" />
                  <span className="text-[10px] font-semibold mt-0.5">Login</span>
                </Link>
              )}

              {/* Cart Button (Exact Maroon Match with Reference Image) */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#7b0c1e] hover:bg-[#5e0915] text-white rounded-lg font-bold text-xs transition-all shadow-xs cursor-pointer ml-1"
                aria-label="Open cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span>{totalItems} item(s) - {formatINR(subtotal)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Festive Garland Strip (Matching Reference Image) */}
        <div className="h-2 bg-[#4a0812] border-b border-amber-500/40 flex items-center justify-around overflow-hidden px-2">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-0.5 h-1 bg-amber-300/60" />
              <div className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-amber-400 shadow-[0_0_4px_#f59e0b]' : 'bg-rose-400'}`} />
            </div>
          ))}
        </div>

        {/* Desktop Category Navigation Ribbon (Deep Maroon Strip Matching Reference Image) */}
        <nav
          className="bg-[#5a0a16] text-white text-[11px] font-bold relative shadow-md z-40 select-none"
          onMouseLeave={handleNavMouseLeave}
        >
          {/* Desktop ribbon buttons - Continuous flow, filling the ribbon without middle empty gap */}
          <div className="w-full max-w-[1920px] mx-auto px-2 lg:px-4 flex items-center justify-start gap-1 lg:gap-1.5 overflow-x-auto scrollbar-none py-1">
            {/* 1. FAR LEFT: [☰ ALL CATEGORIES ▾] */}
            <button
              type="button"
              onClick={() => setCategoryDrawerOpen(true)}
              className="px-2.5 xl:px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer transition-all bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-xs text-[10.5px] xl:text-[11px]"
              title="Browse Full Category Catalogue"
            >
              <Menu className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>All Categories</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {/* 2. Shop By Brand Button */}
            <button
              type="button"
              onMouseEnter={handleBrandMouseEnter}
              onClick={() => {
                setBrandDropdownOpen(!brandDropdownOpen);
                setActiveDropdown(null);
                setMoreDropdownOpen(false);
              }}
              className={`px-2.5 xl:px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer transition-all text-[10.5px] xl:text-[11px] font-black ${
                brandDropdownOpen
                  ? 'bg-white text-[#5a0a16] shadow-md'
                  : 'bg-white/10 hover:bg-white hover:text-[#5a0a16] text-white'
              }`}
              title="Browse by OEM Brand"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Shop By Brand</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 3. All Category Buttons right after Shop By Brand - Fills the entire ribbon continuously */}
            {primaryRibbonCats.map((cat) => {
              const isOpen = activeDropdown === cat.id;
              return (
                <div key={cat.id} className="shrink-0">
                  <button
                    type="button"
                    onMouseEnter={() => handleCategoryMouseEnter(cat.id)}
                    onClick={() => {
                      if (activeDropdown === cat.id) {
                        navigate(`/category/${cat.slug}`);
                        setActiveDropdown(null);
                      } else {
                        handleCategoryMouseEnter(cat.id);
                      }
                    }}
                    className={`px-1.5 xl:px-2 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer flex items-center gap-0.5 text-[10.5px] xl:text-[11px] font-bold ${
                      isOpen
                        ? 'bg-white text-[#5a0a16] font-black shadow-md'
                        : 'text-white hover:bg-white/15 hover:text-amber-200'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronDown className={`w-2 h-2 transition-transform ${isOpen ? 'rotate-180 text-[#5a0a16]' : 'opacity-60'}`} />
                  </button>
                </div>
              );
            })}

            {/* More Categories Dropdown Button (Only if extra categories exist beyond primary) */}
            {moreRibbonCats.length > 0 && (
              <div className="shrink-0">
                <button
                  type="button"
                  onMouseEnter={handleMoreMouseEnter}
                  onClick={() => {
                    setMoreDropdownOpen(!moreDropdownOpen);
                    setActiveDropdown(null);
                    setBrandDropdownOpen(false);
                  }}
                  className={`px-2 xl:px-2.5 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 text-[10.5px] xl:text-[11px] font-black ${
                    moreDropdownOpen
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-amber-300 hover:bg-white/15 hover:text-white'
                  }`}
                  title="More Electronics Categories"
                >
                  <span>More</span>
                  <span className="text-[9px] bg-amber-500/40 text-amber-100 px-1 py-0.2 rounded-full font-bold">
                    +{moreRibbonCats.length}
                  </span>
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* =========================================================================
              UNCLIPPED MEGA-DROPDOWNS (Direct child of <nav>, zero overflow clip)
              ========================================================================= */}

          {/* 1. Shop By Brand Mega Dropdown */}
          {brandDropdownOpen && (
            <div
              className="absolute left-0 right-0 top-full bg-white text-slate-900 shadow-2xl border-b-4 border-[#7b0c1e] border-t border-amber-300 z-50 animate-fade-in"
              onMouseEnter={() => {
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                setBrandDropdownOpen(true);
              }}
              onMouseLeave={handleNavMouseLeave}
            >
              <div className="w-full max-w-[1850px] mx-auto px-4 lg:px-6 py-5">
                <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#7b0c1e]" />
                    <span className="text-base font-black text-[#5a0a16]">Shop By OEM Brand</span>
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      100% Genuine Certified
                    </span>
                  </div>
                  <Link
                    to="/products"
                    onClick={() => setBrandDropdownOpen(false)}
                    className="text-xs font-bold text-amber-800 hover:text-[#5a0a16] flex items-center gap-1 hover:underline"
                  >
                    <span>View All Products in Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {navBrands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        navigate(`/products?brand=${encodeURIComponent(brand)}`);
                        setBrandDropdownOpen(false);
                      }}
                      className="text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-[#5a0a16] text-xs font-bold text-slate-800 transition-all border border-slate-200/80 hover:border-amber-400 flex items-center gap-2 cursor-pointer group shadow-2xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shrink-0" />
                      <span className="truncate">{brand}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Sub-Category Mega Dropdown */}
          {activeCategoryData && (
            <div
              className="absolute left-0 right-0 top-full bg-white text-slate-900 shadow-2xl border-b-4 border-[#7b0c1e] border-t border-amber-300 z-50 animate-fade-in"
              onMouseEnter={() => {
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                setActiveDropdown(activeCategoryData.id);
              }}
              onMouseLeave={handleNavMouseLeave}
            >
              <div className="w-full max-w-[1850px] mx-auto px-4 lg:px-6 py-5">
                <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
                    <span className="text-base font-black text-[#5a0a16]">
                      {activeCategoryData.name} Components & Parts
                    </span>
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {activeCategoryData.subcategories.length} Sub-Categories
                    </span>
                  </div>
                  <Link
                    to={`/category/${activeCategoryData.slug}`}
                    onClick={() => setActiveDropdown(null)}
                    className="text-xs font-bold text-amber-800 hover:text-[#5a0a16] flex items-center gap-1 hover:underline"
                  >
                    <span>Explore All {activeCategoryData.name} Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {activeCategoryData.subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        navigate(`/products?category=${activeCategoryData.slug}&subcategory=${encodeURIComponent(sub)}`);
                        setActiveDropdown(null);
                      }}
                      className="text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-[#5a0a16] text-xs font-bold text-slate-800 transition-all border border-slate-200/80 hover:border-amber-400 flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:bg-[#7b0c1e] group-hover:scale-125 transition-all shrink-0" />
                        <span className="truncate">{sub}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-amber-700 font-bold ml-1 shrink-0">→</span>
                    </button>
                  ))}
                </div>

                {/* Helpful footer strip inside dropdown */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      30-Day Testing Warranty
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Package className="w-3.5 h-3.5 text-amber-600" />
                      100% Genuine Parts
                    </span>
                  </div>
                  {cleanWhatsapp && (
                    <a
                      href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Hello Vishal Soni, I am looking for parts under ${activeCategoryData.name} at Digital World.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                    >
                      <span>Need a custom component? WhatsApp Vishal Soni →</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. More Categories Mega Dropdown */}
          {moreDropdownOpen && (
            <div
              className="absolute left-0 right-0 top-full bg-white text-slate-900 shadow-2xl border-b-4 border-[#7b0c1e] border-t border-amber-300 z-50 animate-fade-in"
              onMouseEnter={() => {
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                setMoreDropdownOpen(true);
              }}
              onMouseLeave={handleNavMouseLeave}
            >
              <div className="w-full max-w-[1850px] mx-auto px-4 lg:px-6 py-5">
                <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#7b0c1e]" />
                    <span className="text-base font-black text-[#5a0a16]">Additional Electronics & Accessories</span>
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {moreRibbonCats.length} Categories
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDropdownOpen(false);
                      setCategoryDrawerOpen(true);
                    }}
                    className="text-xs font-bold text-amber-800 hover:text-[#5a0a16] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Open Full Category Catalogue (☰)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {moreRibbonCats.map(cat => (
                    <div key={cat.id} className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-amber-400 transition-colors">
                      <Link
                        to={`/category/${cat.slug}`}
                        onClick={() => setMoreDropdownOpen(false)}
                        className="font-black text-xs text-[#5a0a16] hover:underline flex items-center justify-between group"
                      >
                        <span className="group-hover:text-amber-800">{cat.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                      <div className="space-y-1">
                        {(cat.subcategories || []).slice(0, 5).map(sub => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              navigate(`/products?category=${cat.slug}&subcategory=${encodeURIComponent(sub)}`);
                              setMoreDropdownOpen(false);
                            }}
                            className="text-left block text-[11px] text-slate-600 hover:text-[#7b0c1e] hover:font-bold truncate w-full cursor-pointer"
                          >
                            • {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OUT DRAWER MENU (Reference Images 1 & 2: SHOP BY CATEGORY)
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#fcf9f2] border-t border-[#ebdcc6] px-3 py-3 space-y-3 animate-fade-in shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Quick User / Dealer Shortcuts */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {isLoggedIn && customer ? (
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white text-primary border border-amber-200 flex items-center gap-2 shadow-2xs"
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
                className="p-2.5 rounded-xl bg-white text-charcoal border border-amber-200 flex items-center gap-2 shadow-2xs"
              >
                <User className="w-4 h-4 text-charcoal-muted shrink-0" />
                <div className="text-left">
                  <div className="font-bold text-[#4a1525]">Customer Login</div>
                  <div className="text-[10px] text-charcoal-muted">Sign In / Register</div>
                </div>
              </Link>
            )}

            <Link
              to={isDealerLoggedIn ? "/dealer/dashboard" : "/dealer/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-amber-50 text-slate-950 border border-amber-300 flex items-center gap-2 shadow-2xs"
            >
              <Briefcase className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="truncate text-left">
                <div className="font-bold truncate text-[#4a1525]">{isDealerLoggedIn ? 'Dealer Hub' : 'Dealer Portal'}</div>
                <div className="text-[10px] text-amber-800">B2B Wholesale</div>
              </div>
            </Link>
          </div>

          {/* SHOP BY CATEGORY Accordion with Subcategories & Call/WhatsApp (Reference Images 1 & 2) */}
          <ShopByCategoryAccordion
            onSelectCategory={() => setMobileMenuOpen(false)}
            showHeader={true}
            className="shadow-none border-0 p-0 bg-transparent"
          />

          {/* Additional Utility Links */}
          <div className="border-t border-[#ebdcc6]/80 pt-2 flex items-center justify-between text-xs text-slate-600 px-1">
            <Link
              to="/order-lookup"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-primary font-medium"
            >
              Track Order Status
            </Link>
            <Link
              to="/policies#warranty"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              Store Policies & Warranty
            </Link>
          </div>
        </div>
      )}

      {/* =========================================================================
          GLOBAL / DESKTOP SLIDE-OUT CATEGORY DRAWER (Reference Images 1 & 2)
          ========================================================================= */}
      {categoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setCategoryDrawerOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-[#fcf9f2] h-full shadow-2xl z-10 flex flex-col border-r border-[#ebdcc6] overflow-hidden">
            {/* Drawer Top Header with Close [X] button */}
            <div className="p-3.5 bg-[#7b0c1e] text-white flex items-center justify-between border-b border-[#540d18] shadow-sm">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Digital World"
                  className="w-8 h-8 rounded-full object-cover shrink-0 shadow-xs border border-amber-400/60"
                />
                <div>
                  <span className="font-black text-sm tracking-wide block leading-none">
                    DIGITAL <span className="text-amber-400">WORLD</span>
                  </span>
                  <span className="text-[9px] text-amber-200 tracking-wider uppercase font-semibold">
                    Category Catalogue
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCategoryDrawerOpen(false)}
                className="p-1.5 rounded-lg text-white hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close category menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content: ShopByCategoryAccordion */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <ShopByCategoryAccordion
                onSelectCategory={() => setCategoryDrawerOpen(false)}
                showHeader={true}
                defaultExpandedId="desktop"
                className="shadow-none border-0 p-0 bg-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
