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
  HardDrive
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
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden relative text-left">
      {/* Top Badges and Wishlist Button */}
      <div className="relative aspect-square bg-[#fcfaf7] overflow-hidden flex items-center justify-center p-2.5 sm:p-3 border-b border-slate-100">
        {/* Wishlist Heart Icon (Top Right - Image 4 & 5) */}
        <button
          onClick={toggleWishlist}
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-all cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
              isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''
            }`}
          />
        </button>

        {/* Status Badges (Top Left - Image 4 & 5) */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-col items-start gap-1">
          {product.is_updated_product && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] sm:text-[10px] font-black uppercase shadow-xs">
              Updated
            </span>
          )}
          {product.is_new_arrival && (
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] sm:text-[10px] font-black uppercase shadow-xs">
              New Arrival
            </span>
          )}
          {isUsed ? (
            <span className="px-1.5 py-0.5 rounded bg-primary text-white text-[9px] sm:text-[10px] font-bold shadow-xs flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-secondary-light" />
              <span>Tested</span>
            </span>
          ) : (
            !product.is_new_arrival && !product.is_updated_product && (
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] sm:text-[10px] font-bold shadow-xs">
                Brand New
              </span>
            )
          )}
          {hasDiscount && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black shadow-xs">
              Save ₹{discountAmount}
            </span>
          )}
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
            className="max-h-full max-w-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
            }}
          />
        </Link>
      </div>

      {/* Card Content Body */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1">
        {/* Product Title */}
        <Link
          to={`/product/${product.slug || product.id}`}
          className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-primary transition-colors min-h-[2rem] sm:min-h-[2.5rem] mb-1.5"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Specifications snippet (Refurbished Laptop or Key Specs) */}
        {isUsed && (product.processor || product.ram) && (
          <div className="mb-1.5 text-[9px] sm:text-[10px] text-slate-600 bg-slate-50 p-1 sm:p-1.5 rounded-lg border border-slate-200/60 truncate flex items-center gap-1">
            <Cpu className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary shrink-0" />
            <span className="truncate">{product.processor || `${product.ram} / ${product.storage_type_capacity}`}</span>
          </div>
        )}

        {/* PID & Item CD Badges Row (Exact format from Reference Image 5) */}
        <div className="flex items-center gap-1 mb-2 overflow-hidden">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-950 border border-amber-200/80 text-[9px] sm:text-[10px] font-bold tracking-tight shrink-0">
            PID: {displayPid}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-950 border border-amber-200/80 text-[9px] sm:text-[10px] font-bold tracking-tight truncate">
            Item CD: {displayItemCd}
          </span>
        </div>

        {/* Price & Stock Indicator Row (Exact format from Reference Image 5) */}
        <div className="mt-auto pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 mb-2">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm sm:text-base font-black text-[#881337] tracking-tight">
              {formatINR(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                {formatINR(product.original_price!)}
              </span>
            )}
          </div>

          {/* Stock Indicator Pill */}
          {isOutOfStock || isReserved ? (
            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[9px] sm:text-[10px] font-bold shrink-0">
              Out of Stock
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] sm:text-[10px] font-bold shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>In Stock</span>
            </span>
          )}
        </div>

        {/* Stepper & ADD TO CART Action Controls (Reference Image 5 - No Text Wrapping on Mobile) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Quantity Stepper: [-] [ 1 ] [+] */}
          <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shrink-0 shadow-2xs">
            <button
              onClick={handleDecreaseQty}
              type="button"
              disabled={quantity <= 1 || isOutOfStock}
              className="w-5 sm:w-6 h-7 sm:h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
            </button>
            <span className="w-5 sm:w-6 text-center font-bold text-[11px] sm:text-xs text-slate-900 select-none">
              {quantity}
            </span>
            <button
              onClick={handleIncreaseQty}
              type="button"
              disabled={isOutOfStock || quantity >= product.stock_quantity}
              className="w-5 sm:w-6 h-7 sm:h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
            </button>
          </div>

          {/* Golden/Amber ADD TO CART Button (Reference Image 5) */}
          <button
            onClick={handleAddToCart}
            type="button"
            disabled={isOutOfStock || isReserved}
            className={`flex-1 h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg font-black text-[9px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer whitespace-nowrap min-w-0 ${
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
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span className="truncate">Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 shrink-0 hidden sm:inline-block" />
                <span className="truncate">Add to Cart</span>
              </>
            )}
          </button>
        </div>

        {/* Quick WhatsApp Inquiry Link */}
        <div className="mt-2 pt-1.5 border-t border-slate-100/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
          <Link
            to={`/product/${product.slug || product.id}`}
            className="hover:text-primary font-medium flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3 h-3" />
            <span>Details</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-600 font-semibold flex items-center gap-1 text-slate-600 transition-colors"
          >
            <MessageCircle className="w-3 h-3 text-emerald-500 fill-current" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
