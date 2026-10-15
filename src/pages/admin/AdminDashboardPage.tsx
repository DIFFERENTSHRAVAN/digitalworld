import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AdminUser,
  Product,
  Category,
  Order,
  OrderStatus,
  PaymentStatus,
  StoreSettings,
  DealerUser,
  DealerStatus
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
  changeAdminPassword,
  requestAdminPasswordResetOtp,
  verifyOtpAndChangeAdminPassword,
  updateAdminEmailOrPhone,
  getAdminContactDetails,
  getDealersAdmin,
  updateDealerStatusAdmin,
  createDealerAdmin,
  resetDealerPasswordAdmin,
  generateDealerApprovalWhatsAppUrl,
  getAllCategoriesAdmin,
  addCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  addSubcategoryAdmin,
  removeSubcategoryAdmin,
  updateSubcategoriesAdmin,
  getPopularBrands,
  updatePopularBrandsAdmin
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
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Phone,
  Briefcase,
  UserCheck,
  UserX,
  Building2,
  Tag,
  TrendingDown,
  Shapes,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  FolderPlus
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, refreshSettings } = useStoreSettings();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'laptops' | 'orders' | 'dealers' | 'categories' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  // Core Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dealers, setDealers] = useState<DealerUser[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [newBrandInput, setNewBrandInput] = useState('');

  // Category & Sub-category Management State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    slug: string;
    description: string;
    icon: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
  }>({
    name: '',
    slug: '',
    description: '',
    icon: 'Monitor',
    image_url: '',
    display_order: 1,
    is_active: true
  });
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<{ [id: string]: boolean }>({});
  const [newSubcategoryInputs, setNewSubcategoryInputs] = useState<{ [id: string]: string }>({});
  const [productModalCategoryId, setProductModalCategoryId] = useState<string>('');

  // Dealer Management State
  const [dealerFilterStatus, setDealerFilterStatus] = useState<string>('all');
  const [dealerSearch, setDealerSearch] = useState('');
  const [dealerSubView, setDealerSubView] = useState<'dealers' | 'wholesale_pricing' | 'dealer_orders'>('dealers');
  const [newDealerModalOpen, setNewDealerModalOpen] = useState(false);
  const [resetPasswordDealer, setResetPasswordDealer] = useState<DealerUser | null>(null);
  const [resetNewPasswordInput, setResetNewPasswordInput] = useState('');
  const [newDealerForm, setNewDealerForm] = useState({
    business_name: '',
    contact_person: '',
    phone: '',
    email: '',
    gst_number: '',
    business_type: 'Computer Hardware Retailer',
    address: '',
    city: '',
    state: 'Rajasthan',
    pincode: '',
    password: 'dealer123',
    dealer_code: ''
  });

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

  // Admin Password Management & OTP state
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [adminOtp, setAdminOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Admin Contact/Login Identifiers update state
  const [adminLoginEmail, setAdminLoginEmail] = useState(() => getAdminContactDetails().email);
  const [adminLoginPhone, setAdminLoginPhone] = useState(() => getAdminContactDetails().phone);
  const [credOtp, setCredOtp] = useState('');
  const [credOtpSent, setCredOtpSent] = useState(false);
  const [credOtpSending, setCredOtpSending] = useState(false);
  const [credNotice, setCredNotice] = useState<string | null>(null);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    if (productModalOpen) {
      setProductModalCategoryId(editingProduct?.category_id || categories[0]?.id || '');
    }
  }, [productModalOpen, editingProduct, categories]);

  const handleRequestCredOtp = async () => {
    setCredError(null);
    setCredSuccess(null);
    if (!adminLoginEmail || !adminLoginEmail.includes('@')) {
      setCredError('Please enter a valid email address.');
      return;
    }
    const cleanP = adminLoginPhone.replace(/\D/g, '').slice(-10);
    if (cleanP.length !== 10) {
      setCredError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setCredOtpSending(true);
    try {
      const res = await requestAdminPasswordResetOtp(adminLoginEmail);
      setCredOtpSent(true);
      setCredNotice(res.message);
      if (res.demoOtpNotice) {
        showToast(`Security OTP: ${res.demoOtpNotice}`);
      }
    } catch (err: unknown) {
      setCredError((err as Error).message || 'Failed to send OTP.');
    } finally {
      setCredOtpSending(false);
    }
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);
    if (!credOtp || credOtp.length !== 6) {
      setCredError('Please enter the 6-digit OTP code.');
      return;
    }
    try {
      const res = updateAdminEmailOrPhone({
        email: adminLoginEmail,
        phone: adminLoginPhone,
        otp: credOtp
      });
      setCredSuccess(res.message);
      setCredOtpSent(false);
      setCredOtp('');
      showToast('Admin login email & mobile updated successfully!');
    } catch (err: unknown) {
      setCredError((err as Error).message || 'Failed to update credentials.');
    }
  };

  const handleRequestOtp = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentAdminPassword) {
      setPasswordError('Please enter your current (last) password.');
      return;
    }
    if (!newAdminPassword || newAdminPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    if (currentAdminPassword === newAdminPassword) {
      setPasswordError('New password cannot be the same as your current password.');
      return;
    }

    setOtpSending(true);
    try {
      const res = await requestAdminPasswordResetOtp(settingsForm.email_address);
      setOtpSent(true);
      setOtpNotice(res.message);
      if (res.demoOtpNotice) {
        showToast(`Verification OTP sent: ${res.demoOtpNotice}`);
      } else {
        showToast('OTP sent to your email!');
      }
    } catch (err: unknown) {
      setPasswordError((err as Error).message || 'Failed to send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtpAndUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!adminOtp || adminOtp.trim().length !== 6) {
      setPasswordError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    try {
      const res = verifyOtpAndChangeAdminPassword({
        currentPassword: currentAdminPassword,
        newPassword: newAdminPassword,
        otp: adminOtp
      });
      setPasswordSuccess(res.message);
      setCurrentAdminPassword('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setAdminOtp('');
      setOtpSent(false);
      setOtpNotice(null);
      showToast('Password updated successfully!');
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

      const [prods, cats, ords, dlrs, brnds] = await Promise.all([
        getAllProductsAdmin(),
        getAllCategoriesAdmin(),
        getAllOrdersAdmin(),
        getDealersAdmin(),
        getPopularBrands()
      ]);

      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setDealers(dlrs);
      setBrands(brnds);
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

  // ==================== CATEGORY & BRAND HANDLERS ====================
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      icon: 'Monitor',
      image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&auto=format&fit=crop&q=80',
      display_order: categories.length + 1,
      is_active: true
    });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'Monitor',
      image_url: cat.image_url || '',
      display_order: cat.display_order,
      is_active: cat.is_active
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      if (editingCategory) {
        const updated = await updateCategoryAdmin(editingCategory.id, categoryForm);
        setCategories(categories.map(c => c.id === updated.id ? updated : c));
        showToast(`Category "${updated.name}" updated successfully!`);
      } else {
        const added = await addCategoryAdmin(categoryForm);
        setCategories([...categories, added]);
        showToast(`New category "${added.name}" added successfully!`);
      }
      setCategoryModalOpen(false);
    } catch (err: unknown) {
      alert('Failed to save category: ' + (err as Error).message);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (window.confirm(`Are you sure you want to delete category "${cat.name}"? Products in this category may become unassigned.`)) {
      try {
        await deleteCategoryAdmin(cat.id);
        setCategories(categories.filter(c => c.id !== cat.id));
        showToast(`Category "${cat.name}" removed from catalog.`);
      } catch (err: unknown) {
        alert('Failed to delete category: ' + (err as Error).message);
      }
    }
  };

  const handleToggleCategoryActive = async (cat: Category) => {
    try {
      const updated = await updateCategoryAdmin(cat.id, { is_active: !cat.is_active });
      setCategories(categories.map(c => c.id === updated.id ? updated : c));
      showToast(`Category "${cat.name}" is now ${updated.is_active ? 'ACTIVE' : 'INACTIVE'}`);
    } catch (err: unknown) {
      alert('Failed to toggle status: ' + (err as Error).message);
    }
  };

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategoryIds(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddSubcategory = async (categoryId: string) => {
    const subName = newSubcategoryInputs[categoryId]?.trim();
    if (!subName) return;

    try {
      const updated = await addSubcategoryAdmin(categoryId, subName);
      setCategories(categories.map(c => c.id === updated.id ? updated : c));
      setNewSubcategoryInputs(prev => ({ ...prev, [categoryId]: '' }));
      showToast(`Sub-category "${subName}" added!`);
    } catch (err: unknown) {
      alert('Failed to add sub-category: ' + (err as Error).message);
    }
  };

  const handleRemoveSubcategory = async (categoryId: string, subName: string) => {
    try {
      const updated = await removeSubcategoryAdmin(categoryId, subName);
      setCategories(categories.map(c => c.id === updated.id ? updated : c));
      showToast(`Sub-category "${subName}" removed.`);
    } catch (err: unknown) {
      alert('Failed to remove sub-category: ' + (err as Error).message);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBrandInput.trim();
    if (!trimmed) return;
    if (brands.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Brand "${trimmed}" already exists in the list.`);
      return;
    }
    const updated = [...brands, trimmed];
    setBrands(updated);
    await updatePopularBrandsAdmin(updated);
    setNewBrandInput('');
    showToast(`Brand "${trimmed}" added to Shop by Brand filter!`);
  };

  const handleRemoveBrand = async (brandName: string) => {
    const updated = brands.filter(b => b !== brandName);
    setBrands(updated);
    await updatePopularBrandsAdmin(updated);
    showToast(`Brand "${brandName}" removed.`);
  };

  // Dealer Action Handlers
  const handleApproveDealer = async (dealerId: string) => {
    try {
      const updated = await updateDealerStatusAdmin(dealerId, 'approved');
      setDealers(dealers.map(d => d.id === dealerId ? updated : d));
      showToast(`Dealer ${updated.dealer_code} (${updated.business_name}) APPROVED!`);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleRejectDealer = async (dealerId: string) => {
    if (window.confirm('Are you sure you want to decline this dealer application?')) {
      try {
        const updated = await updateDealerStatusAdmin(dealerId, 'rejected');
        setDealers(dealers.map(d => d.id === dealerId ? updated : d));
        showToast(`Dealer ${updated.dealer_code} marked as rejected.`);
      } catch (err: unknown) {
        alert((err as Error).message);
      }
    }
  };

  const handleSuspendDealer = async (dealerId: string) => {
    if (window.confirm('Suspend this dealer account? They will lose access to wholesale rates.')) {
      try {
        const updated = await updateDealerStatusAdmin(dealerId, 'suspended');
        setDealers(dealers.map(d => d.id === dealerId ? updated : d));
        showToast(`Dealer ${updated.dealer_code} suspended.`);
      } catch (err: unknown) {
        alert((err as Error).message);
      }
    }
  };

  const handleReactivateDealer = async (dealerId: string) => {
    try {
      const updated = await updateDealerStatusAdmin(dealerId, 'approved');
      setDealers(dealers.map(d => d.id === dealerId ? updated : d));
      showToast(`Dealer ${updated.dealer_code} reactivated!`);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleResetDealerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordDealer) return;
    try {
      const res = await resetDealerPasswordAdmin(resetPasswordDealer.id, resetNewPasswordInput);
      showToast(res.message);
      setResetPasswordDealer(null);
      setResetNewPasswordInput('');
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleCreateDealerAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createDealerAdmin(newDealerForm);
      setDealers([created, ...dealers]);
      setNewDealerModalOpen(false);
      setNewDealerForm({
        business_name: '',
        contact_person: '',
        phone: '',
        email: '',
        gst_number: '',
        business_type: 'Computer Hardware Retailer',
        address: '',
        city: '',
        state: 'Rajasthan',
        pincode: '',
        password: 'dealer123',
        dealer_code: ''
      });
      showToast(`Dealer ${created.dealer_code} created successfully!`);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
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

    const totalRevenue = orders
      .filter(o => o.order_status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const lowStockProducts = products.filter(p => p.stock_quantity <= 3 || p.is_sold_out);
    const usedLaptopsCount = products.filter(p => p.condition === 'second_hand').length;

    const pendingDealersCount = dealers.filter(d => d.status === 'pending').length;
    const approvedDealersCount = dealers.filter(d => d.status === 'approved').length;
    const dealerOrdersCount = orders.filter(o => o.order_type === 'dealer').length;

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
      usedLaptopsCount,
      pendingDealersCount,
      approvedDealersCount,
      dealerOrdersCount
    };
  }, [orders, products, dealers]);

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
            onClick={() => setActiveTab('dealers')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 relative ${
              activeTab === 'dealers'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Dealers & B2B Portal</span>
            {metrics.pendingDealersCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                {metrics.pendingDealersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'categories'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Shapes className="w-4 h-4" />
            <span>Categories & Sub-Parts ({categories.length})</span>
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

                    <div className="space-y-3">
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
                      <div>
                        <label className="block font-bold text-charcoal mb-1">Google Maps Directions URL</label>
                        <input
                          type="url"
                          value={settingsForm.google_maps_url || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, google_maps_url: e.target.value })}
                          placeholder="https://maps.google.com/..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Official Bank Account Details (Images 3 & 4) */}
                  <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-700" />
                      <div>
                        <h4 className="font-extrabold text-sm text-amber-950">
                          Official Store Bank Details (Visible in Footer & Contact Us)
                        </h4>
                        <p className="text-[11px] text-amber-800">
                          Used for customer direct bank transfers (NEFT / IMPS / RTGS). Copy buttons will copy these exact values.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-amber-950 mb-1 text-xs">Bank Name *</label>
                        <input
                          type="text"
                          value={settingsForm.bank_name || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bank_name: e.target.value })}
                          placeholder="INDIAN BANK"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-amber-950 mb-1 text-xs">Account Holder Name *</label>
                        <input
                          type="text"
                          value={settingsForm.bank_account_name || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bank_account_name: e.target.value })}
                          placeholder="Digital World"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-amber-950 mb-1 text-xs">Account Number *</label>
                        <input
                          type="text"
                          value={settingsForm.bank_account_number || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bank_account_number: e.target.value })}
                          placeholder="8062314869"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-amber-950 mb-1 text-xs">IFSC Code *</label>
                        <input
                          type="text"
                          value={settingsForm.bank_ifsc || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bank_ifsc: e.target.value.toUpperCase() })}
                          placeholder="IDIB000S761"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-mono font-bold uppercase"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-amber-950 mb-1 text-xs">Branch Name</label>
                        <input
                          type="text"
                          value={settingsForm.bank_branch || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bank_branch: e.target.value })}
                          placeholder="Sri Ganganagar"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-amber-950 mb-1 text-xs">Bank Transfer Instructions for Customers</label>
                      <input
                        type="text"
                        value={settingsForm.bank_payment_instructions || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bank_payment_instructions: e.target.value })}
                        placeholder="For IMPS/NEFT transfer: Please share payment confirmation screenshot on WhatsApp..."
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs"
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

                {/* Promotional Banners & Festive Offers (Navratri 9-Day, Mega Sales, Announcement Bar) */}
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <div>
                      <h3 className="font-bold text-sm text-primary">
                        Promotional Banners, Ticker & Festive Offers
                      </h3>
                      <p className="text-[11px] text-charcoal-muted">
                        Customize the top announcement bar and festive promotional slides on the homepage.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal mb-1">
                      Top Announcement Bar Ticker (Visible across entire website)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.announcement_ticker || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcement_ticker: e.target.value })}
                      placeholder="e.g. ⚡ Free Delivery on orders above ₹1,999 | Best Second-Hand Laptops with 1-Year Testing Warranty!"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary text-xs"
                    />
                  </div>

                  <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                      <input
                        type="checkbox"
                        checked={settingsForm.banner_navratri_active !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, banner_navratri_active: e.target.checked })}
                        className="rounded text-amber-600 w-4 h-4"
                      />
                      <span>Show Navratri 9 Days Festive Offer Banner & Sale Section</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-amber-900 mb-1 text-xs">Festive Badge Text</label>
                        <input
                          type="text"
                          value={settingsForm.banner_navratri_badge || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, banner_navratri_badge: e.target.value })}
                          placeholder="🪔 NAVRATRI 9 DAYS FESTIVE OFFER | नवरात्री महाबचत 🪔"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-amber-900 mb-1 text-xs">Discount / Price Tag</label>
                        <input
                          type="text"
                          value={settingsForm.banner_navratri_discount || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, banner_navratri_discount: e.target.value })}
                          placeholder="Starts ₹399 / Up to 45% OFF"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-amber-900 mb-1 text-xs">Banner Headline Title</label>
                        <input
                          type="text"
                          value={settingsForm.banner_navratri_title || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, banner_navratri_title: e.target.value })}
                          placeholder="Navratri 9 Days Festive Dhamaka: Up to 45% OFF"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-amber-900 mb-1 text-xs">Banner Target URL</label>
                        <input
                          type="text"
                          value={settingsForm.banner_navratri_link || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, banner_navratri_link: e.target.value })}
                          placeholder="/products or /category/second-hand-laptops"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-amber-900 mb-1 text-xs">Banner Subtitle / Description</label>
                      <input
                        type="text"
                        value={settingsForm.banner_navratri_subtitle || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, banner_navratri_subtitle: e.target.value })}
                        placeholder="Celebrate 9 auspicious days of Navratri with heavy price cuts on certified second-hand laptops..."
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs"
                      />
                    </div>
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

            {/* Owner Email & Mobile Login Identifiers Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
                    <Phone className="w-5 h-5 text-secondary" />
                    <span>Admin Login Identifiers (Email & Mobile Number)</span>
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    You can log in to the admin portal using either your Email OR your 10-digit mobile number.
                  </p>
                </div>
              </div>

              {credSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{credSuccess}</span>
                </div>
              )}

              {credError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{credError}</span>
                </div>
              )}

              {credNotice && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Security Verification OTP</p>
                    <p className="text-blue-800 mt-0.5">{credNotice}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-charcoal mb-1">
                      Admin Login Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={adminLoginEmail}
                        onChange={(e) => setAdminLoginEmail(e.target.value)}
                        disabled={credOtpSent}
                        placeholder="admin@digitalworld.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary disabled:opacity-60"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal mb-1">
                      Admin Login Mobile Number (10 Digits)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-charcoal-muted text-xs">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={adminLoginPhone}
                        onChange={(e) => setAdminLoginPhone(e.target.value.replace(/\D/g, ''))}
                        disabled={credOtpSent}
                        placeholder="6377123270"
                        className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                {!credOtpSent ? (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleRequestCredOtp}
                      disabled={credOtpSending}
                      className="px-6 py-2.5 bg-secondary hover:bg-secondary-dark text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-60"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{credOtpSending ? 'Sending OTP Code...' : 'Verify & Update Email / Mobile via OTP'}</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateCredentials} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                      <div className="flex-1">
                        <label className="block font-bold text-charcoal mb-1">
                          Enter 6-Digit OTP sent to {adminLoginEmail}
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={credOtp}
                          onChange={(e) => setCredOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-base tracking-widest font-mono text-center font-bold focus:border-secondary"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Credentials Update</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-charcoal-muted pt-1">
                      <button
                        type="button"
                        onClick={handleRequestCredOtp}
                        disabled={credOtpSending}
                        className="text-secondary font-semibold hover:underline"
                      >
                        Resend OTP code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCredOtpSent(false);
                          setCredNotice(null);
                          setCredOtp('');
                        }}
                        className="text-slate-400 hover:text-charcoal"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Owner Password & Security Card with Current Password & OTP */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Admin Portal Security & Password Change</span>
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Requires your last/current password and a 6-digit verification OTP sent to your registered email.
                  </p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{passwordError}</span>
                </div>
              )}

              {otpNotice && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Email OTP Notification</p>
                    <p className="text-blue-800 mt-0.5">{otpNotice}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Step 1: Passwords inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-charcoal mb-1 text-xs">
                      Current (Last) Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={currentAdminPassword}
                        onChange={(e) => setCurrentAdminPassword(e.target.value)}
                        placeholder="Enter current password"
                        disabled={otpSent}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted text-xs focus:bg-white focus:border-secondary disabled:opacity-60"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal mb-1 text-xs">
                      New Password (Min 6 chars) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={otpSent}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted text-xs focus:bg-white focus:border-secondary disabled:opacity-60"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal mb-1 text-xs">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmAdminPassword}
                        onChange={(e) => setConfirmAdminPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        disabled={otpSent}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-surface-muted text-xs focus:bg-white focus:border-secondary disabled:opacity-60"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                {/* Step 2: Request OTP or Enter OTP */}
                {!otpSent ? (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={otpSending}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-60"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{otpSending ? 'Sending Security OTP...' : 'Send Security OTP to Email'}</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtpAndUpdatePassword} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                      <div className="flex-1">
                        <label className="block font-bold text-charcoal mb-1 text-xs">
                          Enter 6-Digit Email OTP Code <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={adminOtp}
                          onChange={(e) => setAdminOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 123456"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-base tracking-widest font-mono text-center font-bold focus:border-secondary"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify OTP & Update Password</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-charcoal-muted pt-1">
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={otpSending}
                        className="text-secondary font-semibold hover:underline"
                      >
                        Resend OTP code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpNotice(null);
                          setAdminOtp('');
                        }}
                        className="text-slate-400 hover:text-charcoal"
                      >
                        Cancel & Edit Passwords
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: DEALERS & B2B PORTAL ===================== */}
        {activeTab === 'dealers' && (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Dealer Header & Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-charcoal-muted">Total Dealers</span>
                <p className="text-2xl font-extrabold text-primary">{dealers.length}</p>
                <span className="text-[10px] text-slate-500">Registered B2B partners</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-amber-800">Pending Approvals</span>
                <p className="text-2xl font-extrabold text-amber-700">{metrics.pendingDealersCount}</p>
                <span className="text-[10px] text-amber-800">Requires verification</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-emerald-800">Active Approved</span>
                <p className="text-2xl font-extrabold text-emerald-700">{metrics.approvedDealersCount}</p>
                <span className="text-[10px] text-emerald-700">Can view wholesale rates</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-blue-800">Wholesale Orders</span>
                <p className="text-2xl font-extrabold text-secondary">{metrics.dealerOrdersCount}</p>
                <span className="text-[10px] text-blue-700">Total B2B shipments</span>
              </div>
            </div>

            {/* Sub-view switcher bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setDealerSubView('dealers')}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    dealerSubView === 'dealers'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Dealer Accounts ({dealers.length})</span>
                </button>

                <button
                  onClick={() => setDealerSubView('wholesale_pricing')}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    dealerSubView === 'wholesale_pricing'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Wholesale Pricing & Lots ({products.length})</span>
                </button>

                <button
                  onClick={() => setDealerSubView('dealer_orders')}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    dealerSubView === 'dealer_orders'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Dealer Orders ({orders.filter(o => o.order_type === 'dealer').length})</span>
                </button>
              </div>

              {dealerSubView === 'dealers' && (
                <button
                  onClick={() => setNewDealerModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dealer</span>
                </button>
              )}

              {dealerSubView === 'wholesale_pricing' && (
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Wholesale Lot / Product</span>
                </button>
              )}
            </div>

            {/* SUB-VIEW 1: DEALER ACCOUNTS TABLE */}
            {dealerSubView === 'dealers' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden space-y-4 p-5">
                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-slate-100">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={dealerSearch}
                      onChange={(e) => setDealerSearch(e.target.value)}
                      placeholder="Search dealer code, name, phone, city..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-secondary"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
                    {['all', 'pending', 'approved', 'suspended', 'rejected'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setDealerFilterStatus(st)}
                        className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                          dealerFilterStatus === st
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                        {st === 'pending' && metrics.pendingDealersCount > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                            {metrics.pendingDealersCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dealers Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-charcoal-muted uppercase text-[10px] tracking-wider font-extrabold">
                      <tr>
                        <th className="py-3 px-3">Dealer Code</th>
                        <th className="py-3 px-3">Business & Owner</th>
                        <th className="py-3 px-3">Contact (Phone / Email)</th>
                        <th className="py-3 px-3">GSTIN & Location</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dealers
                        .filter(d => {
                          if (dealerFilterStatus !== 'all' && d.status !== dealerFilterStatus) return false;
                          if (dealerSearch.trim()) {
                            const q = dealerSearch.toLowerCase();
                            return (
                              d.dealer_code.toLowerCase().includes(q) ||
                              d.business_name.toLowerCase().includes(q) ||
                              d.contact_person.toLowerCase().includes(q) ||
                              d.phone.includes(q) ||
                              d.city.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((dlr) => {
                          const statusBadges: Record<DealerStatus, string> = {
                            pending: 'bg-amber-100 text-amber-800 border-amber-300',
                            approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                            suspended: 'bg-rose-100 text-rose-800 border-rose-300',
                            rejected: 'bg-slate-100 text-slate-700 border-slate-300'
                          };

                          return (
                            <tr key={dlr.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-3 font-mono font-bold text-primary">
                                {dlr.dealer_code}
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="font-bold text-charcoal">{dlr.business_name}</div>
                                <div className="text-slate-500 text-[11px]">{dlr.contact_person} • {dlr.business_type}</div>
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="font-semibold text-slate-900">+91 {dlr.phone}</div>
                                <div className="text-slate-400 text-[11px]">{dlr.email}</div>
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="font-mono text-slate-800">{dlr.gst_number || 'No GST (Retailer)'}</div>
                                <div className="text-slate-500 text-[11px]">{dlr.city}, {dlr.state} ({dlr.pincode})</div>
                              </td>

                              <td className="py-3.5 px-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadges[dlr.status]}`}>
                                  {dlr.status}
                                </span>
                              </td>

                              <td className="py-3.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {dlr.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveDealer(dlr.id)}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                                        title="Approve Dealer Account"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Approve</span>
                                      </button>
                                      <button
                                        onClick={() => handleRejectDealer(dlr.id)}
                                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold cursor-pointer"
                                        title="Decline Application"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  {dlr.status === 'approved' && (
                                    <>
                                      <a
                                        href={generateDealerApprovalWhatsAppUrl(dlr)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg cursor-pointer"
                                        title="Send Approval WhatsApp Message"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                      </a>

                                      <button
                                        onClick={() => {
                                          setResetPasswordDealer(dlr);
                                          setResetNewPasswordInput('');
                                        }}
                                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-secondary border border-blue-200 rounded-lg cursor-pointer"
                                        title="Reset Password"
                                      >
                                        <KeyRound className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => handleSuspendDealer(dlr.id)}
                                        className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                                        title="Suspend Access"
                                      >
                                        Suspend
                                      </button>
                                    </>
                                  )}

                                  {dlr.status === 'suspended' && (
                                    <button
                                      onClick={() => handleReactivateDealer(dlr.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                                    >
                                      Reactivate
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: WHOLESALE PRICING & LOTS */}
            {dealerSubView === 'wholesale_pricing' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-primary">Wholesale Pricing Catalog</h3>
                    <p className="text-xs text-slate-500">
                      Manage wholesale rates, margins, minimum bulk quantities, and dealer-exclusive lots
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-charcoal-muted uppercase text-[10px] tracking-wider font-extrabold">
                      <tr>
                        <th className="py-3 px-3">Product Name</th>
                        <th className="py-3 px-3">Condition</th>
                        <th className="py-3 px-3">Retail Price</th>
                        <th className="py-3 px-3">Wholesale Price</th>
                        <th className="py-3 px-3">Dealer Margin</th>
                        <th className="py-3 px-3">Min Order Qty</th>
                        <th className="py-3 px-3">Channel Access</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => {
                        const wholesalePrice = p.dealer_price || Math.round(p.price * 0.85);
                        const savings = p.price - wholesalePrice;
                        const marginPct = p.price > 0 ? Math.round((savings / p.price) * 100) : 0;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-semibold text-charcoal max-w-xs truncate">
                              {p.name}
                            </td>
                            <td className="py-3 px-3">
                              <span className="capitalize">{p.condition === 'second_hand' ? 'Refurbished' : 'New'}</span>
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-600">
                              {formatINR(p.price)}
                            </td>
                            <td className="py-3 px-3 font-black text-emerald-700">
                              {formatINR(wholesalePrice)}
                            </td>
                            <td className="py-3 px-3 text-emerald-600 font-bold">
                              +{formatINR(savings)} ({marginPct}%)
                            </td>
                            <td className="py-3 px-3 font-bold text-primary">
                              {p.min_dealer_qty || 1} units
                            </td>
                            <td className="py-3 px-3">
                              {p.is_dealer_only ? (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold">
                                  Dealer Exclusive
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                                  Public + Wholesale
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setProductModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold rounded-lg text-[11px] cursor-pointer"
                              >
                                Edit Rates
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: DEALER WHOLESALE ORDERS */}
            {dealerSubView === 'dealer_orders' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-primary">B2B Dealer Wholesale Orders</h3>
                    <p className="text-xs text-slate-500">
                      Wholesale order tracking, fulfillment status, and WhatsApp dispatch notifications
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-charcoal-muted uppercase text-[10px] tracking-wider font-extrabold">
                      <tr>
                        <th className="py-3 px-3">Order Number</th>
                        <th className="py-3 px-3">Dealer / Firm</th>
                        <th className="py-3 px-3">Items Summary</th>
                        <th className="py-3 px-3">Wholesale Total</th>
                        <th className="py-3 px-3">Payment</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders
                        .filter(o => o.order_type === 'dealer')
                        .map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-primary">
                              {o.order_number}
                            </td>

                            <td className="py-3 px-3">
                              <div className="font-bold text-charcoal">{o.customer_name}</div>
                              <div className="text-[11px] text-slate-500">{o.dealer_code} • {o.city}</div>
                            </td>

                            <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                              {(o.items || []).map(i => `${i.product_name} (x${i.quantity})`).join(', ')}
                            </td>

                            <td className="py-3 px-3 font-black text-emerald-800">
                              {formatINR(o.total_amount)}
                            </td>

                            <td className="py-3 px-3">
                              <span className="capitalize">{o.payment_method}</span> ({o.payment_status})
                            </td>

                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                                {o.order_status}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <select
                                value={o.order_status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                                className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 6: CATEGORIES & SUB-PARTS ===================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Header with Add Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
              <div>
                <div className="flex items-center gap-2">
                  <Shapes className="w-6 h-6 text-secondary" />
                  <h2 className="text-xl font-black text-primary">Category & Sub-Parts Architecture</h2>
                </div>
                <p className="text-xs text-charcoal-muted mt-1">
                  Manage website navigation categories, icons, display order, and sub-parts displayed on the desktop hover ribbon and mobile menus.
                </p>
              </div>

              <button
                onClick={handleOpenAddCategory}
                className="px-5 py-2.5 bg-secondary hover:bg-secondary-dark text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-charcoal-muted uppercase">Total Categories</span>
                <p className="text-2xl font-black text-primary mt-0.5">{categories.length}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-charcoal-muted uppercase">Total Sub-Parts</span>
                <p className="text-2xl font-black text-secondary mt-0.5">
                  {categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-charcoal-muted uppercase">Active in Store</span>
                <p className="text-2xl font-black text-emerald-600 mt-0.5">
                  {categories.filter(c => c.is_active).length}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-charcoal-muted uppercase">OEM Brands</span>
                <p className="text-2xl font-black text-blue-600 mt-0.5">{brands.length}</p>
              </div>
            </div>

            {/* OEM Brands Quick Management Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-primary flex items-center gap-2">
                    <Tag className="w-4 h-4 text-secondary" />
                    <span>OEM Brands & Manufacturers (Desktop Ribbon & Filters)</span>
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Brands shown in the desktop navigation "Shop By Brand" dropdown and brand search filters.
                  </p>
                </div>
              </div>

              {/* Brand Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {brands.map(brand => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-charcoal border border-slate-200 hover:border-slate-300"
                  >
                    <span>{brand}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBrand(brand)}
                      title={`Remove brand ${brand}`}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add New Brand Form */}
              <form onSubmit={handleAddBrand} className="flex items-center gap-2 pt-2 max-w-md">
                <input
                  type="text"
                  value={newBrandInput}
                  onChange={(e) => setNewBrandInput(e.target.value)}
                  placeholder="Enter brand name (e.g. Acer, Zebronics, Logitech...)"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-secondary focus:bg-white bg-surface-muted"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Brand</span>
                </button>
              </form>
            </div>

            {/* Categories & Subcategories List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-primary">All Store Categories ({categories.length})</h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Click "Manage Subcategories" on any category to view, add, or remove sub-parts.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {categories
                  .slice()
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((cat) => {
                    const isExpanded = !!expandedCategoryIds[cat.id];
                    const subList = cat.subcategories || [];

                    return (
                      <div key={cat.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                        {/* Main Category Row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              #{cat.display_order}
                            </span>

                            {cat.image_url ? (
                              <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 font-bold">
                                <Shapes className="w-5 h-5" />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-sm text-primary">{cat.name}</h4>
                                <button
                                  type="button"
                                  onClick={() => handleToggleCategoryActive(cat)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                    cat.is_active
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                  }`}
                                >
                                  {cat.is_active ? 'ACTIVE' : 'HIDDEN'}
                                </button>
                              </div>
                              <p className="text-[11px] text-charcoal-muted font-mono mt-0.5">
                                slug: /category/{cat.slug} | icon: {cat.icon || 'Monitor'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleCategoryExpand(cat.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                                isExpanded
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : 'bg-white border-slate-200 text-charcoal hover:bg-slate-100'
                              }`}
                            >
                              <Layers className="w-3.5 h-3.5 text-secondary" />
                              <span>Sub-Parts ({subList.length})</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-2 rounded-xl text-slate-500 hover:text-secondary hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Subcategories Management Panel */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-200/80 bg-slate-50/80 p-4 rounded-2xl space-y-3 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-primary flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-secondary" />
                                <span>Sub-Categories / Sub-Parts under "{cat.name}"</span>
                              </span>
                              <span className="text-[11px] text-charcoal-muted">
                                {subList.length} sub-part{subList.length !== 1 ? 's' : ''} configured
                              </span>
                            </div>

                            {/* Subcategories Chip List */}
                            {subList.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {subList.map((sub) => (
                                  <span
                                    key={sub}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-charcoal border border-slate-200 shadow-2xs"
                                  >
                                    <span>{sub}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSubcategory(cat.id, sub)}
                                      title={`Remove ${sub}`}
                                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">
                                No subcategories added yet. Add one below to show on the storefront hover menu!
                              </p>
                            )}

                            {/* Add Subcategory Form for this category */}
                            <div className="flex items-center gap-2 pt-1 max-w-md">
                              <input
                                type="text"
                                value={newSubcategoryInputs[cat.id] || ''}
                                onChange={(e) =>
                                  setNewSubcategoryInputs(prev => ({
                                    ...prev,
                                    [cat.id]: e.target.value
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSubcategory(cat.id);
                                  }
                                }}
                                placeholder={`Add sub-part for ${cat.name}...`}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:border-secondary"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddSubcategory(cat.id)}
                                className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-dark text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Sub-Part</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
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
                  subcategory: (formData.get('subcategory') as string) || undefined,
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
                  // Product ID and Item Code (Image 4 & 5)
                  pid: (formData.get('pid') as string) || undefined,
                  item_code: (formData.get('item_code') as string) || undefined,
                  is_updated_product: formData.get('is_updated_product') === 'on',
                  is_new_arrival: formData.get('is_new_arrival') === 'on',
                  is_trending: formData.get('is_trending') === 'on',
                  // Laptop specific fields
                  processor: (formData.get('processor') as string) || undefined,
                  ram: (formData.get('ram') as string) || undefined,
                  storage_type_capacity: (formData.get('storage_type_capacity') as string) || undefined,
                  screen_size: (formData.get('screen_size') as string) || undefined,
                  battery_health: (formData.get('battery_health') as string) || undefined,
                  physical_condition_grade: (formData.get('physical_condition_grade') as string) || undefined,
                  known_defects: (formData.get('known_defects') as string) || undefined,
                  included_accessories: (formData.get('included_accessories') as string) || undefined,
                  // Dealer B2B Wholesale Exclusive Fields
                  dealer_price: formData.get('dealer_price') ? parseFloat(formData.get('dealer_price') as string) : undefined,
                  is_dealer_only: formData.get('is_dealer_only') === 'on',
                  min_dealer_qty: formData.get('min_dealer_qty') ? parseInt(formData.get('min_dealer_qty') as string, 10) : 1
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
                    value={productModalCategoryId || editingProduct?.category_id || categories[0]?.id}
                    onChange={(e) => setProductModalCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-Category Selection */}
              <div>
                <label className="block font-bold text-charcoal mb-1">Sub-Category / Sub-Part</label>
                <select
                  name="subcategory"
                  defaultValue={editingProduct?.subcategory || ''}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">-- General / No Subcategory --</option>
                  {(categories.find(c => c.id === (productModalCategoryId || editingProduct?.category_id || categories[0]?.id))?.subcategories || []).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="text-[10px] text-charcoal-muted">
                  Sub-categories are dynamically managed in the "Categories & Sub-Parts" tab.
                </span>
              </div>

              {/* Product ID and Item Code (Image 4 & 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-200/80">
                <div>
                  <label className="block font-bold text-amber-900 mb-1">Product ID / PID (Optional)</label>
                  <input
                    type="text"
                    name="pid"
                    defaultValue={editingProduct?.pid || ''}
                    placeholder="e.g. A1988, B4021"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-mono font-bold"
                  />
                  <span className="text-[10px] text-amber-700">Displayed on product card as PID badge</span>
                </div>

                <div>
                  <label className="block font-bold text-amber-900 mb-1">Item Code / Item CD (Optional)</label>
                  <input
                    type="text"
                    name="item_code"
                    defaultValue={editingProduct?.item_code || ''}
                    placeholder="e.g. 1AM9EKG, 16H0VCE"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-mono font-bold"
                  />
                  <span className="text-[10px] text-amber-700">Used for inventory tracking & WhatsApp order lookups</span>
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

              {/* B2B Wholesale Pricing & Dealer Access */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-extrabold text-primary flex items-center gap-1.5 text-xs">
                    <Briefcase className="w-3.5 h-3.5 text-secondary" />
                    <span>B2B Wholesale / Dealer Pricing Configuration</span>
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-primary text-xs">
                    <input
                      type="checkbox"
                      name="is_dealer_only"
                      defaultChecked={editingProduct?.is_dealer_only || false}
                      className="rounded text-secondary w-4 h-4"
                    />
                    <span>Dealer-Only Product (Hidden from regular retail customers)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-charcoal mb-1">
                      Dealer Wholesale Price (₹)
                    </label>
                    <input
                      type="number"
                      name="dealer_price"
                      defaultValue={editingProduct?.dealer_price || ''}
                      placeholder="e.g. 18500 (lower than retail price)"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-blue-300 font-bold text-emerald-800"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Only visible to authenticated and approved dealers.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal mb-1">
                      Min Dealer Order Quantity
                    </label>
                    <input
                      type="number"
                      name="min_dealer_qty"
                      min={1}
                      defaultValue={editingProduct?.min_dealer_qty || 1}
                      placeholder="1"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-blue-300 font-semibold"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Minimum order units required for wholesale orders.
                    </p>
                  </div>
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <input
                    type="checkbox"
                    name="is_featured"
                    defaultChecked={editingProduct?.is_featured}
                    className="rounded text-secondary"
                  />
                  <span>Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <input
                    type="checkbox"
                    name="is_special_offer"
                    defaultChecked={editingProduct?.is_special_offer}
                    className="rounded text-secondary"
                  />
                  <span>Special Offer</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold p-2.5 rounded-xl border border-amber-200 bg-amber-50/60">
                  <input
                    type="checkbox"
                    name="is_updated_product"
                    defaultChecked={editingProduct?.is_updated_product}
                    className="rounded text-amber-600"
                  />
                  <span className="font-bold text-amber-900">Updated Product (Image 4/5)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
                  <input
                    type="checkbox"
                    name="is_new_arrival"
                    defaultChecked={editingProduct?.is_new_arrival}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-bold text-emerald-900">New Arrival (Image 4/5)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold p-2.5 rounded-xl border border-rose-200 bg-rose-50/60">
                  <input
                    type="checkbox"
                    name="is_trending"
                    defaultChecked={editingProduct?.is_trending}
                    className="rounded text-rose-600"
                  />
                  <span className="font-bold text-rose-900">Trending Deal</span>
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

      {/* ===================== ADD / EDIT CATEGORY MODAL ===================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 text-left space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-lg text-primary flex items-center gap-2">
                <Shapes className="w-5 h-5 text-secondary" />
                <span>{editingCategory ? 'Edit Store Category' : 'Add New Store Category'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setCategoryForm(prev => ({
                      ...prev,
                      name,
                      slug: editingCategory ? prev.slug : autoSlug
                    }));
                  }}
                  placeholder="e.g. Desktop Computers, CCTV & Security..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">URL Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="e.g. desktop-computers"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary font-mono text-xs"
                />
                <span className="text-[10px] text-charcoal-muted">Will create route /category/{categoryForm.slug || 'slug'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Category Icon</label>
                  <select
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="Monitor">Monitor (Desktop/PC)</option>
                    <option value="Laptop">Laptop (Notebooks)</option>
                    <option value="HardDrive">HardDrive (Storage/SSD)</option>
                    <option value="Tv">Tv (Displays/Screens)</option>
                    <option value="Keyboard">Keyboard (Peripherals)</option>
                    <option value="Shapes">Shapes (Printers/Parts)</option>
                    <option value="Video">Video (CCTV/Cameras)</option>
                    <option value="Router">Router (Networking/Wi-Fi)</option>
                    <option value="Shield">Shield (Antivirus/Software)</option>
                    <option value="Smartphone">Smartphone (Mobility)</option>
                    <option value="Cable">Cable (Cables & Wires)</option>
                    <option value="Wrench">Wrench (Converters & Tools)</option>
                    <option value="Layers">Layers (Accessories)</option>
                    <option value="PhoneCall">PhoneCall (Telecom/Intercom)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Display Order #</label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={categoryForm.image_url}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary text-xs"
                />
                {categoryForm.image_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={categoryForm.image_url}
                      alt="Category Preview"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                    />
                    <span className="text-[10px] text-charcoal-muted">Image preview</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Short summary for this category..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-surface-muted focus:bg-white focus:border-secondary text-xs"
                />
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                  className="rounded text-secondary w-4 h-4"
                />
                <span>Active & Visible in Storefront Menus</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
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

      {/* ===================== ADD NEW DEALER MODAL ===================== */}
      {newDealerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-primary flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-secondary" />
                  <span>Provision New B2B Dealer Account</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create an approved dealer account with customized dealer code and temporary password.
                </p>
              </div>
              <button
                onClick={() => setNewDealerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDealerAdmin} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Business / Firm Name *</label>
                  <input
                    type="text"
                    required
                    value={newDealerForm.business_name}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, business_name: e.target.value })}
                    placeholder="e.g. Jaipur Tech Solutions"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={newDealerForm.contact_person}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, contact_person: e.target.value })}
                    placeholder="Owner / Proprietor"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">10-Digit Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newDealerForm.phone}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="9829012345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={newDealerForm.email}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, email: e.target.value })}
                    placeholder="dealer@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={newDealerForm.gst_number}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, gst_number: e.target.value.toUpperCase() })}
                    placeholder="e.g. 08AAAAA0000A1Z5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Business Type</label>
                  <input
                    type="text"
                    value={newDealerForm.business_type}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, business_type: e.target.value })}
                    placeholder="e.g. Computer Hardware Retailer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Shop / Warehouse Address *</label>
                <input
                  type="text"
                  required
                  value={newDealerForm.address}
                  onChange={(e) => setNewDealerForm({ ...newDealerForm, address: e.target.value })}
                  placeholder="Plot/Shop No, Street, Landmark"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newDealerForm.city}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, city: e.target.value })}
                    placeholder="Jaipur"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newDealerForm.state}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, state: e.target.value })}
                    placeholder="Rajasthan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newDealerForm.pincode}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="302001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Assigned Dealer Code (Optional)</label>
                  <input
                    type="text"
                    value={newDealerForm.dealer_code}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, dealer_code: e.target.value.toUpperCase() })}
                    placeholder="Auto-generated (e.g. DLR-1003)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Initial Password *</label>
                  <input
                    type="text"
                    required
                    value={newDealerForm.password}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, password: e.target.value })}
                    placeholder="dealer123"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewDealerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Create & Activate Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== RESET DEALER PASSWORD MODAL ===================== */}
      {resetPasswordDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base text-primary flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-secondary" />
                <span>Reset Dealer Password</span>
              </h3>
              <button
                onClick={() => setResetPasswordDealer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
              <div><strong>Dealer:</strong> {resetPasswordDealer.dealer_code} ({resetPasswordDealer.business_name})</div>
              <div><strong>Phone:</strong> +91 {resetPasswordDealer.phone}</div>
            </div>

            <form onSubmit={handleResetDealerPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Enter New Temporary Password *</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={resetNewPasswordInput}
                  onChange={(e) => setResetNewPasswordInput(e.target.value)}
                  placeholder="e.g. newPass2026"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                />
              </div>

              <div className="pt-2 flex justify-between gap-2">
                <a
                  href={generateDealerApprovalWhatsAppUrl(resetPasswordDealer, resetNewPasswordInput || 'dealer123')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </a>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetPasswordDealer(null)}
                    className="px-3 py-2 border border-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save New Password
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
