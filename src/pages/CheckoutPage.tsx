import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { createOrder, formatINR } from '../services/api';
import {
  OrderCustomerInfo,
  PaymentMethod,
  DeliveryType
} from '../types';
import {
  ShieldCheck,
  Truck,
  Building,
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle,
  ArrowRight,
  Lock,
  CheckCircle2,
  Phone,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Chandigarh', 'Jammu and Kashmir', 'Ladakh'
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useStoreSettings();
  const { t } = useLanguage();

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('home_delivery');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Rajasthan');
  const [pincode, setPincode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false);

  // Submission & Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // If cart is empty, redirect
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">Your cart is empty</h2>
        <p className="text-sm text-charcoal-muted">Please add products before checking out.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl"
        >
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  // Delivery charge calculation
  const isFreeDelivery = deliveryType === 'store_pickup' || subtotal >= settings.free_delivery_above;
  const deliveryCharge = isFreeDelivery ? 0 : settings.delivery_charges;
  const grandTotal = subtotal + deliveryCharge;

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    // 10-digit Indian Mobile validation
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    // WhatsApp validation
    const actualWhatsapp = sameWhatsapp ? cleanMobile : whatsappNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(actualWhatsapp)) {
      newErrors.whatsappNumber = 'Please enter a valid 10-digit WhatsApp number.';
    }

    if (deliveryType === 'home_delivery') {
      if (!address.trim() || address.trim().length < 8) {
        newErrors.address = 'Please provide your full delivery address with house/flat number and landmark.';
      }
      if (!city.trim()) {
        newErrors.city = 'City name is required.';
      }
      // 6-digit Indian PIN code
      const cleanPin = pincode.replace(/\D/g, '');
      if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
        newErrors.pincode = 'Please enter a valid 6-digit Indian Postal PIN code (e.g. 302001).';
      }
    }

    if (!confirmedAccuracy) {
      newErrors.confirmation = 'Please review your order details and check the confirmation box.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      const finalWhatsapp = sameWhatsapp ? cleanMobile : whatsappNumber.replace(/\D/g, '');

      const customerInfo: OrderCustomerInfo = {
        customer_name: fullName.trim(),
        customer_phone: cleanMobile,
        customer_whatsapp: finalWhatsapp,
        customer_email: email.trim() || undefined,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'store_pickup' ? 'Store Pickup: Digital World' : address.trim(),
        city: deliveryType === 'store_pickup' ? 'Shop Counter' : city.trim(),
        state: deliveryType === 'store_pickup' ? 'Local' : state,
        pincode: deliveryType === 'store_pickup' ? '000000' : pincode.trim(),
        order_notes: orderNotes.trim() || undefined,
        payment_method: paymentMethod
      };

      const result = await createOrder({
        customerInfo,
        items
      });

      if (result.success && result.order) {
        // Clear cart ONLY after order is saved successfully
        clearCart();
        navigate(`/order-confirmation/${result.order.order_number}`);
      } else {
        setSubmitError(result.message || 'Unable to place order. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Order creation failed:', err);
      setSubmitError((err as Error).message || 'An unexpected error occurred while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">
          {t('checkoutTitle')}
        </h1>
        <p className="text-xs text-charcoal-muted mt-1">
          Provide your delivery details. Vishal Soni will verify your items and dispatch accordingly.
        </p>
      </div>

      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Order Submission Notice</p>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer and Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="w-4 h-4 text-secondary" />
              <h2 className="font-bold text-sm text-primary">1. Customer Contact Details</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-surface-muted'
                  } focus:bg-white focus:border-secondary`}
                />
                {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    10-Digit Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-charcoal-muted text-xs">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className={`w-full pl-11 pr-3 py-2.5 rounded-xl border ${
                        errors.mobileNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-surface-muted'
                      } focus:bg-white focus:border-secondary`}
                    />
                  </div>
                  {errors.mobileNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    Email Address <span className="text-slate-400 text-[10px]">(Optional for invoice)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                  />
                </div>
              </div>

              {/* WhatsApp Number Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-charcoal">
                  <input
                    type="checkbox"
                    checked={sameWhatsapp}
                    onChange={(e) => setSameWhatsapp(e.target.checked)}
                    className="rounded text-secondary focus:ring-secondary"
                  />
                  <span>WhatsApp number is the same as mobile number</span>
                </label>

                {!sameWhatsapp && (
                  <div className="mt-2.5">
                    <label className="block font-bold text-charcoal mb-1">
                      Different WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-charcoal-muted text-xs">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className={`w-full pl-11 pr-3 py-2.5 rounded-xl border ${
                          errors.whatsappNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-surface-muted'
                        } focus:bg-white focus:border-secondary`}
                      />
                    </div>
                    {errors.whatsappNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.whatsappNumber}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Option Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-4 h-4 text-secondary" />
              <h2 className="font-bold text-sm text-primary">2. Delivery Preference</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  deliveryType === 'home_delivery'
                    ? 'border-secondary bg-blue-50/40 text-primary shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === 'home_delivery'}
                  onChange={() => setDeliveryType('home_delivery')}
                  className="mt-0.5 text-secondary"
                />
                <div>
                  <span className="font-bold block">Doorstep Home Delivery</span>
                  <span className="text-charcoal-muted text-[11px]">
                    Dispatched via reliable courier across India.
                  </span>
                </div>
              </label>

              {settings.store_pickup_enabled && (
                <label
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    deliveryType === 'store_pickup'
                      ? 'border-secondary bg-blue-50/40 text-primary shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === 'store_pickup'}
                    onChange={() => setDeliveryType('store_pickup')}
                    className="mt-0.5 text-secondary"
                  />
                  <div>
                    <span className="font-bold block">In-Store Pickup (Free)</span>
                    <span className="text-charcoal-muted text-[11px]">
                      Collect in person directly from Digital World shop.
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* Address fields (only if home delivery) */}
            {deliveryType === 'home_delivery' ? (
              <div className="space-y-3 text-xs pt-2">
                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    Complete Street Address & Landmark <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Flat No., Building name, Street, Landmark"
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-surface-muted'
                    } focus:bg-white focus:border-secondary`}
                  />
                  {errors.address && <p className="text-[11px] text-rose-600 mt-1">{errors.address}</p>}
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
                      placeholder="e.g. Jaipur"
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        errors.city ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-surface-muted'
                      } focus:bg-white focus:border-secondary`}
                    />
                    {errors.city && <p className="text-[11px] text-rose-600 mt-1">{errors.city}</p>}
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
                      placeholder="302001"
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        errors.pincode ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-surface-muted'
                      } focus:bg-white focus:border-secondary`}
                    />
                    {errors.pincode && <p className="text-[11px] text-rose-600 mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-charcoal-muted flex items-start gap-2.5">
                <Building className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">Pick up location:</span>
                  <span>{settings.business_address || 'Digital World Shop Counter'}</span>
                  <span className="block mt-1 text-[11px] text-emerald-700 font-semibold">
                    Hours: {settings.opening_hours || '10:00 AM - 08:30 PM (Mon-Sat)'}
                  </span>
                </div>
              </div>
            )}

            {/* Optional Order Notes */}
            <div>
              <label className="block font-bold text-charcoal mb-1 text-xs">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Call before delivery / deliver between 2 PM to 5 PM"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-surface-muted text-xs focus:bg-white focus:border-secondary"
              />
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Banknote className="w-4 h-4 text-secondary" />
              <h2 className="font-bold text-sm text-primary">3. Payment Method</h2>
            </div>

            <div className="space-y-3 text-xs">
              {/* Option 1: Cash on Delivery (COD) */}
              {settings.cod_enabled && (
                <label
                  className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-secondary bg-blue-50/40 text-primary shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 text-secondary"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>{t('codLabel')}</span>
                    </span>
                    <p className="text-charcoal-muted text-[11px]">
                      {t('codDesc')}
                    </p>
                  </div>
                </label>
              )}

              {/* Option 2: Pay on Delivery (UPI / QR / Cash) */}
              {settings.pay_on_delivery_enabled && (
                <label
                  className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === 'pay_on_delivery'
                      ? 'border-secondary bg-blue-50/40 text-primary shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'pay_on_delivery'}
                    onChange={() => setPaymentMethod('pay_on_delivery')}
                    className="mt-0.5 text-secondary"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-secondary" />
                      <span>{t('payOnDeliveryLabel')}</span>
                    </span>
                    <p className="text-charcoal-muted text-[11px]">
                      {t('payOnDeliveryDesc')}
                      {settings.upi_id && (
                        <span className="block mt-1 font-mono text-[11px] text-secondary font-bold">
                          Shop UPI ID: {settings.upi_id}
                        </span>
                      )}
                    </p>
                  </div>
                </label>
              )}

              {/* Option 3: Online Payment Gateway */}
              {settings.online_payment_enabled ? (
                <label
                  className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === 'online_payment'
                      ? 'border-secondary bg-blue-50/40 text-primary shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'online_payment'}
                    onChange={() => setPaymentMethod('online_payment')}
                    className="mt-0.5 text-secondary"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-secondary" />
                      <span>Online Payment Gateway (Cards / NetBanking / UPI)</span>
                    </span>
                    <p className="text-charcoal-muted text-[11px]">
                      Instant verified checkout via secure payment gateway.
                    </p>
                  </div>
                </label>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 text-charcoal-muted opacity-75">
                  <div className="flex items-center gap-2 font-semibold">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Instant Online Payment Gateway (Cards / NetBanking)</span>
                  </div>
                  <p className="text-[11px] mt-1 text-slate-500">
                    {t('onlinePaymentDisabled')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Final Submission */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card sticky top-20 space-y-5">
            <h2 className="font-bold text-sm text-primary border-b border-slate-100 pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Line items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 text-xs">
                  <img
                    src={item.product.primary_image}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-charcoal line-clamp-1">{item.product.name}</h4>
                    <p className="text-[11px] text-charcoal-muted">Qty: {item.quantity}</p>
                    <p className="font-extrabold text-primary">{formatINR(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Delivery Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-charcoal">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-semibold">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatINR(deliveryCharge)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-primary pt-3 border-t border-slate-200">
                <span>Total Payable</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Order Confirmation Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-charcoal font-medium">
                <input
                  type="checkbox"
                  checked={confirmedAccuracy}
                  onChange={(e) => setConfirmedAccuracy(e.target.checked)}
                  className="mt-0.5 rounded text-secondary focus:ring-secondary w-4 h-4 shrink-0"
                />
                <span>
                  I confirm that my contact information and delivery address are accurate.
                </span>
              </label>
              {errors.confirmation && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.confirmation}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-light active:scale-98'
              }`}
            >
              <Lock className="w-4 h-4 text-secondary-light" />
              <span>{isSubmitting ? 'Verifying & Saving Order...' : t('placeOrder')}</span>
            </button>

            <div className="text-[11px] text-charcoal-muted text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct personal warranty by Vishal Soni</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
