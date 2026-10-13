import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '../types';
import { getProducts, getCategories } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { STORE_CONFIG } from '../config/storeConfig';
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
  BadgePercent
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useStoreSettings();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [usedLaptops, setUsedLaptops] = useState<Product[]>([]);
  const [specialOffers, setSpecialOffers] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, allProds] = await Promise.all([
          getCategories(),
          getProducts()
        ]);

        setCategories(cats);

        // Filter product segments
        setFeaturedProducts(allProds.filter(p => p.is_featured).slice(0, 8));
        setUsedLaptops(allProds.filter(p => p.condition === 'second_hand').slice(0, 4));
        setSpecialOffers(allProds.filter(p => p.is_special_offer));
        setRecentProducts(allProds.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop className="w-6 h-6 text-secondary" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-secondary" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-secondary" />;
      case 'Keyboard': return <Keyboard className="w-6 h-6 text-secondary" />;
      case 'Monitor': return <Monitor className="w-6 h-6 text-secondary" />;
      case 'HardDrive': return <HardDrive className="w-6 h-6 text-secondary" />;
      case 'Wifi': return <Wifi className="w-6 h-6 text-secondary" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6 text-secondary" />;
      default: return <Sliders className="w-6 h-6 text-secondary" />;
    }
  };

  const effectiveWhatsapp = settings.whatsapp_number || STORE_CONFIG.whatsappNumber;
  const cleanWhatsapp = effectiveWhatsapp ? effectiveWhatsapp.replace(/\D/g, '') : '';

  return (
    <div className="space-y-14">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-muted to-white border-b border-slate-200 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-secondary text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight leading-tight">
                {t('heroTitle')}
              </h1>

              <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-2xl">
                {t('heroSubtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/products"
                  className="px-6 py-3.5 bg-primary hover:bg-primary-light text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>{t('shopNow')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/category/refurbished-laptops"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-secondary border border-secondary/40 font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Laptop className="w-4 h-4 text-secondary" />
                  <span>{t('exploreUsedLaptops')}</span>
                </Link>

                {cleanWhatsapp && (
                  <a
                    href={`https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-sm rounded-xl transition-all flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/80 text-xs font-semibold text-charcoal">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>28-Point Benchmarking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30-Day Testing Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cash / Pay on Delivery</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-primary p-1 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"
                  alt="Digital World Laptop Workshop"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent rounded-2xl flex flex-col justify-end p-6 text-white">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 space-y-1">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
                      Personal Quality Guarantee
                    </span>
                    <p className="text-sm font-semibold">
                      "I inspect every motherboard, thermal paste, and screen personally before dispatch."
                    </p>
                    <p className="text-xs text-slate-300 font-medium">
                      — Vishal Soni, Founder & Technician
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-primary tracking-tight">
              {t('categories')}
            </h2>
            <p className="text-xs text-charcoal-muted mt-1">
              Select category to view verified electronics and components
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-xs hover:shadow-card hover:border-secondary/40 transition-all flex flex-col items-center text-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50 border border-slate-200/80 group-hover:border-blue-200 flex items-center justify-center transition-colors">
                {getCategoryIcon(category.icon)}
              </div>
              <h3 className="text-xs font-bold text-charcoal group-hover:text-secondary transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Special Offers Banner (Shown only when offers exist) */}
      {specialOffers.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-900 via-primary to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-extrabold uppercase">
                  <BadgePercent className="w-4 h-4" />
                  <span>Limited Special Offers</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Featured Deals & Discounted Hardware
                </h2>
              </div>
              <Link
                to="/products?special_offers=true"
                className="px-4 py-2 bg-white text-primary text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                View All Deals
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialOffers.slice(0, 3).map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden text-charcoal shadow-lg">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Affordable Refurbished Laptop Deals */}
      {usedLaptops.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full mb-1 border border-amber-200">
                <Laptop className="w-3.5 h-3.5" />
                <span>Inspected by Vishal Soni</span>
              </div>
              <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                {t('laptopDeals')}
              </h2>
            </div>
            <Link
              to="/category/refurbished-laptops"
              className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
            >
              <span>View All Refurbished Laptops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {usedLaptops.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Best-Selling Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-primary tracking-tight">
              {t('bestSellers')}
            </h2>
            <p className="text-xs text-charcoal-muted mt-1">
              Popular laptops, components, and accessories chosen by local buyers
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-slate-100 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Why Shop With Digital World? */}
      <section className="bg-surface-muted py-14 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">
              {t('whyShopWithUs')}
            </h2>
            <p className="text-sm text-charcoal-muted">
              {t('whySubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-secondary flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-primary">
                {t('featureTestedTitle')}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {t('featureTestedDesc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-primary">
                {t('featureWarrantyTitle')}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {t('featureWarrantyDesc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-primary">
                {t('featureTransparentTitle')}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {t('featureTransparentDesc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-primary">
                {t('featureWhatsAppTitle')}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {t('featureWhatsAppDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Recently Added Products */}
      {recentProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                {t('recentProducts')}
              </h2>
              <p className="text-xs text-charcoal-muted mt-1">
                Latest stock arrivals directly added to the shop catalog
              </p>
            </div>
            <Link
              to="/products?sort=newest"
              className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 8. WhatsApp Direct Inquiry Banner */}
      <section className="container mx-auto px-4">
        <div className="bg-emerald-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-300">
              Personalized Hardware Advisory
            </span>
            <h3 className="text-2xl font-extrabold">
              Need a Custom Laptop Configuration or Parts Consultation?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Connect with Vishal Soni on WhatsApp. Send us your budget, preferred specs (RAM, SSD, screen size), and we will share available options with actual photos.
            </p>
          </div>

          <div className="shrink-0">
            {cleanWhatsapp ? (
              <a
                href={`https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}?text=${encodeURIComponent('Hello Vishal Soni, I am looking for a laptop/electronics recommendation within my budget.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Message Vishal on WhatsApp</span>
              </a>
            ) : (
              <Link
                to="/products"
                className="px-6 py-3.5 bg-white text-primary font-bold text-sm rounded-xl shadow"
              >
                Browse Shop Inventory
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
