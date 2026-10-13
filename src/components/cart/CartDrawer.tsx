import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { formatINR, generateCartWhatsAppUrl } from '../../services/api';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  MessageCircle,
  Truck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    isCartDrawerOpen,
    setIsCartDrawerOpen
  } = useCart();
  const { settings } = useStoreSettings();

  if (!isCartDrawerOpen) return null;

  const isFreeDeliveryEligible = subtotal >= settings.free_delivery_above;
  const remainingForFreeDelivery = Math.max(0, settings.free_delivery_above - subtotal);
  const deliveryCharge = isFreeDeliveryEligible ? 0 : settings.delivery_charges;
  const total = subtotal + deliveryCharge;

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  const handleWhatsAppCart = () => {
    const url = generateCartWhatsAppUrl(
      settings.whatsapp_number,
      items,
      subtotal,
      'Sending cart items for verification and order.'
    );
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-primary/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-surface-muted">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-primary">Your Shopping Cart</h3>
              <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-charcoal hover:bg-slate-200/60 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-3 bg-blue-50/70 border-b border-blue-100 text-xs">
            {isFreeDeliveryEligible ? (
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Congratulations! Your order qualifies for <strong>FREE Delivery</strong></span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-blue-900 font-medium">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-secondary" />
                    <span>Free Delivery Goal</span>
                  </span>
                  <span>Add {formatINR(remainingForFreeDelivery)} more</span>
                </div>
                <div className="w-full bg-blue-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / settings.free_delivery_above) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Drawer Content / Items list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-charcoal text-base">Your cart is empty</p>
                  <p className="text-xs text-charcoal-muted mt-1">
                    Explore our certified laptops and computer accessories.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-light transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const isMaxStock = item.quantity >= item.product.stock_quantity;
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <img
                      src={item.product.primary_image}
                      alt={item.product.name}
                      className="w-18 h-18 object-cover rounded-lg bg-slate-50 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-charcoal leading-snug line-clamp-2">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] font-semibold text-primary">
                          {formatINR(item.product.price)}
                        </span>
                      </div>

                      {/* Quantity Selector & Item Total */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-slate-200 text-charcoal transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-bold text-xs min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={isMaxStock}
                            className={`p-1 px-2 text-charcoal transition-colors cursor-pointer ${
                              isMaxStock ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-200'
                            }`}
                            aria-label="Increase quantity"
                            title={isMaxStock ? 'Max available stock reached' : ''}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-extrabold text-charcoal text-xs">
                          {formatINR(item.product.price * item.quantity)}
                        </span>
                      </div>

                      {isMaxStock && (
                        <div className="text-[10px] text-amber-700 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Max available stock ({item.product.stock_quantity}) reached</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer / Summary */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-surface-muted space-y-3">
              <div className="space-y-1.5 text-xs text-charcoal-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-charcoal">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      formatINR(deliveryCharge)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-primary pt-2 border-t border-slate-200">
                  <span>Estimated Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsAppCart}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Send Cart Inquiry on WhatsApp</span>
                </button>

                <div className="flex justify-between items-center text-[11px] text-charcoal-light pt-1">
                  <button
                    onClick={clearCart}
                    className="hover:text-rose-600 transition-colors"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="text-secondary hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
