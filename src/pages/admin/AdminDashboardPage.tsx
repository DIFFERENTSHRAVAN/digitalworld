import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AdminUser,
  Product,
  Category,
  Order,
  OrderStatus,
  PaymentStatus,
  StoreSettings
} from '../../types';
import {
  getCurrentAdmin,
  adminLogout,
  getAllProductsAdmin,
  getAllOrdersAdmin,
  getCategories,
  addProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  clearDemoProductsAdmin,
  resetDemoDataAdmin,
  updateOrderStatusAdmin,
  updatePaymentStatusAdmin,
  isUsingLocalMode,
  formatINR,
  generateCustomerWhatsAppUpdateUrl,
  changeAdminPassword
} from '../../services/api';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Logo } from '../../components/common/Logo';
import {
  LayoutDashboard,
  Package,
  Laptop,
  ShoppingBag,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  MessageCircle,
  FileSpreadsheet,
  RotateCcw,
  Search,
  ExternalLink,
  Save,
  Check,
  X,
  Database,
  Lock
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, refreshSettings } = useStoreSettings();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'laptops' | 'orders' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  // Core Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Modals & Forms
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orderDetailsModal, setOrderDetailsModal] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter in Admin tables
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Business Settings Local Form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);

  // Admin Password Management state
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      changeAdminPassword(newAdminPassword);
      setPasswordSuccess('Admin password updated successfully! Keep your new password safe.');
      setNewAdminPassword('');
      showToast('Admin password updated successfully!');
    } catch (err: unknown) {
      setPasswordError((err as Error).message || 'Failed to update password');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const user = await getCurrentAdmin();
      if (!user) {
        navigate('/admin/login');
        return;
      }
      setAdminUser(user);

      const [prods, cats, ords] = await Promise.all([
        getAllProductsAdmin(),
        getCategories(),
        getAllOrdersAdmin()
      ]);

      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  // Metrics calculations
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const ordersToday = orders.filter(o => o.created_at.slice(0, 10) === todayStr).length;

    const pending = orders.filter(o => o.order_status === 'pending').length;
    const confirmed = orders.filter(o => o.order_status === 'confirmed').length;
    const processing = orders.filter(o => o.order_status === 'processing').length;
    const shipped = orders.filter(o => o.order_status === 'shipped').length;
    const delivered = orders.filter(o => o.order_status === 'delivered').length;
    const cancelled = orders.filter(o => o.order_status === 'cancelled').length;

    // Revenue calculation: Sum of completed and confirmed active orders
    const totalRevenue = orders
      .filter(o => o.order_status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const lowStockProducts = products.filter(p => p.stock_quantity <= 3 || p.is_sold_out);
    const usedLaptopsCount = products.filter(p => p.condition === 'second_hand').length;

    return {
      totalOrders,
      ordersToday,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue,
      lowStockProducts,
      usedLaptopsCount
    };
  }, [orders, products]);

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatusAdmin(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      if (orderDetailsModal?.id === orderId) {
        setOrderDetailsModal(updated);
      }
      showToast(`Order #${updated.order_number} marked as ${newStatus}`);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // Handle Payment Status Update
  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const updated = await updatePaymentStatusAdmin(orderId, paymentStatus);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      if (orderDetailsModal?.id === orderId) {
        setOrderDetailsModal(updated);
      }
      showToast(`Payment status updated to ${paymentStatus}`);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}" from inventory?`)) {
      await deleteProductAdmin(id);
      setProducts(products.filter(p => p.id !== id));
      showToast(`Product deleted successfully`);
    }
  };

  // Toggle quick product flags
  const handleToggleProduct = async (productId: string, updates: Partial<Product>) => {
    const updated = await updateProductAdmin(productId, updates);
    setProducts(products.map(p => p.id === productId ? updated : p));
    showToast('Product updated');
  };

  // Clear demo products
  const handleClearDemoProducts = async () => {
    if (window.confirm('Wipe all demo inventory? This is recommended before launching Digital World with actual shop inventory.')) {
      const count = await clearDemoProductsAdmin();
      const refreshed = await getAllProductsAdmin();
      setProducts(refreshed);
      showToast(`Cleared ${count} demo products from inventory.`);
    }
  };

  // Reset to sample demo data
  const handleResetDemoData = () => {
    if (window.confirm('Reset local inventory and settings to default demo dataset?')) {
      resetDemoDataAdmin();
      refreshSettings();
      loadAllData();
      showToast('Reset to demo data complete.');
    }
  };

  // CSV Inventory Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Brand', 'Model', 'Condition', 'Price', 'Original Price', 'Stock', 'Processor', 'RAM', 'Storage', 'Battery'];
    const rows = products.map(p => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      `"${p.model}"`,
      `"${p.condition}"`,
      p.price,
      p.original_price || '',
      p.stock_quantity,
      `"${(p.processor || '').replace(/"/g, '""')}"`,
      `"${p.ram || ''}"`,
      `"${p.storage_type_capacity || ''}"`,
      `"${(p.battery_health || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digital_world_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Settings Form
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settingsForm);
      showToast('Store settings saved successfully!');
    } catch (err: unknown) {
      alert('Failed to save settings: ' + (err as Error).message);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderStatusFilter !== 'all' && o.order_status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        return (
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          o.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!productSearch.trim()) return true;
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q)
      );
    });
  }, [products, productSearch]);

  const usedLaptopsList = useMemo(() => {
    return products.filter(p => p.condition === 'second_hand');
  }, [products]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-charcoal-muted">
        Loading Digital World Administration Portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-charcoal">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo />
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
              Admin Portal
            </span>

            {/* DB Mode badge */}
            <span className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              isUsingLocalMode() ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              <Database className="w-3 h-3" />
              <span>{isUsingLocalMode() ? 'Local Storage Mode' : 'Supabase Live Connected'}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/"
              className="text-charcoal-muted hover:text-secondary hidden sm:flex items-center gap-1 font-semibold"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="text-right hidden sm:block">
              <span className="font-bold text-primary block">{settings.owner_name}</span>
              <span className="text-[10px] text-charcoal-muted">{adminUser?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="container mx-auto px-4 flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 relative ${
              activeTab === 'orders'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & Dispatch</span>
            {metrics.pending > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                {metrics.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'products'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('laptops')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'laptops'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Used Laptops Specialist ({metrics.usedLaptopsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Business Settings</span>
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="container mx-auto px-4 py-8">
        {/* ===================== TAB 1: OVERVIEW ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-charcoal-muted">Total Orders</span>
                <p className="text-2xl font-extrabold text-primary">{metrics.totalOrders}</p>
                <span className="text-[10px] text-charcoal-light">Today: {metrics.ordersToday}</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-amber-800">Pending Review</span>
                <p className="text-2xl font-extrabold text-amber-700">{metrics.pending}</p>
                <span className="text-[10px] text-amber-800">Requires confirmation</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-blue-800">Confirmed / Prep</span>
                <p className="text-2xl font-extrabold text-secondary">{metrics.confirmed + metrics.processing}</p>
                <span className="text-[10px] text-blue-700">In testing/packing</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-purple-800">Dispatched</span>
                <p className="text-2xl font-extrabold text-purple-700">{metrics.shipped}</p>
                <span className="text-[10px] text-purple-700">Out for delivery</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-emerald-800">Delivered</span>
                <p className="text-2xl font-extrabold text-emerald-700">{metrics.delivered}</p>
                <span className="text-[10px] text-emerald-700">Completed sales</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-charcoal-muted">Net Active Revenue</span>
                <p className="text-xl font-extrabold text-emerald-800 truncate">{formatINR(metrics.totalRevenue)}</p>
                <span className="text-[10px] text-charcoal-light">Confirmed orders</span>
              </div>
            </div>

            {/* Quick Action Bar for Vishal Soni */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-primary">Store Operations Management</h3>
                <p className="text-xs text-charcoal-muted">
                  Owner: <strong>{settings.owner_name}</strong> | Shop WhatsApp: {settings.whatsapp_number ? `+${settings.whatsapp_number}` : '(Not yet configured)'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold rounded-xl flex items-center gap-1.5 border border-slate-300 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Export Inventory CSV</span>
                </button>

                <button
                  onClick={handleClearDemoProducts}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold rounded-xl border border-rose-200 cursor-pointer"
                  title="Remove all demo products before shop launch"
                >
                  Purge Demo Inventory
                </button>

                <button
                  onClick={handleResetDemoData}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-charcoal-muted font-semibold rounded-xl border border-slate-300 cursor-pointer"
                  title="Re-populate with test sample data"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Low-Stock Alert Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-sm text-primary">Low-Stock & Depleted Items Alert</h3>
                </div>
                <span className="text-xs font-semibold text-charcoal-muted">
                  {metrics.lowStockProducts.length} items requiring attention
                </span>
              </div>

              {metrics.lowStockProducts.length === 0 ? (
                <p className="text-xs text-charcoal-muted italic">All products currently have sufficient inventory.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {metrics.lowStockProducts.map(p => (
                    <div key={p.id} className="p-3.5 flex items-center justify-between gap-4 bg-white">
                      <div className="flex items-center gap-3">
                        <img src={p.primary_image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                        <div>
                          <p className="font-bold text-charcoal">{p.name}</p>
                          <p className="text-charcoal-muted text-[11px]">{p.brand} {p.model} | {formatINR(p.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                          p.stock_quantity === 0 || p.is_sold_out
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} left`}
                        </span>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProductModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: PRODUCTS ===================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-80 relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name, brand..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-charcoal"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-charcoal text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>CSV Export</span>
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-charcoal-muted uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-3">Condition</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Stock</th>
                      <th className="py-3 px-3">Featured / Offer</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={p.primary_image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-charcoal truncate" title={p.name}>{p.name}</p>
                              <p className="text-[11px] text-charcoal-muted">{p.brand} {p.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            p.condition === 'second_hand' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {p.condition === 'second_hand' ? 'Used Laptop' : 'Brand New'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-extrabold text-primary">{formatINR(p.price)}</span>
                          {p.original_price && (
                            <span className="block text-[10px] text-charcoal-light line-through">{formatINR(p.original_price)}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-bold ${
                            p.stock_quantity <= 0 ? 'text-rose-600' : p.stock_quantity <= 3 ? 'text-amber-600' : 'text-emerald-700'
                          }`}>
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleProduct(p.id, { is_featured: !p.is_featured })}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                p.is_featured ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              Featured
                            </button>
                            <button
                              onClick={() => handleToggleProduct(p.id, { is_special_offer: !p.is_special_offer })}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                p.is_special_offer ? 'bg-purple-600 text-white border-purple-700' : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              Offer
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleProduct(p.id, { is_published: !p.is_published })}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {p.is_published ? 'Published' : 'Hidden'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-secondary hover:bg-slate-100"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: USED LAPTOPS SPECIALIST ===================== */}
        {activeTab === 'laptops' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-amber-500/10 border border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-primary">
                  Refurbished Laptop Inventory & Diagnostic Reports
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Manage individual condition grades, battery backups, reported flaws, and reservation states.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct({
                    id: '',
                    name: '',
                    slug: '',
                    brand: 'Lenovo',
                    model: '',
                    category_id: 'c1',
                    condition: 'second_hand',
                    price: 20000,
                    stock_quantity: 1,
                    is_featured: false,
                    is_published: true,
                    is_sold_out: false,
                    is_special_offer: false,
                    description: '',
                    primary_image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
                    images: [],
                    specifications: {},
                    processor: 'Intel Core i5 8th Gen',
                    ram: '16GB DDR4',
                    storage_type_capacity: '512GB SSD',
                    screen_size: '14-inch FHD IPS',
                    battery_health: 'Verified 85% Health (3.5+ Hours)',
                    physical_condition_grade: 'Grade A (Excellent)',
                    known_defects: 'None',
                    included_accessories: 'Original Charger & Power Cord'
                  });
                  setProductModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                + Add Inspected Laptop
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {usedLaptopsList.map((laptop) => (
                <div key={laptop.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img src={laptop.primary_image} alt={laptop.name} className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-secondary">{laptop.brand} {laptop.model}</span>
                        <h4 className="font-bold text-sm text-charcoal leading-snug">{laptop.name}</h4>
                        <span className="font-extrabold text-primary text-base">{formatINR(laptop.price)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {laptop.is_reserved ? (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-extrabold text-[10px]">
                          RESERVED
                        </span>
                      ) : laptop.stock_quantity <= 0 || laptop.is_sold_out ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-extrabold text-[10px]">
                          SOLD OUT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          READY TO SELL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Diagnostic report card */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-charcoal-muted block">CPU:</span>
                      <strong className="text-charcoal">{laptop.processor || 'Not set'}</strong>
                    </div>
                    <div>
                      <span className="text-charcoal-muted block">RAM:</span>
                      <strong className="text-charcoal">{laptop.ram || 'Not set'}</strong>
                    </div>
                    <div>
                      <span className="text-charcoal-muted block">Storage:</span>
                      <strong className="text-charcoal">{laptop.storage_type_capacity || 'Not set'}</strong>
                    </div>
                    <div>
                      <span className="text-charcoal-muted block">Battery Health:</span>
                      <strong className="text-emerald-700">{laptop.battery_health || 'Not set'}</strong>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/50">
                      <span className="text-charcoal-muted block">Physical Grade & Condition:</span>
                      <span className="text-charcoal">{laptop.physical_condition_grade || 'Grade A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-charcoal-muted block">Defects / Repairs:</span>
                      <span className="text-charcoal">{laptop.known_defects || 'None reported'}</span>
                    </div>
                  </div>

                  {/* Quick toggle actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleProduct(laptop.id, { is_reserved: !laptop.is_reserved })}
                        className={`px-3 py-1.5 rounded-lg font-semibold border ${
                          laptop.is_reserved
                            ? 'bg-purple-600 text-white border-purple-700'
                            : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        {laptop.is_reserved ? 'Mark Available' : 'Mark Reserved'}
                      </button>

                      <button
                        onClick={() => handleToggleProduct(laptop.id, {
                          is_sold_out: !laptop.is_sold_out,
                          stock_quantity: laptop.is_sold_out ? 1 : 0
                        })}
                        className={`px-3 py-1.5 rounded-lg font-semibold border ${
                          laptop.is_sold_out
                            ? 'bg-rose-600 text-white border-rose-700'
                            : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                        }`}
                      >
                        {laptop.is_sold_out ? 'Re-open Stock' : 'Mark Sold'}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setEditingProduct(laptop);
                        setProductModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold rounded-lg"
                    >
                      Edit Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 4: ORDERS ===================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-80 relative">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order ID, customer name, phone..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-charcoal"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Status pill filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto">
                {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-primary text-white'
                        : 'bg-white border border-slate-200 text-charcoal-muted hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-charcoal-muted uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-3">Customer Details</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3">Order Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => {
                      const cleanPhone = order.customer_phone.replace(/\D/g, '');
                      const whatsappUrl = generateCustomerWhatsAppUpdateUrl(cleanPhone, order, order.order_status);

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setOrderDetailsModal(order)}
                              className="font-bold text-secondary hover:underline font-mono block text-left"
                            >
                              {order.order_number}
                            </button>
                            <span className="text-[10px] text-charcoal-muted">
                              {new Date(order.created_at).toLocaleDateString('en-IN')} {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-bold text-charcoal block">{order.customer_name}</span>
                            <span className="text-[11px] text-charcoal-muted">+91 {order.customer_phone}</span>
                            <span className="text-[10px] text-charcoal-light block truncate max-w-[160px]">
                              {order.city}, {order.state}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-extrabold text-primary block">
                              {formatINR(order.total_amount)}
                            </span>
                            <span className="text-[10px] text-charcoal-muted">
                              {order.items?.length || 0} items
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <span className="font-semibold text-charcoal block uppercase text-[10px]">
                                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method === 'pay_on_delivery' ? 'Pay on Delivery' : 'Online'}
                              </span>
                              <button
                                onClick={() => handleUpdatePaymentStatus(order.id, order.payment_status === 'collected' ? 'pending' : 'collected')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  order.payment_status === 'collected'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                                title="Click to toggle Payment Pending / Collected"
                              >
                                {order.payment_status === 'collected' ? 'Payment Collected' : 'Payment Pending'}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <select
                              value={order.order_status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                                order.order_status === 'delivered' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                                order.order_status === 'shipped' ? 'bg-purple-50 border-purple-300 text-purple-800' :
                                order.order_status === 'confirmed' ? 'bg-blue-50 border-blue-300 text-blue-800' :
                                order.order_status === 'cancelled' ? 'bg-rose-50 border-rose-300 text-rose-800' :
                                'bg-amber-50 border-amber-300 text-amber-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing & Testing</option>
                              <option value="shipped">Shipped / Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300"
                                title="Send order status message to customer WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                              </a>
                              <button
                                onClick={() => setOrderDetailsModal(order)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold text-xs"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 5: BUSINESS SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-primary">Store Configuration & Owner Details</h2>
                <p className="text-xs text-charcoal-muted mt-1">
                  All business information can be edited here. Fill in your real shop address, WhatsApp number, and delivery policies.
                </p>
              </div>

              {/* Central Code Config Tip */}
              <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
                <Settings className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950">
                  <p className="font-bold">Centralized Code Configuration</p>
                  <p className="mt-0.5 text-blue-900">
                    You can update store details here in this dashboard, or directly in one central file in your codebase: <code className="bg-white/80 border border-blue-200 text-blue-900 font-mono font-bold px-1.5 py-0.5 rounded">src/config/storeConfig.ts</code>. Changes in that file automatically apply across all pages, WhatsApp ordering, and notifications!
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                {/* Basic Shop Identity */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-primary">Shop Identity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-charcoal mb-1">Business Name</label>
                      <input
                        type="text"
                        value={settingsForm.shop_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, shop_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-charcoal mb-1">Owner Name</label>
                      <input
                        type="text"
                        value={settingsForm.owner_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, owner_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Channels */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h3 className="font-bold text-sm text-primary">Primary Contact Channels</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-charcoal mb-1">
                        Shop WhatsApp Number <span className="text-secondary font-mono">(e.g. 919876543210)</span>
                      </label>
                      <input
                        type="text"
                        value={settingsForm.whatsapp_number}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                        placeholder="Enter 10-digit or 91-prefixed WhatsApp"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-charcoal mb-1">Shop Call Number</label>
                      <input
                        type="text"
                        value={settingsForm.contact_number}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contact_number: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-charcoal mb-1">Email Address</label>
                      <input
                        type="email"
                        value={settingsForm.email_address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email_address: e.target.value })}
                        placeholder="vishal@digitalworld.in"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-charcoal mb-1">Shop Physical Address</label>
                      <textarea
                        rows={2}
                        value={settingsForm.business_address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, business_address: e.target.value })}
                        placeholder="Shop No. 12, Main Market, ..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-charcoal mb-1">Opening Hours</label>
                      <input
                        type="text"
                        value={settingsForm.opening_hours}
                        onChange={(e) => setSettingsForm({ ...settingsForm, opening_hours: e.target.value })}
                        placeholder="10:00 AM - 08:30 PM (Mon-Sat)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery & Payment Rules */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h3 className="font-bold text-sm text-primary">Delivery & Payment Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-charcoal mb-1">Standard Delivery Charge (₹)</label>
                      <input
                        type="number"
                        value={settingsForm.delivery_charges}
                        onChange={(e) => setSettingsForm({ ...settingsForm, delivery_charges: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-charcoal mb-1">Free Delivery Above (₹)</label>
                      <input
                        type="number"
                        value={settingsForm.free_delivery_above}
                        onChange={(e) => setSettingsForm({ ...settingsForm, free_delivery_above: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-charcoal mb-1">Minimum Order Amount (₹)</label>
                      <input
                        type="number"
                        value={settingsForm.minimum_order_amount}
                        onChange={(e) => setSettingsForm({ ...settingsForm, minimum_order_amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>
                  </div>

                  {/* Payment Switches */}
                  <div className="pt-2 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Payment Methods & Gateway Controls
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-surface-muted cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={settingsForm.cod_enabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, cod_enabled: e.target.checked })}
                          className="rounded text-secondary w-4 h-4"
                        />
                        <span>Cash on Delivery (COD)</span>
                      </label>

                      <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-surface-muted cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={settingsForm.pay_on_delivery_enabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, pay_on_delivery_enabled: e.target.checked })}
                          className="rounded text-secondary w-4 h-4"
                        />
                        <span>Pay on Delivery (UPI)</span>
                      </label>

                      <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-surface-muted cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={settingsForm.store_pickup_enabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, store_pickup_enabled: e.target.checked })}
                          className="rounded text-secondary w-4 h-4"
                        />
                        <span>In-Store Pickup</span>
                      </label>

                      <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-surface-muted cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={settingsForm.online_payment_enabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, online_payment_enabled: e.target.checked })}
                          className="rounded text-secondary w-4 h-4"
                        />
                        <span>Online Gateway (Cards)</span>
                      </label>
                    </div>

                    {/* Shop UPI ID Configuration */}
                    <div className="pt-1">
                      <label className="block font-bold text-charcoal mb-1">
                        Shop UPI ID <span className="text-secondary font-mono">(Used for customer UPI & QR payments upon delivery)</span>
                      </label>
                      <input
                        type="text"
                        value={settingsForm.upi_id || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, upi_id: e.target.value })}
                        placeholder="e.g. 6377123270@upi or yourshop@okhdfcbank"
                        className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Policies Texts */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h3 className="font-bold text-sm text-primary">Warranty & Replacement Policies</h3>
                  <div>
                    <label className="block font-bold text-charcoal mb-1">Testing Warranty Policy</label>
                    <textarea
                      rows={2}
                      value={settingsForm.warranty_policy_text}
                      onChange={(e) => setSettingsForm({ ...settingsForm, warranty_policy_text: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal mb-1">Replacement & Return Policy</label>
                    <textarea
                      rows={2}
                      value={settingsForm.return_policy_text}
                      onChange={(e) => setSettingsForm({ ...settingsForm, return_policy_text: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Store Settings</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Owner Password & Security Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
                    <Lock className="w-4 h-4 text-secondary" />
                    <span>Admin Portal Security & Password</span>
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Change your shop owner login password to prevent unauthorized access.
                  </p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1">
                <div className="flex-1">
                  <label className="block font-bold text-charcoal mb-1 text-xs">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter at least 6 characters (e.g. Vishal@2026)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted text-xs focus:bg-white focus:border-secondary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ===================== ADD / EDIT PRODUCT MODAL ===================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 text-left space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-lg text-primary">
                {editingProduct?.id ? 'Edit Product' : 'Add New Inventory Product'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                const condition = formData.get('condition') as 'new' | 'second_hand';
                const name = formData.get('name') as string;
                const brand = formData.get('brand') as string;
                const model = formData.get('model') as string;
                const price = parseFloat(formData.get('price') as string);
                const originalPriceVal = formData.get('original_price') as string;
                const originalPrice = originalPriceVal ? parseFloat(originalPriceVal) : undefined;
                const stock = parseInt(formData.get('stock') as string, 10);
                const categoryId = formData.get('category_id') as string;
                const description = formData.get('description') as string;
                const primaryImage = formData.get('primary_image') as string;

                const payload: Partial<Product> = {
                  name,
                  brand,
                  model,
                  category_id: categoryId,
                  condition,
                  price,
                  original_price: originalPrice,
                  stock_quantity: stock,
                  description,
                  primary_image: primaryImage,
                  is_published: true,
                  is_sold_out: stock <= 0,
                  is_featured: formData.get('is_featured') === 'on',
                  is_special_offer: formData.get('is_special_offer') === 'on',
                  offer_badge_text: (formData.get('offer_badge_text') as string) || undefined,
                  warranty_info: formData.get('warranty_info') as string,
                  // Laptop specific fields
                  processor: (formData.get('processor') as string) || undefined,
                  ram: (formData.get('ram') as string) || undefined,
                  storage_type_capacity: (formData.get('storage_type_capacity') as string) || undefined,
                  screen_size: (formData.get('screen_size') as string) || undefined,
                  battery_health: (formData.get('battery_health') as string) || undefined,
                  physical_condition_grade: (formData.get('physical_condition_grade') as string) || undefined,
                  known_defects: (formData.get('known_defects') as string) || undefined,
                  included_accessories: (formData.get('included_accessories') as string) || undefined
                };

                if (editingProduct?.id) {
                  const updated = await updateProductAdmin(editingProduct.id, payload);
                  setProducts(products.map(p => p.id === updated.id ? updated : p));
                  showToast('Product updated successfully!');
                } else {
                  const added = await addProductAdmin(payload as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
                  setProducts([added, ...products]);
                  showToast('New product added to catalog!');
                }

                setProductModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Product Title *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingProduct?.name || ''}
                    placeholder="e.g. Lenovo ThinkPad T480 (Core i5 8th / 16GB)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Category *</label>
                  <select
                    name="category_id"
                    defaultValue={editingProduct?.category_id || categories[0]?.id}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    required
                    defaultValue={editingProduct?.brand || ''}
                    placeholder="e.g. Lenovo, Dell, Kingston"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Model *</label>
                  <input
                    type="text"
                    name="model"
                    required
                    defaultValue={editingProduct?.model || ''}
                    placeholder="e.g. T480 / SE2422"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Condition *</label>
                  <select
                    name="condition"
                    defaultValue={editingProduct?.condition || 'second_hand'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="second_hand">Certified Refurbished</option>
                    <option value="new">Brand New</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    defaultValue={editingProduct?.price || ''}
                    placeholder="21999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Original Price (₹) (Optional)</label>
                  <input
                    type="number"
                    name="original_price"
                    defaultValue={editingProduct?.original_price || ''}
                    placeholder="24999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    defaultValue={editingProduct ? editingProduct.stock_quantity : 1}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Primary Image URL *</label>
                <input
                  type="url"
                  name="primary_image"
                  required
                  defaultValue={editingProduct?.primary_image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {/* Second Hand Laptop Diagnostics Fields */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                <span className="font-bold text-amber-900 block text-xs">
                  Refurbished Laptop Inspection Diagnostics (if applicable)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="processor"
                    defaultValue={editingProduct?.processor || ''}
                    placeholder="Processor (e.g. Core i5 8th Gen 8350U)"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    name="ram"
                    defaultValue={editingProduct?.ram || ''}
                    placeholder="RAM (e.g. 16GB DDR4)"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    name="storage_type_capacity"
                    defaultValue={editingProduct?.storage_type_capacity || ''}
                    placeholder="Storage (e.g. 512GB NVMe SSD)"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    name="battery_health"
                    defaultValue={editingProduct?.battery_health || ''}
                    placeholder="Battery Health (e.g. 84% Health, ~4 hrs backup)"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    name="physical_condition_grade"
                    defaultValue={editingProduct?.physical_condition_grade || ''}
                    placeholder="Grade (e.g. Grade A - Mint Condition)"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    name="known_defects"
                    defaultValue={editingProduct?.known_defects || ''}
                    placeholder="Known defects / repairs (e.g. None reported)"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Description *</label>
                <textarea
                  rows={3}
                  name="description"
                  required
                  defaultValue={editingProduct?.description || ''}
                  placeholder="Detailed description of hardware, conditions, ports..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Warranty Information</label>
                <input
                  type="text"
                  name="warranty_info"
                  defaultValue={editingProduct?.warranty_info || '30 Days In-Shop Hardware Testing Warranty'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    name="is_featured"
                    defaultChecked={editingProduct?.is_featured}
                    className="rounded text-secondary"
                  />
                  <span>Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    name="is_special_offer"
                    defaultChecked={editingProduct?.is_special_offer}
                    className="rounded text-secondary"
                  />
                  <span>Mark as Special Offer</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-light"
                >
                  {editingProduct?.id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== VIEW ORDER DETAILS MODAL ===================== */}
      {orderDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-primary font-mono">
                  {orderDetailsModal.order_number}
                </h3>
                <span className="text-xs text-charcoal-muted">
                  Placed on {new Date(orderDetailsModal.created_at).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setOrderDetailsModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-primary block">Customer & Shipping Address:</span>
              <p className="font-semibold text-charcoal">{orderDetailsModal.customer_name}</p>
              <p className="text-charcoal-muted">Phone: +91 {orderDetailsModal.customer_phone}</p>
              <p className="text-charcoal-muted">WhatsApp: +91 {orderDetailsModal.customer_whatsapp}</p>
              <p className="text-charcoal mt-1">
                {orderDetailsModal.delivery_type === 'store_pickup'
                  ? 'Store Pickup'
                  : `${orderDetailsModal.delivery_address}, ${orderDetailsModal.city}, ${orderDetailsModal.state} - ${orderDetailsModal.pincode}`}
              </p>
              {orderDetailsModal.order_notes && (
                <p className="text-amber-800 pt-1">
                  <strong>Notes:</strong> {orderDetailsModal.order_notes}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-primary block">Items in Order:</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {(orderDetailsModal.items || []).map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                    <div>
                      <p className="font-bold text-charcoal">{it.product_name}</p>
                      <p className="text-[11px] text-charcoal-muted">Qty: {it.quantity} × {formatINR(it.unit_price)}</p>
                    </div>
                    <span className="font-bold text-primary">{formatINR(it.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-surface-muted rounded-xl flex items-center justify-between font-extrabold text-sm text-primary">
                <span>Total Amount:</span>
                <span>{formatINR(orderDetailsModal.total_amount)}</span>
              </div>
            </div>

            {/* Status History */}
            {orderDetailsModal.status_history && orderDetailsModal.status_history.length > 0 && (
              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <span className="font-bold text-charcoal block">Status Audit Log:</span>
                <div className="space-y-1">
                  {orderDetailsModal.status_history.map((h, i) => (
                    <div key={i} className="text-[11px] text-charcoal-muted flex justify-between">
                      <span>• {h.status.toUpperCase()}: {h.note}</span>
                      <span className="text-slate-400">{new Date(h.created_at).toLocaleTimeString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <a
                href={generateCustomerWhatsAppUpdateUrl(orderDetailsModal.customer_phone, orderDetailsModal, orderDetailsModal.order_status)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Message on WhatsApp</span>
              </a>

              <button
                onClick={() => setOrderDetailsModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-charcoal font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
