import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { getOrderByIdOrNumber, formatINR, generateOwnerOrderNotificationUrl } from '../services/api';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { STORE_CONFIG } from '../config/storeConfig';
import {
  CheckCircle2,
  Package,
  MessageCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  Printer
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { settings } = useStoreSettings();
  const { t } = useLanguage();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Query order by order number or id
        const data = await getOrderByIdOrNumber(id, '');
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const effectiveWhatsapp = settings.whatsapp_number || STORE_CONFIG.whatsappNumber;
  const cleanWhatsapp = effectiveWhatsapp ? effectiveWhatsapp.replace(/\D/g, '') : '';

  // Prefilled WhatsApp link for customer to chat with shop owner about this order
  const customerChatWhatsappUrl = order
    ? `https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}?text=${encodeURIComponent(
        `Namaste Vishal Soni, I have placed Order #${order.order_number} for total ${formatINR(order.total_amount)}. Customer Name: ${order.customer_name}. Please confirm dispatch details.`
      )}`
    : '#';

  // Owner notification fallback URL (in case shop owner tests order receiving)
  const ownerNotifyWhatsappUrl = order
    ? generateOwnerOrderNotificationUrl(settings.whatsapp_number, order)
    : '#';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-10 bg-slate-100 rounded w-1/3 mx-auto mb-4" />
        <div className="h-40 bg-slate-100 rounded max-w-xl mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8 text-center sm:text-left">
      {/* Header Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
            Order Confirmed & Logged
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">
            {t('orderConfirmed')}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto">
            {t('confirmationMsg')}
          </p>
        </div>

        {order && (
          <div className="inline-block bg-white px-5 py-2.5 rounded-2xl border border-emerald-300 shadow-xs">
            <span className="text-xs text-charcoal-muted block">Your Order ID:</span>
            <span className="text-lg sm:text-xl font-mono font-extrabold text-primary tracking-wide">
              {order.order_number}
            </span>
          </div>
        )}
      </div>

      {order && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-base text-primary">Order Receipt Summary</h2>
              <span className="text-xs text-charcoal-muted flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                <span>{new Date(order.created_at).toLocaleString('en-IN')}</span>
              </span>
            </div>

            <button
              onClick={() => window.print()}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-charcoal text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-surface-muted p-4 rounded-2xl border border-slate-200/80">
            <div>
              <span className="font-bold text-primary block mb-1">Customer & Delivery:</span>
              <p className="font-semibold text-charcoal">{order.customer_name}</p>
              <p className="text-charcoal-muted">Phone: +91 {order.customer_phone}</p>
              <p className="text-charcoal-muted">WhatsApp: +91 {order.customer_whatsapp}</p>
              <p className="text-charcoal mt-1">
                {order.delivery_type === 'store_pickup'
                  ? 'Store Pickup at Digital World Shop'
                  : `${order.delivery_address}, ${order.city}, ${order.state} - ${order.pincode}`}
              </p>
            </div>

            <div>
              <span className="font-bold text-primary block mb-1">Payment & Status:</span>
              <p className="capitalize">
                Method: <strong>{order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : order.payment_method === 'pay_on_delivery' ? 'Pay on Delivery (UPI / Cash)' : 'Online Payment'}</strong>
              </p>
              <p className="capitalize mt-0.5">
                Payment Status: <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">{order.payment_status}</span>
              </p>
              <p className="capitalize mt-0.5">
                Order Status: <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">{order.order_status}</span>
              </p>
            </div>
          </div>

          {/* Ordered Products List */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-charcoal-muted">
              Purchased Items
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-charcoal truncate">{item.product_name}</p>
                      <p className="text-charcoal-muted text-[11px]">
                        Qty: {item.quantity} × {formatINR(item.unit_price)} ({item.condition === 'second_hand' ? 'Tested Used' : 'New'})
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-primary shrink-0">
                    {formatINR(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-charcoal">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold">{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span className="font-bold">
                {order.delivery_charge === 0 ? 'FREE' : formatINR(order.delivery_charge)}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-primary pt-2 border-t border-slate-200">
              <span>Total Payable:</span>
              <span>{formatINR(order.total_amount)}</span>
            </div>
          </div>

          {/* Direct WhatsApp Contact Actions */}
          <div className="no-print space-y-3 pt-4 border-t border-slate-200">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <p className="font-bold text-xs text-emerald-900">
                  Have questions about this order?
                </p>
                <p className="text-[11px] text-emerald-700">
                  Connect with Vishal Soni on WhatsApp with your Order ID for instant verification.
                </p>
              </div>

              <a
                href={customerChatWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t('chatWithShopOnWhatsApp')}</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <Link
                to={`/order-lookup?order=${order.order_number}&phone=${order.customer_phone}`}
                className="text-secondary font-bold hover:underline flex items-center gap-1"
              >
                <Package className="w-4 h-4" />
                <span>Track This Order Later</span>
              </Link>

              <Link
                to="/products"
                className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
