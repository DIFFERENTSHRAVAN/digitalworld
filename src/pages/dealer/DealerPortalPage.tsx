import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDealerAuth } from '../../context/DealerAuthContext';
import {
  Product,
  Order,
  PaymentMethod,
  PaymentStatus,
  OrderStatus
} from '../../types';
import {
  getDealerProducts,
  createDealerOrder,
  getDealerOrders,
  formatINR,
  generateDealerOrderWhatsAppUrl
} from '../../services/api';
import {
  Briefcase,
  Package,
  ShoppingBag,
  TrendingDown,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  LogOut,
  MapPin,
  Building2,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Truck,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { STORE_CONFIG } from '../../config/storeConfig';

interface WholesaleCartItem {
  product: Product;
  quantity: number;
}

export const DealerPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const { dealer, isDealerLoggedIn, logout } = useDealerAuth();

  const [activeTab, setActiveTab] = useState<'catalogue' | 'orders' | 'profile'>('catalogue');

  // Catalogue State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Wholesale Cart State
  const [cartItems, setCartItems] = useState<WholesaleCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // Checkout Form State
  const [deliveryType, setDeliveryType] = useState<'store_pickup' | 'home_delivery'>('store_pickup');
  const [deliveryAddress, setDeliveryAddress] = useState(dealer?.address || '');
  const [city, setCity] = useState(dealer?.city || '');
  const [state, setState] = useState(dealer?.state || 'Rajasthan');
  const [pincode, setPincode] = useState(dealer?.pincode || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_on_delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Orders History State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Auth Protection Guard
  useEffect(() => {
    if (!dealer || dealer.status !== 'approved') {
      navigate('/dealer/login');
    }
  }, [dealer, navigate]);

  // Load Catalogue
  useEffect(() => {
    const fetchCatalogue = async () => {
      setLoadingProducts(true);
      try {
        const list = await getDealerProducts();
        setProducts(list);
      } catch (err) {
        console.error('Failed to load dealer products', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (dealer && dealer.status === 'approved') {
      fetchCatalogue();
    }
  }, [dealer]);

  // Load Orders when tab changes
  useEffect(() => {
    if (activeTab === 'orders' && dealer) {
      loadDealerOrders();
    }
  }, [activeTab, dealer]);

  const loadDealerOrders = async () => {
    if (!dealer) return;
    setLoadingOrders(true);
    try {
      const list = await getDealerOrders(dealer.id);
      setOrders(list);
    } catch (err) {
      console.error('Failed to load dealer orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Add to Wholesale Cart
  const addToWholesaleCart = (product: Product) => {
    const minQty = product.min_dealer_qty || 1;
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: minQty }];
    });
    setIsCartOpen(true);
  };

  // Update Cart Quantity
  const updateCartQty = (productId: string, newQty: number) => {
    setCartItems(prev => {
      if (newQty <= 0) {
        return prev.filter(item => item.product.id !== productId);
      }
      return prev.map(item => {
        if (item.product.id === productId) {
          const minQty = item.product.min_dealer_qty || 1;
          const clampedQty = Math.max(minQty, newQty);
          return { ...item, quantity: clampedQty };
        }
        return item;
      });
    });
  };

  // Remove from Cart
  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Cart Subtotals & Margins
  const cartTotals = useMemo(() => {
    let wholesaleSubtotal = 0;
    let retailMRPValue = 0;

    cartItems.forEach(item => {
      const wholesalePrice = item.product.dealer_price || Math.round(item.product.price * 0.85);
      wholesaleSubtotal += wholesalePrice * item.quantity;
      retailMRPValue += item.product.price * item.quantity;
    });

    const totalSavings = retailMRPValue - wholesaleSubtotal;
    const marginPercentage = retailMRPValue > 0 ? Math.round((totalSavings / retailMRPValue) * 100) : 0;

    return {
      wholesaleSubtotal,
      retailMRPValue,
      totalSavings,
      marginPercentage,
      itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0)
    };
  }, [cartItems]);

  // Handle Wholesale Order Submission
  const handlePlaceWholesaleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealer) return;

    if (cartItems.length === 0) {
      setCheckoutError('Wholesale cart is empty.');
      return;
    }

    setCheckoutError(null);
    setOrderSubmitting(true);

    try {
      const res = await createDealerOrder({
        dealerId: dealer.id,
        items: cartItems.map(i => ({ product: i.product, quantity: i.quantity })),
        deliveryType,
        deliveryAddress: deliveryType === 'store_pickup' ? 'Digital World Shop Handover' : deliveryAddress,
        city: deliveryType === 'store_pickup' ? 'Local' : city,
        state: deliveryType === 'store_pickup' ? 'Rajasthan' : state,
        pincode: deliveryType === 'store_pickup' ? '302001' : pincode,
        paymentMethod,
        orderNotes
      });

      if (res.success && res.order) {
        setOrderSuccess(res.order);
        setCartItems([]);
        setIsCartOpen(false);
        loadDealerOrders();
      } else {
        setCheckoutError(res.message || 'Failed to place wholesale order.');
      }
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'An error occurred during order submission.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category_id === selectedCategory || p.category_name?.toLowerCase().includes(selectedCategory.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        (p.processor && p.processor.toLowerCase().includes(q))
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  if (!dealer) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-charcoal">
      {/* Top B2B Dealer Banner */}
      <header className="bg-primary text-white border-b border-primary-dark shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="shrink-0 flex items-center gap-2">
              <Logo />
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-sm">
                B2B Portal
              </span>
            </Link>

            <div className="hidden sm:block border-l border-white/20 pl-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-secondary-light" />
                <span>{dealer.business_name}</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded text-[10px] font-mono">
                  {dealer.dealer_code}
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                Contact: {dealer.contact_person} • {dealer.city}, {dealer.state}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Wholesale Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3.5 py-2 bg-secondary hover:bg-secondary-dark text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-2 relative cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Wholesale Cart</span>
              {cartTotals.itemCount > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black rounded-full text-[10px]">
                  {cartTotals.itemCount}
                </span>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-primary-dark/80 px-4 border-t border-white/10">
          <div className="container mx-auto flex items-center gap-2 sm:gap-6 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('catalogue')}
              className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'catalogue'
                  ? 'border-amber-400 text-amber-400 font-extrabold'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Wholesale Catalogue ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-amber-400 text-amber-400 font-extrabold'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>My Wholesale Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-amber-400 text-amber-400 font-extrabold'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Dealer Profile & GST</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* TAB 1: WHOLESALE CATALOGUE */}
        {activeTab === 'catalogue' && (
          <div className="space-y-6">
            {/* Wholesale Welcome Banner */}
            <div className="bg-gradient-to-r from-primary via-slate-800 to-primary text-white p-5 rounded-2xl shadow-md border border-slate-300/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-emerald-500 text-white font-black text-[10px] rounded uppercase tracking-wider">
                    B2B Wholesale Rates Active
                  </span>
                  <span className="text-xs text-amber-300 font-semibold">
                    15% - 25% Trade Discount
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black">
                  Welcome, {dealer.contact_person} ({dealer.business_name})
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Showing exclusive dealer wholesale prices and refurbished bulk lots with 30-day testing warranty.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs backdrop-blur-sm border border-white/20">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>GST Bill & Instant Dispatch</span>
              </div>
            </div>

            {/* Search and Category Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search wholesale products, lots, models..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-secondary transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                  }`}
                >
                  All Items ({products.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('Refurbished Laptops')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'Refurbished Laptops'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                  }`}
                >
                  Refurbished Laptops
                </button>
                <button
                  onClick={() => setSelectedCategory('Storage Devices')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'Storage Devices'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                  }`}
                >
                  SSDs & Storage
                </button>
                <button
                  onClick={() => setSelectedCategory('Computer Accessories')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'Computer Accessories'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                  }`}
                >
                  Accessories & Peripherals
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="py-20 text-center space-y-3">
                <Clock className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-500">Loading wholesale inventory...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
                <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-charcoal">No products found matching your filter.</p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="mt-3 px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const wholesalePrice = product.dealer_price || Math.round(product.price * 0.85);
                  const retailMRP = product.price;
                  const savings = retailMRP - wholesalePrice;
                  const marginPct = retailMRP > 0 ? Math.round((savings / retailMRP) * 100) : 0;
                  const minQty = product.min_dealer_qty || 1;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative"
                    >
                      {/* Product Image & Badges */}
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={product.primary_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Dealer exclusive lot badge */}
                        {product.is_dealer_only && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded shadow">
                            Exclusive Dealer Lot
                          </span>
                        )}

                        {/* Margin badge */}
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded shadow flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          <span>Save {marginPct}%</span>
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            {product.brand} • {product.condition === 'second_hand' ? 'Refurbished Grade A' : 'Brand New'}
                          </div>
                          <h3 className="text-sm font-bold text-charcoal line-clamp-2 mt-0.5">
                            {product.name}
                          </h3>

                          {product.processor && (
                            <div className="text-xs text-slate-500 line-clamp-1 mt-1 font-mono">
                              {product.processor} | {product.ram}
                            </div>
                          )}
                        </div>

                        {/* Wholesale Price Box */}
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[11px] text-slate-500 font-semibold">Dealer Price:</span>
                            <span className="text-lg font-black text-emerald-700">
                              {formatINR(wholesalePrice)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 pt-1">
                            <span>Retail MRP: <del>{formatINR(retailMRP)}</del></span>
                            <span className="text-emerald-600 font-bold">
                              Profit: +{formatINR(savings)}
                            </span>
                          </div>
                        </div>

                        {/* Stock & Minimum Order info */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Min Order: <strong>{minQty} units</strong></span>
                          <span>In Stock: <strong>{product.stock_quantity}</strong></span>
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={() => addToWholesaleCart(product)}
                          disabled={product.stock_quantity <= 0}
                          className="w-full py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to Wholesale Cart (Min {minQty})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY WHOLESALE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary">Wholesale Order History</h2>
                <p className="text-xs text-slate-500">Track and manage your B2B orders with invoice breakdowns</p>
              </div>
              <button
                onClick={loadDealerOrders}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-charcoal rounded-xl text-xs font-semibold cursor-pointer"
              >
                Refresh Orders
              </button>
            </div>

            {loadingOrders ? (
              <div className="py-20 text-center">
                <Clock className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">Fetching wholesale orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-charcoal">No Wholesale Orders Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse our wholesale catalogue and place your first B2B bulk order with dealer wholesale prices.
                </p>
                <button
                  onClick={() => setActiveTab('catalogue')}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Browse Wholesale Catalogue
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusColors: Record<OrderStatus, string> = {
                    pending: 'bg-amber-100 text-amber-800 border-amber-300',
                    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
                    processing: 'bg-purple-100 text-purple-800 border-purple-300',
                    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    cancelled: 'bg-rose-100 text-rose-800 border-rose-300'
                  };

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-primary text-sm">
                            {order.order_number}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              statusColors[order.order_status] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.order_status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1">
                            <span className="font-medium text-slate-800">
                              {item.product_name} <span className="text-slate-400">×{item.quantity}</span>
                            </span>
                            <span className="font-semibold text-slate-900">
                              {formatINR(item.total_price)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <div className="text-xs">
                          <span className="text-slate-500">Wholesale Total: </span>
                          <span className="font-black text-sm text-primary">
                            {formatINR(order.total_amount)}
                          </span>
                          <span className="text-slate-400 ml-2">
                            ({order.payment_method.toUpperCase()} • {order.payment_status})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-charcoal rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            View Invoice Details
                          </button>

                          <a
                            href={generateDealerOrderWhatsAppUrl(order, dealer)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Status</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEALER PROFILE & GST */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-primary">B2B Dealer Profile</h2>
                  <p className="text-xs text-slate-500">Verified trade account details and wholesale authorization</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-black uppercase tracking-wider">
                  Approved Dealer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">Dealer Reference Code</div>
                  <div className="text-base font-black text-primary font-mono">{dealer.dealer_code}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">Business / Firm Name</div>
                  <div className="font-bold text-slate-900">{dealer.business_name}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">Authorized Contact Person</div>
                  <div className="font-semibold text-slate-900">{dealer.contact_person}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">GSTIN Number</div>
                  <div className="font-mono font-bold text-slate-900">
                    {dealer.gst_number || 'Not Registered / Composition'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">Registered Phone</div>
                  <div className="font-medium text-slate-900">+91 {dealer.phone}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">Registered Email</div>
                  <div className="font-medium text-slate-900">{dealer.email}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm">
                <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">Shop / Warehouse Address</div>
                <div className="font-medium text-slate-800">
                  {dealer.address}, {dealer.city}, {dealer.state} - {dealer.pincode}
                </div>
              </div>

              {dealer.admin_notes && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900">
                  <strong>Admin Trade Note:</strong> {dealer.admin_notes}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* WHOLESALE CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            {/* Drawer Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Wholesale B2B Order</h3>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded font-mono">
                  {cartTotals.itemCount} Units
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {cartItems.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-500">Your wholesale cart is empty.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cartItems.map((item) => {
                      const wholesalePrice = item.product.dealer_price || Math.round(item.product.price * 0.85);
                      const minQty = item.product.min_dealer_qty || 1;

                      return (
                        <div
                          key={item.product.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-charcoal line-clamp-1">
                              {item.product.name}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-emerald-700 font-extrabold text-sm">
                              {formatINR(wholesalePrice * item.quantity)}
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                ({formatINR(wholesalePrice)}/ea)
                              </span>
                            </div>

                            {/* Qty controls */}
                            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg p-0.5">
                              <button
                                onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                                className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                                title={`Min order is ${minQty}`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 font-bold text-xs">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                                className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary & Savings Callout */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Retail Value:</span>
                      <span>{formatINR(cartTotals.retailMRPValue)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-800">
                      <span>B2B Dealer Total:</span>
                      <span className="text-base">{formatINR(cartTotals.wholesaleSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-emerald-700 pt-1 border-t border-emerald-200 font-semibold">
                      <span>Trade Profit Margin:</span>
                      <span>+{formatINR(cartTotals.totalSavings)} ({cartTotals.marginPercentage}%)</span>
                    </div>
                  </div>

                  {/* B2B Checkout Form */}
                  <form onSubmit={handlePlaceWholesaleOrder} className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Fulfillment & Delivery
                    </h4>

                    {checkoutError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs">
                        {checkoutError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('store_pickup')}
                        className={`p-2.5 border rounded-xl font-bold cursor-pointer transition-all ${
                          deliveryType === 'store_pickup'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Shop Handover (Free)
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType('home_delivery')}
                        className={`p-2.5 border rounded-xl font-bold cursor-pointer transition-all ${
                          deliveryType === 'home_delivery'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Shop Dispatch (Free)
                      </button>
                    </div>

                    {deliveryType === 'home_delivery' && (
                      <div className="space-y-2 text-xs">
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Shop / Delivery Address"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                          />
                          <input
                            type="text"
                            required
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="Pincode"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Payment Option</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                      >
                        <option value="pay_on_delivery">Pay on Delivery / Pickup (Cash or UPI)</option>
                        <option value="cod">Cash on Delivery</option>
                        <option value="online_payment">Direct Bank Transfer / RTGS</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Order Notes (Optional)</label>
                      <input
                        type="text"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Urgent lot, testing note, etc."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={orderSubmitting}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {orderSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Submitting Wholesale Order...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm & Place Wholesale Order</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORDER PLACED SUCCESS MODAL */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scale-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                Wholesale Order Confirmed
              </span>
              <h3 className="text-xl font-extrabold text-primary mt-2">
                Order {orderSuccess.order_number} Received!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your B2B order has been queued for testing and packing by Vishal Soni.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Dealer Code:</span>
                <span className="font-mono font-bold">{dealer.dealer_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Business:</span>
                <span className="font-semibold">{dealer.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payable Total:</span>
                <span className="font-bold text-emerald-700">{formatINR(orderSuccess.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-medium uppercase">{orderSuccess.payment_method}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={generateDealerOrderWhatsAppUrl(orderSuccess, dealer)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Order Confirmation on WhatsApp</span>
              </a>

              <button
                onClick={() => { setOrderSuccess(null); setActiveTab('orders'); }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold rounded-xl text-xs cursor-pointer"
              >
                Close & View Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER INVOICE DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-primary text-base">
                  Invoice Breakdown: {selectedOrderDetails.order_number}
                </h3>
                <span className="text-xs text-slate-400">
                  {new Date(selectedOrderDetails.created_at).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {(selectedOrderDetails.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs p-2 bg-slate-50 rounded-xl">
                  <div>
                    <div className="font-bold text-slate-800">{item.product_name}</div>
                    <div className="text-slate-400">Qty: {item.quantity} × {formatINR(item.unit_price)}</div>
                  </div>
                  <div className="font-black text-slate-900">{formatINR(item.total_price)}</div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-100 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatINR(selectedOrderDetails.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span>FREE (B2B)</span>
              </div>
              <div className="flex justify-between font-black text-sm text-primary pt-1 border-t border-slate-200">
                <span>Total Payable:</span>
                <span>{formatINR(selectedOrderDetails.total_amount)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
