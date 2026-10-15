import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { formatINR, generateProductWhatsAppUrl } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShoppingCart,
  MessageCircle,
  Eye,
  Heart,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  Shield,
  Cpu,
  Layers,
  HardDrive,
  Star
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { settings } = useStoreSettings();
  const { t } = useLanguage();

  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  const isOutOfStock = product.stock_quantity <= 0 || product.is_sold_out;
  const isReserved = product.is_reserved;
  const isUsed = product.condition === 'second_hand';

  // Genuine discount calculation
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountAmount = hasDiscount ? product.original_price! - product.price : 0;
  const discountPercent = hasDiscount
    ? Math.round((discountAmount / product.original_price!) * 100)
    : 0;

  // Consistent rating (4.2 - 4.8) and review count (Reference Image 2: e.g. 4.3 ★ (13))
  const charSum = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ratingScore = Number((4.1 + (charSum % 8) * 0.1).toFixed(1));
  const reviewCount = 8 + (charSum % 38);

  const handleDecreaseQty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncreaseQty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const maxQty = product.stock_quantity > 0 ? product.stock_quantity : 99;
    setQuantity(prev => (prev < maxQty ? prev + 1 : prev));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isReserved) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const productUrl = `${window.location.origin}/product/${product.slug || product.id}`;
  const whatsappUrl = generateProductWhatsAppUrl(settings.whatsapp_number, product, productUrl);

  // Fallback PID & Item Code if not set
  const displayPid = product.pid || `DW-${product.id.slice(-4).toUpperCase()}`;
  const displayItemCd = product.item_code || product.model.slice(0, 10).toUpperCase();

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all duration-300 flex flex-col overflow-hidden relative text-left h-full">
      {/* Top Badges and Wishlist Button */}
      <div className="relative aspect-square bg-[#f8f9fa] overflow-hidden flex items-center justify-center p-2 sm:p-3 border-b border-slate-100">
        {/* Wishlist Heart Icon (Top Right) */}
        <button
          onClick={toggleWishlist}
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all cursor-pointer"
        >
          <Heart
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 ${
              isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''
            }`}
          />
        </button>

        {/* Status Badges (Top Left - Reference Image 2 & 5) */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-col items-start gap-1">
          {product.is_trending || product.is_special_offer ? (
            <span className="px-1.5 py-0.5 rounded-md bg-[#283593] text-white text-[7.5px] sm:text-[9.5px] font-black tracking-tight shadow-xs">
              Lowest price live
            </span>
          ) : product.is_new_arrival ? (
            <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[7.5px] sm:text-[9.5px] font-black uppercase shadow-xs">
              New Launch
            </span>
          ) : isUsed ? (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-white text-[7.5px] sm:text-[9.5px] font-bold shadow-xs flex items-center gap-0.5">
              <Shield className="w-2.5 h-2.5 text-amber-400" />
              <span>Tested</span>
            </span>
          ) : null}

          {hasDiscount && (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[7.5px] sm:text-[9.5px] font-black shadow-xs">
              Save ₹{discountAmount}
            </span>
          )}
        </div>

        {/* Rating Pill (Bottom Left of Image - Exactly matching Reference Image 2) */}
        <div className="absolute bottom-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-2xs flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-bold text-slate-800">
          <span>{ratingScore}</span>
          <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
          <span className="text-slate-400 font-normal">({reviewCount})</span>
        </div>

        {/* Clickable Product Image */}
        <Link
          to={`/product/${product.slug || product.id}`}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            src={product.primary_image}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
            }}
          />
        </Link>
      </div>

      {/* Card Content Body */}
      <div className="p-2 sm:p-3 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Product Title */}
          <Link
            to={`/product/${product.slug || product.id}`}
            className="font-bold text-slate-900 text-[11px] sm:text-xs md:text-sm leading-snug line-clamp-2 hover:text-[#7b0c1e] transition-colors min-h-[1.9rem] sm:min-h-[2.4rem] mb-1 block"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Specifications snippet (Refurbished Laptop or Key Specs) */}
          {(product.processor || product.ram) && (
            <div className="mb-1 text-[8px] sm:text-[9.5px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 truncate flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5 text-primary shrink-0" />
              <span className="truncate">{product.processor || `${product.ram} / ${product.storage_type_capacity}`}</span>
            </div>
          )}

          {/* PID & Item CD Badges Row */}
          <div className="flex items-center gap-1 mb-1 text-[8px] sm:text-[9px] font-bold text-slate-500 overflow-hidden">
            <span className="px-1 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200/70 shrink-0">
              PID: {displayPid}
            </span>
            <span className="px-1 py-0.2 rounded bg-slate-50 text-slate-600 border border-slate-200/70 truncate hidden xs:inline-block">
              {displayItemCd}
            </span>
          </div>
        </div>

        <div>
          {/* Price & Stock Indicator Row */}
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-xs sm:text-sm md:text-base font-black text-[#7b0c1e] tracking-tight">
                {formatINR(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[9px] sm:text-[10px] text-slate-400 line-through">
                  {formatINR(product.original_price!)}
                </span>
              )}
            </div>

            {/* Stock Indicator Pill */}
            {isOutOfStock || isReserved ? (
              <span className="px-1 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[8px] sm:text-[9px] font-bold shrink-0">
                Sold Out
              </span>
            ) : (
              <span className="px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] sm:text-[9px] font-bold shrink-0 flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span>In Stock</span>
              </span>
            )}
          </div>

          {/* Stepper & ADD TO CART Action Controls */}
          <div className="flex items-center gap-1">
            {/* Quantity Stepper: [-] [ 1 ] [+] */}
            <div className="inline-flex items-center border border-slate-300 rounded-md bg-white overflow-hidden shrink-0 shadow-2xs">
              <button
                onClick={handleDecreaseQty}
                type="button"
                disabled={quantity <= 1 || isOutOfStock}
                className="w-4 sm:w-5 h-6 sm:h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="w-4 sm:w-5 text-center font-bold text-[10px] sm:text-xs text-slate-900 select-none">
                {quantity}
              </span>
              <button
                onClick={handleIncreaseQty}
                type="button"
                disabled={isOutOfStock || quantity >= product.stock_quantity}
                className="w-4 sm:w-5 h-6 sm:h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Golden/Amber ADD TO CART Button */}
            <button
              onClick={handleAddToCart}
              type="button"
              disabled={isOutOfStock || isReserved}
              className={`flex-1 h-6 sm:h-7 px-1.5 sm:px-2 rounded-md font-bold text-[9.5px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer whitespace-nowrap min-w-0 ${
                isOutOfStock || isReserved
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white border border-amber-600/30'
              }`}
              title={isOutOfStock ? 'Item is out of stock' : 'Add to cart'}
            >
              {justAdded ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-2.5 h-2.5 shrink-0 hidden sm:inline-block" />
                  <span className="truncate">Add to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Quick WhatsApp Inquiry Link & Details */}
          <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[8.5px] sm:text-[9.5px] text-slate-500">
            <Link
              to={`/product/${product.slug || product.id}`}
              className="hover:text-[#7b0c1e] font-medium flex items-center gap-0.5 transition-colors"
            >
              <Eye className="w-2.5 h-2.5 text-slate-400" />
              <span>Details</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 font-semibold flex items-center gap-0.5 text-slate-600 transition-colors"
            >
              <MessageCircle className="w-2.5 h-2.5 text-emerald-500 fill-current" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
