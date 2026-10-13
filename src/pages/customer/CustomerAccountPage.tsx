import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { getCustomerOrders, formatINR } from '../../services/api';
import { Order, CustomerAddress } from '../../types';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  MessageCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { STORE_CONFIG } from '../../config/storeConfig';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

export const CustomerAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { customer, isLoggedIn, logout, saveAddress } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'address'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address edit state
  const [addressLine, setAddressLine] = useState(customer?.default_address?.address || '');
  const [city, setCity] = useState(customer?.default_address?.city || '');
  const [state, setState] = useState(customer?.default_address?.state || 'Rajasthan');
  const [pincode, setPincode] = useState(customer?.default_address?.pincode || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !customer) {
      navigate('/customer/login');
      return;
    }

    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const list = await getCustomerOrders(customer.phone);
        setOrders(list);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [customer, isLoggedIn, navigate]);

  useEffect(() => {
    if (customer?.default_address) {
      setAddressLine(customer.default_address.address);
      setCity(customer.default_address.city);
      setState(customer.default_address.state);
      setPincode(customer.default_address.pincode);
    }
  }, [customer]);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: CustomerAddress = {
      address: addressLine.trim(),
      city: city.trim(),
      state,
      pincode: pincode.trim()
    };
    saveAddress(newAddr);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!customer) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8 text-left">
      {/* Top Banner & Profile Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
            {customer.name[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary">
              Verified Customer Account
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-primary">
              {customer.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted mt-1">
              <span className="flex items-center gap-1 font-semibold text-charcoal">
                <Phone className="w-3.5 h-3.5 text-secondary" />
                +91 {customer.phone}
              </span>
              {customer.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {customer.email}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-charcoal-muted font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-white text-charcoal-muted hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('address')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'address'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-white text-charcoal-muted hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Default Delivery Address</span>
        </button>
      </div>

      {/* ===================== TAB 1: ORDERS ===================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-12 text-center text-xs text-charcoal-muted bg-white rounded-3xl border border-slate-200">
              Loading your past orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-primary">No orders placed yet</h3>
                <p className="text-xs text-charcoal-muted">
                  Explore certified refurbished laptops and genuine computer accessories!
                </p>
              </div>
              <Link
                to="/products"
                className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-light"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const statusColors: Record<string, string> = {
                pending: 'bg-amber-100 text-amber-800 border-amber-200',
                confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
                processing: 'bg-purple-100 text-purple-800 border-purple-200',
                shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
              };

              const whatsappInquiryUrl = `https://wa.me/91${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                `Namaste Vishal Soni, I am checking the status of my order ${order.order_number} for total ${formatINR(order.total_amount)}.`
              )}`;

              return (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-[10px] text-charcoal-muted font-bold uppercase">
                        Order Placed on {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </span>
                      <h3 className="font-extrabold text-base text-primary font-mono">
                        {order.order_number}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                          statusColors[order.order_status] || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {order.order_status}
                      </span>
                      <span className="font-extrabold text-base text-primary">
                        {formatINR(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="space-y-3">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-charcoal truncate">{item.product_name}</h4>
                          <span className="text-charcoal-muted text-[11px]">
                            Qty: {item.quantity} × {formatINR(item.unit_price)}
                          </span>
                        </div>
                        <span className="font-bold text-primary">
                          {formatINR(item.total_price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery address & WhatsApp contact */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-charcoal-muted">
                    <div>
                      <span className="font-bold text-charcoal block">Delivering to:</span>
                      <span>{order.delivery_address}, {order.city}, {order.state} - {order.pincode}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={whatsappInquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-bold flex items-center gap-1.5 text-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>Order Help on WhatsApp</span>
                      </a>

                      <Link
                        to={`/order-confirmation/${order.order_number}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-charcoal font-bold text-xs flex items-center gap-1"
                      >
                        <span>View Invoice</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ===================== TAB 2: SAVED ADDRESS ===================== */}
      {activeTab === 'address' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs max-w-2xl space-y-5">
          <div>
            <h3 className="font-extrabold text-base text-primary">Saved Delivery Address</h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              This address will be automatically populated during checkout for faster 1-click orders.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Delivery address saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-charcoal mb-1">
                Street Address / House No. / Landmark <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                required
                placeholder="House / Flat No., Landmark, Street"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-charcoal mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="e.g. Jodhpur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">
                  State <span className="text-rose-500">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">
                  6-Digit PIN Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="342001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Default Address</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
