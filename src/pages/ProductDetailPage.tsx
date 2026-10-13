import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product } from '../types';
import { getProductByIdOrSlug, formatINR, generateProductWhatsAppUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Battery,
  HardDrive,
  Cpu,
  Layers,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  ShoppingCart,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Share2,
  Package,
  Wrench,
  Gift
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings } = useStoreSettings();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!idOrSlug) return;
      setLoading(true);
      try {
        const data = await getProductByIdOrSlug(idOrSlug);
        setProduct(data);
        if (data) {
          setSelectedImage(data.primary_image);
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="bg-slate-100 rounded-3xl h-96" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-100 rounded w-1/4" />
            <div className="h-10 bg-slate-100 rounded w-3/4" />
            <div className="h-8 bg-slate-100 rounded w-1/3" />
            <div className="h-32 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">Product Not Found</h2>
        <p className="text-sm text-charcoal-muted">
          The requested product may have been unlisted or the URL is incorrect.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold text-xs rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0 || product.is_sold_out;
  const isReserved = product.is_reserved;
  const isUsed = product.condition === 'second_hand';
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const shareUrl = window.location.href;
  const whatsappUrl = generateProductWhatsAppUrl(settings.whatsapp_number, product, shareUrl);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Combine primary image and additional gallery images
  const allImages = Array.from(new Set([product.primary_image, ...(product.images || [])])).filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between text-xs text-charcoal-muted">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Catalog</Link>
          <span>/</span>
          <span className="text-secondary font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        <button
          onClick={handleCopyShareLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-charcoal text-xs font-semibold cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
        </button>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Selected Image */}
          <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden relative shadow-sm flex items-center justify-center">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />

            {/* Condition pill */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {isUsed ? (
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-white text-xs font-bold shadow flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Certified Refurbished</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-secondary text-white text-xs font-bold shadow flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Brand New</span>
                </span>
              )}
            </div>

            {/* Stock status overlay if sold out or reserved */}
            {(isOutOfStock || isReserved) && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                <span className="px-6 py-2.5 rounded-2xl bg-rose-600 text-white font-extrabold text-sm uppercase shadow-lg tracking-wider">
                  {isReserved ? 'Item Reserved' : 'Sold Out'}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl border-2 overflow-hidden bg-slate-50 shrink-0 transition-all cursor-pointer ${
                    selectedImage === img
                      ? 'border-secondary shadow-md scale-102'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {isUsed && (
            <p className="text-[11px] text-charcoal-muted italic text-center">
              * Actual physical photos of the unit inspected by Digital World.
            </p>
          )}
        </div>

        {/* Right Column: Details, Specs & Buying Actions */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Brand & Model */}
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-muted">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-primary font-bold">
              {product.brand}
            </span>
            <span>Model: {product.model}</span>
          </div>

          {/* Product Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary leading-tight">
            {product.name}
          </h1>

          {/* Pricing Box */}
          <div className="bg-surface-muted p-5 rounded-2xl border border-slate-200/90 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                {formatINR(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-charcoal-light line-through font-medium">
                    {formatINR(product.original_price!)}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-charcoal-muted">
              Prices inclusive of applicable taxes. Verified genuine hardware.
            </p>

            {/* Stock Availability indicator */}
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold">
              {isReserved ? (
                <span className="text-purple-700 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> This unit is currently reserved for another customer.
                </span>
              ) : isOutOfStock ? (
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Currently Out of Stock.
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock_quantity} {product.stock_quantity === 1 ? 'unit left' : 'units available'})
                </span>
              )}
            </div>
          </div>

          {/* Purchase Actions (Quantity, Add to Cart, Buy Now, WhatsApp) */}
          <div className="space-y-3 pt-2">
            {!isOutOfStock && !isReserved && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-charcoal">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="px-3 py-1.5 hover:bg-slate-100 font-bold text-sm cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isReserved}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOutOfStock || isReserved
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-light text-white shadow-sm active:scale-98'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || isReserved}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOutOfStock || isReserved
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-secondary hover:bg-secondary-hover text-white shadow-sm active:scale-98'
                }`}
              >
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>

            {/* Direct WhatsApp Ordering */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Order on WhatsApp (Prefilled Inquiry)</span>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-charcoal">Warranty Coverage</p>
                <p className="text-[11px] text-charcoal-muted">
                  {product.warranty_info || (isUsed ? '30-Day In-Shop Testing Warranty' : 'Brand Manufacturer Warranty')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Truck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-charcoal">Delivery & Pickup</p>
                <p className="text-[11px] text-charcoal-muted">
                  Store Pickup at Digital World or Doorstep Courier Shipping
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED REFURBISHED LAPTOP PHYSICAL INSPECTION REPORT */}
      {isUsed && (
        <section className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-primary">
                Certified Refurbished Laptop Hardware Inspection Report
              </h3>
              <p className="text-xs text-charcoal-muted">
                Completed by technician Vishal Soni. Real diagnostics report for this specific inventory piece.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-2 text-charcoal-muted font-semibold">
                <Cpu className="w-4 h-4 text-secondary" />
                <span>Processor (CPU)</span>
              </div>
              <p className="font-bold text-primary text-sm">
                {product.processor || t('notProvided')}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-2 text-charcoal-muted font-semibold">
                <Layers className="w-4 h-4 text-secondary" />
                <span>RAM Memory</span>
              </div>
              <p className="font-bold text-primary text-sm">
                {product.ram || t('notProvided')}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-2 text-charcoal-muted font-semibold">
                <HardDrive className="w-4 h-4 text-secondary" />
                <span>Storage Drive</span>
              </div>
              <p className="font-bold text-primary text-sm">
                {product.storage_type_capacity || t('notProvided')}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-2 text-charcoal-muted font-semibold">
                <Monitor className="w-4 h-4 text-secondary" />
                <span>Screen & Display</span>
              </div>
              <p className="font-bold text-primary text-sm">
                {product.screen_size || t('notProvided')}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-2 text-charcoal-muted font-semibold">
                <Battery className="w-4 h-4 text-emerald-600" />
                <span>Battery Backup & Health</span>
              </div>
              <p className="font-bold text-emerald-700 text-sm">
                {product.battery_health || t('notProvided')}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-2 text-charcoal-muted font-semibold">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Physical Condition Grade</span>
              </div>
              <p className="font-bold text-charcoal text-sm">
                {product.physical_condition_grade || t('notProvided')}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="flex items-center gap-2 text-charcoal-muted font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Known Defects or Repairs</span>
              </div>
              <p className="font-medium text-charcoal text-xs">
                {product.known_defects || 'None reported. Tested 100% operational.'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-1 md:col-span-2">
              <div className="flex items-center gap-2 text-charcoal-muted font-semibold">
                <Gift className="w-4 h-4 text-secondary" />
                <span>Included Accessories</span>
              </div>
              <p className="font-medium text-charcoal text-xs">
                {product.included_accessories || 'Original Compatible Charger and Power Cord'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Description & Technical Specifications Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Description */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold text-primary border-b border-slate-200 pb-2">
            Product Description
          </h3>
          <div className="prose prose-sm text-charcoal leading-relaxed whitespace-pre-line text-xs sm:text-sm">
            {product.description}
          </div>

          {/* Return & Replacement terms */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
            <h4 className="font-bold text-primary flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-secondary" />
              <span>Replacement Policy</span>
            </h4>
            <p className="text-charcoal-muted leading-relaxed">
              {product.return_info || settings.return_policy_text}
            </p>
          </div>
        </div>

        {/* Structured Specifications Table */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold text-primary border-b border-slate-200 pb-2">
            Technical Specifications
          </h3>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-3 p-3 bg-slate-50 font-bold text-charcoal">
                <span>Brand</span>
                <span className="col-span-2 font-normal text-charcoal-muted">{product.brand}</span>
              </div>
              <div className="grid grid-cols-3 p-3 font-bold text-charcoal">
                <span>Model</span>
                <span className="col-span-2 font-normal text-charcoal-muted">{product.model}</span>
              </div>
              <div className="grid grid-cols-3 p-3 bg-slate-50 font-bold text-charcoal">
                <span>Condition</span>
                <span className="col-span-2 font-normal text-charcoal-muted capitalize">
                  {product.condition === 'second_hand' ? 'Certified Refurbished' : 'Brand New'}
                </span>
              </div>

              {/* Dynamic specifications */}
              {product.specifications && Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="grid grid-cols-3 p-3 font-bold text-charcoal even:bg-slate-50">
                  <span>{key}</span>
                  <span className="col-span-2 font-normal text-charcoal-muted">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
