import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { getOrderByIdOrNumber, formatINR } from '../services/api';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { STORE_CONFIG } from '../config/storeConfig';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  MapPin,
  Calendar
} from 'lucide-react';

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'Order Received', desc: 'Awaiting shop review' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Verified by Vishal Soni' },
  { key: 'processing', label: 'Processing & Testing', desc: 'Hardware checked & packed' },
  { key: 'shipped', label: 'Out for Delivery / Shipped', desc: 'In transit to customer' },
  { key: 'delivered', label: 'Delivered', desc: 'Successfully received' }
];

export const OrderLookupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { settings } = useStoreSettings();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please provide both Order Number and your registered Mobile Number.');
      return;
    }

    setLoading(true);
    try {
      const data = await getOrderByIdOrNumber(orderNumber, phone);
      if (data) {
        setOrder(data);
      } else {
        setError('No order found matching this Order Number and Mobile Number. Please verify your details.');
        setOrder(null);
      }
    } catch {
      setError('Failed to lookup order. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('order') && searchParams.get('phone')) {
      handleLookup();
    }
  }, [searchParams]);

  const effectiveWhatsapp = settings.whatsapp_number || STORE_CONFIG.whatsappNumber;
  const cleanWhatsapp = effectiveWhatsapp ? effectiveWhatsapp.replace(/\D/g, '') : '';
  const customerChatWhatsappUrl = order
    ? `https://wa.me/${cleanWhatsapp.startsWith('91') ? cleanWhatsapp : `91${cleanWhatsapp}`}?text=${encodeURIComponent(
        `Namaste Vishal Soni, I am checking status of Order #${order.order_number}. Customer Name: ${order.customer_name}.`
      )}`
    : '#';

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.order_status) : 0;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold">
          <Package className="w-4 h-4" />
          <span>Real-time Order Tracking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">
          Track Your Order
        </h1>
        <p className="text-xs text-charcoal-muted max-w-md mx-auto">
          Enter your Order Number and Mobile Number to view dispatch progress and live updates.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-charcoal mb-1">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. DW-20261013-1001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted uppercase font-mono text-xs focus:bg-white focus:border-secondary"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1">
                10-Digit Mobile Number
              </label>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted text-xs focus:bg-white focus:border-secondary"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching Database...' : 'Find My Order'}</span>
          </button>
        </form>
      </div>

      {/* Order Results Card */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-8 animate-fade-in text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs text-charcoal-muted">Order ID:</span>
              <h2 className="text-xl font-extrabold text-primary font-mono">{order.order_number}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-charcoal-muted block">Current Status:</span>
              <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold capitalize ${
                order.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                order.order_status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.order_status}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {order.order_status !== 'cancelled' ? (
            <div className="py-2">
              <div className="grid grid-cols-5 gap-1 relative text-center">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.key} className="flex flex-col items-center relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                        isDone
                          ? 'bg-secondary text-white ring-4 ring-blue-100'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-bold mt-2 leading-tight ${
                        isCurrent ? 'text-secondary' : isDone ? 'text-charcoal' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] text-charcoal-muted hidden md:block mt-0.5">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">This order has been cancelled.</p>
                <p>Please contact shop owner Vishal Soni on WhatsApp for details.</p>
              </div>
            </div>
          )}

          {/* Items & Financial summary */}
          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
            <h3 className="font-bold text-primary text-xs uppercase tracking-wider">
              Ordered Products
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-charcoal truncate">{item.product_name}</p>
                      <p className="text-charcoal-muted text-[11px]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-primary shrink-0">
                    {formatINR(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-surface-muted rounded-2xl flex items-center justify-between text-sm font-extrabold text-primary">
              <span>Total Payable Amount</span>
              <span>{formatINR(order.total_amount)} ({order.payment_method.toUpperCase()})</span>
            </div>
          </div>

          {/* WhatsApp Direct Help */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-emerald-900">Need immediate delivery assistance?</p>
              <p className="text-emerald-700 text-[11px]">
                Chat directly with Vishal Soni with your Order ID prefilled.
              </p>
            </div>
            <a
              href={customerChatWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Shop</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
