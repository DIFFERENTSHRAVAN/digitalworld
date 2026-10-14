import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '../types';
import { getProducts, getCategories } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { BrandCarousel } from '../components/common/BrandCarousel';
import { useLanguage } from '../context/LanguageContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { STORE_CONFIG } from '../config/storeConfig';

const CATEGORY_HARDWARE_IMAGES: Record<string, string> = {
  'desktop-computers': 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&auto=format&fit=crop&q=80',
  'laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80',
  'second-hand-laptops': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&auto=format&fit=crop&q=80',
  'storage-devices': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop&q=80',
  'ram-and-ssd': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&auto=format&fit=crop&q=80',
  'computer-accessories': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&auto=format&fit=crop&q=80',
  'keyboards-and-mice': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
  'printers-and-scanners': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&auto=format&fit=crop&q=80',
  'monitors-and-displays': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80',
  'cctv-and-security': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&auto=format&fit=crop&q=80',
  'networking-devices': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=80',
  'speakers-and-headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
  'mobile-accessories': 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80',
  'other-electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&auto=format&fit=crop&q=80'
};
import {
  Laptop,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HardDrive,
  Cpu,
  Keyboard,
  Monitor,
  Wifi,
  Smartphone,
  Sliders,
  PhoneCall,
  MessageCircle,
  Truck,
  RotateCcw,
  BadgePercent,
  Clock,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  Layers,
  Building,
  Check
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useStoreSettings();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [updatedProducts, setUpdatedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [trendingDeals, setTrendingDeals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [usedLaptops, setUsedLaptops] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Countdown timer for Deals of the Day (Image 1)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 38,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts()
        ]);

        setCategories(cats);
        setAllProducts(prods);

        // Segment products according to Reference Images 4 & 5
        const updated = prods.filter((p) => p.is_updated_product || p.id.includes('prod-'));
        setUpdatedProducts(updated.slice(0, 8));

        const arrivals = prods.filter((p) => p.is_new_arrival || p.is_featured);
        setNewArrivals(arrivals.slice(0, 8));

        const trending = prods.filter((p) => p.is_trending || (p.original_price && p.original_price > p.price));
        setTrendingDeals(trending.slice(0, 4));

        const best = prods.filter((p) => p.is_featured);
        setBestSellers(best.slice(0, 8));

        const laptops = prods.filter((p) => p.condition === 'second_hand');
        setUsedLaptops(laptops.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroSlides = [
    {
      badge: 'TOP BRANDED ELECTRONICS',
      title: 'Experience The Future Of Tech & Sound',
      subtitle: 'High-performance Desktop PCs, Certified Second-Hand Laptops, Lightning-Fast NVMe SSDs & Genuine Accessories.',
      startingPrice: '₹499',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1000&auto=format&fit=crop&q=80',
      accentColor: 'from-blue-950 via-slate-900 to-slate-950',
      link: '/products',
      ctaText: 'SHOP NOW'
    },
    {
      badge: 'TESTED & VERIFIED BY VISHAL SONI',
      title: 'Certified Second-Hand Laptops with Warranty',
      subtitle: '28-point rigorous diagnostic testing, pristine condition, upgraded SSD & RAM. Tested for professionals and students.',
      startingPrice: '₹14,999',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&auto=format&fit=crop&q=80',
      accentColor: 'from-amber-950 via-slate-900 to-slate-950',
      link: '/category/second-hand-laptops',
      ctaText: 'EXPLORE LAPTOPS'
    },
    {
      badge: 'CRUCIAL & EVM ORIGINAL',
      title: 'Upgrade Your PC with High-Speed RAM & SSD',
      subtitle: 'Boost multitasking, eliminate boot delays, and revive your old computer with 100% genuine memory upgrades.',
      startingPrice: '₹950',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1000&auto=format&fit=crop&q=80',
      accentColor: 'from-slate-900 via-indigo-950 to-slate-950',
      link: '/category/ram-and-ssd',
      ctaText: 'VIEW STORAGE'
    }
  ];

  const effectiveWhatsapp = settings.whatsapp_number || STORE_CONFIG.whatsappNumber;
  const cleanWhatsapp = effectiveWhatsapp ? effectiveWhatsapp.replace(/\D/g, '') : '';

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Hero Promotional Banner (Inspired by Reference Image 1) */}
      <section className="container mx-auto px-4 pt-3 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          {/* Main Hero Slider (8 cols) */}
          <div className="lg:col-span-8 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl bg-slate-950 text-white min-h-[220px] sm:min-h-[340px] lg:min-h-[420px] flex items-center">
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.accentColor} opacity-90 sm:opacity-85 mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                {/* Content Box */}
                <div className="relative z-20 p-4 sm:p-8 lg:p-12 max-w-xl space-y-2 sm:space-y-4 text-left">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-400 text-slate-950 text-[9px] sm:text-xs font-black tracking-widest uppercase">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{slide.badge}</span>
                  </div>

                  <h1 className="text-lg sm:text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {slide.title}
                  </h1>

                  <p className="text-[11px] sm:text-sm text-slate-300 leading-relaxed line-clamp-1 sm:line-clamp-3">
                    {slide.subtitle}
                  </p>

                  <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link
                      to={slide.link}
                      className="px-4 py-2 sm:px-7 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/25 flex items-center gap-1.5 sm:gap-2 transition-all transform hover:scale-105 cursor-pointer"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>

                    <div className="text-xs">
                      <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold">Starts from</span>
                      <span className="text-amber-400 font-extrabold text-sm sm:text-xl">
                        {slide.startingPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Dots */}
            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-12 z-30 flex items-center gap-1.5 sm:gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide ? 'w-6 sm:w-8 bg-amber-400' : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-sm border border-white/20 transition-all cursor-pointer hidden sm:flex items-center justify-center"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-sm border border-white/20 transition-all cursor-pointer hidden sm:flex items-center justify-center"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Mini Promotional Promo Cards (4 cols) - Inspired by Image 1 */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-4 justify-between">
            {/* Promo Card 1: RAM & SSD */}
            <Link
              to="/category/ram-and-ssd"
              className="group relative flex-1 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-blue-950 p-4 sm:p-6 text-white border border-amber-500/20 shadow-lg flex flex-col justify-between hover:border-amber-400/50 transition-all"
            >
              <div className="relative z-10 space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 inline-block">
                  PC Upgrade Hub
                </span>
                <h3 className="text-base sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                  RAM & NVMe SSD
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  DDR3, DDR4, Gen3 & Gen4 NVMe. Speed up your PC instantly.
                </p>
              </div>

              <div className="relative z-10 pt-3 sm:pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 group-hover:underline flex items-center gap-1">
                  <span>Shop Memory</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="text-xs font-black text-white bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                  From ₹850
                </span>
              </div>
            </Link>

            {/* Promo Card 2: B2B Dealer Wholesale */}
            <Link
              to="/dealer/login"
              className="group relative flex-1 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950 via-slate-950 to-slate-900 p-4 sm:p-6 text-white border-2 border-amber-500/40 shadow-lg flex flex-col justify-between hover:border-amber-400 transition-all"
            >
              <div className="relative z-10 space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400">
                    B2B Wholesale Portal
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                  Bulk Dealer Pricing
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  Exclusive wholesale prices on laptops, RAM, and electronics for verified dealers.
                </p>
              </div>

              <div className="relative z-10 pt-3 sm:pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 group-hover:underline flex items-center gap-1">
                  <span>Dealer Login / Register</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Special Rates
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Top Brands Strip (Reference Image 5) */}
      <section className="container mx-auto px-4">
        <BrandCarousel />
      </section>

      {/* 3. Product Categories Section (Reference Image 5 - 4 Columns on Mobile) */}
      <section className="container mx-auto px-4">
        {/* Section Header with Golden Accent */}
        <div className="flex items-end justify-between mb-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 mb-0.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Explore Categories</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-primary tracking-tight">
              Electronics & Hardware
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-primary hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            <span>View All ({categories.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Cards Grid (4 columns on mobile - Reference Image 5) */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-7 gap-2 sm:gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group bg-white hover:bg-amber-50/60 rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 border border-slate-200/90 hover:border-amber-400 hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer"
            >
              {/* Category Image Circle / Thumbnail */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white border border-slate-100 group-hover:border-amber-300 group-hover:scale-105 transition-all p-1 flex items-center justify-center shadow-2xs">
                <img
                  src={category.image_url || CATEGORY_HARDWARE_IMAGES[category.slug] || 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&auto=format&fit=crop&q=80'}
                  alt={category.name}
                  loading="lazy"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CATEGORY_HARDWARE_IMAGES[category.slug] || 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Category Name */}
              <h3 className="mt-1 text-[10px] sm:text-xs font-bold text-slate-800 group-hover:text-[#881337] transition-colors line-clamp-1 leading-tight">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Trust Badges Strip (Reference Image 2) */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 p-3.5 sm:p-6 bg-surface-muted rounded-2xl sm:rounded-3xl border border-slate-200">
          <div className="flex items-center gap-2.5 sm:gap-3 p-1.5">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-700 shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-primary">100% Genuine</h4>
              <p className="text-[10px] sm:text-[11px] text-charcoal-muted">Verified OEM hardware</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-1.5">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-primary">Testing Warranty</h4>
              <p className="text-[10px] sm:text-[11px] text-charcoal-muted">30-day shop support</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-1.5">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-700 shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-primary">Safe Delivery</h4>
              <p className="text-[10px] sm:text-[11px] text-charcoal-muted">Multi-layer bubble pack</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-1.5">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-purple-500/10 text-purple-700 shrink-0">
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-primary">Replacement</h4>
              <p className="text-[10px] sm:text-[11px] text-charcoal-muted">Easy shop replacement</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Limited Time Deals with Countdown Timer (Reference Image 1) */}
      {trendingDeals.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white border-2 border-amber-500/40 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Deals Of The Day</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Trending Electronics & Genuine Price Cuts
                </h2>
              </div>

              {/* Countdown Timer Display */}
              <div className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-2xl border border-amber-500/40">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-300 mr-1">Offer Ends In:</span>
                <div className="flex items-center gap-1.5 font-mono font-black text-xs sm:text-sm text-amber-400">
                  <span className="bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span>:</span>
                  <span className="bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span>:</span>
                  <span className="bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            {/* Trending Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trendingDeals.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg text-charcoal">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Updated Products Section (Reference Images 4 & 5) */}
      <section className="container mx-auto px-4">
        {/* Festive Center Decorative Ribbon Header (Reference Image 5) */}
        <div className="flex items-center justify-center my-5 sm:my-7">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-amber-500 flex-1" />
          <div className="px-3 sm:px-5 flex items-center gap-1.5 sm:gap-2 text-[#7b0c1e] font-black text-sm sm:text-xl tracking-tight uppercase">
            <span className="text-amber-500 text-xs sm:text-sm">🪔</span>
            <span>Updated Products</span>
            <span className="text-amber-600 text-xs font-serif">──♦──</span>
          </div>
          <div className="h-px bg-gradient-to-l from-transparent via-amber-400 to-amber-500 flex-1" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-slate-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {updatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. New Arrivals Section (Reference Images 4 & 5) */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-4 sm:mb-6 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 mb-0.5">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span>Just Added To Store</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-primary tracking-tight">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/products?sort=newest"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Certified Second-Hand Laptops (Tested by Vishal Soni) */}
      {usedLaptops.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-amber-200/80 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-amber-200/60">
              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full inline-block mb-1">
                  28-Point Benchmarked
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-primary">
                  Certified Second-Hand Laptops
                </h2>
                <p className="text-[11px] sm:text-xs text-charcoal-muted mt-0.5">
                  Personally inspected motherboards, pristine displays, fresh thermal paste, and 30-day testing warranty.
                </p>
              </div>

              <Link
                to="/category/second-hand-laptops"
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Browse All Laptops</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
              {usedLaptops.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Best-Sellers Collection */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-4 sm:mb-6 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-blue-500" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-primary tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 9. WhatsApp Hardware Consultation Banner */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-500/30 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
              Direct Technical Advisory
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Need a Custom PC Build or Second-Hand Laptop Advice?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Connect directly with Vishal Soni on WhatsApp. Share your budget and preferred specifications, and we will send you available units with original real photos and performance test videos.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            {cleanWhatsapp && (
              <a
                href={`https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}?text=${encodeURIComponent('Hello Vishal Soni, I would like to consult regarding electronics and laptops.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            )}

            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <span>Visit Shop / Bank Info</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
