import React from 'react';
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
  Shield,
  Battery,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { settings } = useStoreSettings();
  const { t } = useLanguage();

  const isOutOfStock = product.stock_quantity <= 0 || product.is_sold_out;
  const isReserved = product.is_reserved;
  const isLowStock = !isOutOfStock && product.stock_quantity <= 3;
  const isUsed = product.condition === 'second_hand';

  // Calculate discount percentage if genuine original price is provided
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const productUrl = `${window.location.origin}/product/${product.slug || product.id}`;
  const whatsappUrl = generateProductWhatsAppUrl(settings.whatsapp_number, product, productUrl);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Badges on Image */}
      <div className="relative aspect-video sm:aspect-square bg-slate-50 overflow-hidden flex items-center justify-center">
        <img
          src={product.primary_image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // fallback placeholder image if remote fails
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Condition Badge (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isUsed ? (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/95 text-white text-[11px] font-bold shadow-sm backdrop-blur-sm flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>{t('conditionSecondHand')}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-secondary/95 text-white text-[11px] font-bold shadow-sm backdrop-blur-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Brand New</span>
            </span>
          )}

          {product.is_special_offer && product.offer_badge_text && (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shadow-sm">
              {product.offer_badge_text}
            </span>
          )}
        </div>

        {/* Stock / Reservation Badges (Top-Right) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10">
          {isReserved ? (
            <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-extrabold uppercase shadow">
              Reserved
            </span>
          ) : isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-extrabold uppercase shadow">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-semibold">
              Only {product.stock_quantity} Left
            </span>
          ) : null}

          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Demo Product Notice */}
        {product.is_demo_product && (
          <div className="absolute bottom-1 left-2 z-10">
            <span className="text-[9px] bg-slate-900/70 text-slate-200 px-1.5 py-0.5 rounded backdrop-blur-xs">
              Demo Inventory
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand and Model */}
        <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
          <span className="font-semibold text-primary">{product.brand}</span>
          <span className="truncate max-w-[120px]">{product.model}</span>
        </div>

        {/* Product Title */}
        <Link
          to={`/product/${product.slug || product.id}`}
          className="font-bold text-charcoal text-sm leading-snug line-clamp-2 hover:text-secondary transition-colors mb-2"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Refurbished Laptop Spec Pills (if laptop) */}
        {isUsed && (product.processor || product.ram || product.storage_type_capacity) && (
          <div className="mb-3 space-y-1 bg-surface-muted p-2 rounded-xl border border-slate-200/70 text-[11px] text-charcoal-muted">
            {product.processor && (
              <div className="flex items-center gap-1.5 truncate">
                <Cpu className="w-3 h-3 text-secondary shrink-0" />
                <span className="truncate">{product.processor}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-1 text-[10px]">
              {product.ram && (
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-secondary shrink-0" />
                  {product.ram}
                </span>
              )}
              {product.storage_type_capacity && (
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-secondary shrink-0" />
                  {product.storage_type_capacity}
                </span>
              )}
            </div>
            {product.battery_health && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium truncate pt-0.5 border-t border-slate-200/50">
                <Battery className="w-3 h-3 shrink-0 text-emerald-600" />
                <span className="truncate">{product.battery_health}</span>
              </div>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-primary">
            {formatINR(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-charcoal-light line-through">
              {formatINR(product.original_price!)}
            </span>
          )}
        </div>

        {/* Warranty hint */}
        {product.warranty_info && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{product.warranty_info}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isReserved}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isOutOfStock || isReserved
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-light text-white active:scale-95'
            }`}
            title={isOutOfStock ? 'Item is sold out' : 'Add to cart'}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? t('soldOut') : t('addToCart')}</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-semibold transition-colors active:scale-95"
            title="Inquire or order on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* View Details full-width subtle link */}
        <Link
          to={`/product/${product.slug || product.id}`}
          className="mt-2 text-center text-xs font-medium text-secondary hover:text-secondary-hover py-1 flex items-center justify-center gap-1"
        >
          <Eye className="w-3 h-3" />
          <span>{t('viewDetails')}</span>
        </Link>
      </div>
    </div>
  );
};
