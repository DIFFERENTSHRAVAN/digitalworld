import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  Category,
  Product,
  StoreSettings,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  OrderCustomerInfo,
  AdminUser
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialStoreSettings,
  initialOrders
} from './mockData';

import { STORE_CONFIG } from '../config/storeConfig';

export { initialStoreSettings, initialCategories, initialProducts, initialOrders, STORE_CONFIG };

// Storage keys for local development persistence
const STORAGE_SETTINGS = 'soni_store_settings';
const STORAGE_CONFIG_VERSION = 'digital_world_config_version';
const STORAGE_CATEGORIES = 'soni_categories';
const STORAGE_PRODUCTS = 'soni_products';
const STORAGE_ORDERS = 'soni_orders';
const STORAGE_ADMIN = 'soni_admin_session';

export const isUsingLocalMode = (): boolean => {
  return !isSupabaseConfigured();
};

export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Local storage initializers - Automatically syncs with src/config/storeConfig.ts
const getLocalSettings = (): StoreSettings => {
  const data = localStorage.getItem(STORAGE_SETTINGS);
  const currentVersion = localStorage.getItem(STORAGE_CONFIG_VERSION);

  // If the developer/owner changed details in src/config/storeConfig.ts, auto-sync immediately!
  if (currentVersion !== STORE_CONFIG.version) {
    let existing: Partial<StoreSettings> = {};
    if (data) {
      try {
        existing = JSON.parse(data);
      } catch {
        // ignore parse error
      }
    }
    const synced: StoreSettings = {
      ...initialStoreSettings,
      ...existing,
      shop_name: STORE_CONFIG.shopName,
      owner_name: STORE_CONFIG.ownerName,
      whatsapp_number: STORE_CONFIG.whatsappNumber,
      contact_number: STORE_CONFIG.contactNumber,
      business_address: STORE_CONFIG.businessAddress,
      email_address: STORE_CONFIG.emailAddress,
      opening_hours: STORE_CONFIG.openingHours,
      delivery_charges: STORE_CONFIG.deliveryCharges,
      free_delivery_above: STORE_CONFIG.freeDeliveryAbove,
      minimum_order_amount: STORE_CONFIG.minimumOrderAmount,
      upi_id: existing.upi_id || STORE_CONFIG.upiId,
      warranty_policy_text: STORE_CONFIG.warrantyPolicyText,
      return_policy_text: STORE_CONFIG.returnPolicyText
    };
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(synced));
    localStorage.setItem(STORAGE_CONFIG_VERSION, STORE_CONFIG.version);
    return synced;
  }

  if (!data) {
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(initialStoreSettings));
    localStorage.setItem(STORAGE_CONFIG_VERSION, STORE_CONFIG.version);
    return initialStoreSettings;
  }

  try {
    const parsed = JSON.parse(data);
    let hasChange = false;
    if (parsed.shop_name === 'Soni Electronics' || !parsed.shop_name) {
      parsed.shop_name = STORE_CONFIG.shopName;
      hasChange = true;
    }
    if (!parsed.whatsapp_number) {
      parsed.whatsapp_number = STORE_CONFIG.whatsappNumber;
      hasChange = true;
    }
    if (!parsed.contact_number) {
      parsed.contact_number = STORE_CONFIG.contactNumber;
      hasChange = true;
    }
    if (hasChange) {
      localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return initialStoreSettings;
  }
};

const getLocalCategories = (): Category[] => {
  const data = localStorage.getItem(STORAGE_CATEGORIES);
  if (!data) {
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(initialCategories));
    return initialCategories;
  }
  try {
    const cats: Category[] = JSON.parse(data);
    let updated = false;
    cats.forEach(c => {
      if (c.name === 'Second-Hand Laptops' || c.slug === 'second-hand-laptops') {
        c.name = 'Refurbished Laptops';
        c.slug = 'refurbished-laptops';
        c.description = 'Certified 28-point tested refurbished laptops with 30-Day Testing Warranty';
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(cats));
    }
    return cats;
  } catch {
    return initialCategories;
  }
};

const getLocalProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_PRODUCTS);
  if (!data) {
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(initialProducts));
    return initialProducts;
  }
  try {
    const prods: Product[] = JSON.parse(data);
    let updated = false;
    prods.forEach(p => {
      if (p.category_name === 'Second-Hand Laptops') {
        p.category_name = 'Refurbished Laptops';
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(prods));
    }
    return prods;
  } catch {
    return initialProducts;
  }
};

const getLocalOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_ORDERS);
  if (!data) {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(initialOrders));
    return initialOrders;
  }
  return JSON.parse(data);
};

// ==================== STORE SETTINGS ====================
export const getStoreSettings = async (): Promise<StoreSettings> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (!error && data) return data as StoreSettings;
    } catch {
      // fallback to local on network error
    }
  }
  return getLocalSettings();
};

export const updateStoreSettings = async (settings: Partial<StoreSettings>): Promise<StoreSettings> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('store_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', 'default')
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as StoreSettings;
  }

  const current = getLocalSettings();
  const updated: StoreSettings = { ...current, ...settings, updated_at: new Date().toISOString() };
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(updated));
  return updated;
};

// ==================== CATEGORIES ====================
export const getCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!error && data) return data as Category[];
    } catch {
      // fallback
    }
  }
  return getLocalCategories().filter(c => c.is_active);
};

// ==================== PRODUCTS ====================
export interface ProductFilters {
  search?: string;
  category?: string;
  condition?: 'new' | 'second_hand' | 'all';
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'featured';
  featuredOnly?: boolean;
  specialOffersOnly?: boolean;
  isUsedLaptopOnly?: boolean;
}

export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  let products: Product[] = [];

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('products').select('*, categories(name)').eq('is_published', true);

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category);
      }
      if (filters.condition && filters.condition !== 'all') {
        query = query.eq('condition', filters.condition);
      }
      if (filters.brand && filters.brand !== 'all') {
        query = query.eq('brand', filters.brand);
      }
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.inStockOnly) {
        query = query.gt('stock_quantity', 0).eq('is_sold_out', false).eq('is_reserved', false);
      }
      if (filters.featuredOnly) {
        query = query.eq('is_featured', true);
      }
      if (filters.specialOffersOnly) {
        query = query.eq('is_special_offer', true);
      }

      if (filters.sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (filters.sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data) {
        products = data.map((item: Record<string, unknown>) => ({
          ...item,
          category_name: (item.categories as Record<string, unknown>)?.name as string || ''
        })) as Product[];
      }
    } catch {
      // fallback
    }
  }

  if (products.length === 0) {
    products = getLocalProducts().filter(p => p.is_published);
  }

  // Apply filters locally (works both for local mode and refinement)
  if (filters.search && filters.search.trim() !== '') {
    const q = filters.search.toLowerCase().trim();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      (p.processor && p.processor.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (filters.category && filters.category !== 'all') {
    products = products.filter(p => p.category_id === filters.category || p.slug === filters.category);
  }

  if (filters.condition && filters.condition !== 'all') {
    products = products.filter(p => p.condition === filters.condition);
  }

  if (filters.brand && filters.brand !== 'all') {
    products = products.filter(p => p.brand.toLowerCase() === filters.brand?.toLowerCase());
  }

  if (filters.minPrice !== undefined) {
    products = products.filter(p => p.price >= (filters.minPrice || 0));
  }

  if (filters.maxPrice !== undefined) {
    products = products.filter(p => p.price <= (filters.maxPrice || Infinity));
  }

  if (filters.inStockOnly) {
    products = products.filter(p => p.stock_quantity > 0 && !p.is_sold_out && !p.is_reserved);
  }

  if (filters.featuredOnly) {
    products = products.filter(p => p.is_featured);
  }

  if (filters.specialOffersOnly) {
    products = products.filter(p => p.is_special_offer);
  }

  if (filters.isUsedLaptopOnly) {
    products = products.filter(p => p.condition === 'second_hand' && (p.category_name?.toLowerCase().includes('laptop') || p.category_id === 'c1'));
  }

  if (filters.sortBy === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'newest') {
    products.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }

  return products;
};

export const getProductByIdOrSlug = async (idOrSlug: string): Promise<Product | null> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .single();
      if (!error && data) {
        return {
          ...data,
          category_name: (data.categories as Record<string, unknown>)?.name as string || ''
        } as Product;
      }
    } catch {
      // fallback
    }
  }

  const products = getLocalProducts();
  return products.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
};

// ==================== ORDER CREATION & ATOMIC VALIDATION ====================
export interface CreateOrderParams {
  customerInfo: OrderCustomerInfo;
  items: { product: Product; quantity: number }[];
}

export const createOrder = async (params: CreateOrderParams): Promise<{ success: boolean; order: Order; message?: string }> => {
  const { customerInfo, items } = params;

  if (items.length === 0) {
    throw new Error('Cannot place an order with an empty cart.');
  }

  const settings = await getStoreSettings();

  // Validate store settings restrictions
  if (customerInfo.payment_method === 'cod' && !settings.cod_enabled) {
    throw new Error('Cash on Delivery is currently disabled by the shop.');
  }
  if (customerInfo.payment_method === 'pay_on_delivery' && !settings.pay_on_delivery_enabled) {
    throw new Error('Pay on Delivery is currently disabled by the shop.');
  }
  if (customerInfo.payment_method === 'online_payment' && !settings.online_payment_enabled) {
    throw new Error('Online Payment Gateway is currently disabled.');
  }
  if (customerInfo.delivery_type === 'store_pickup' && !settings.store_pickup_enabled) {
    throw new Error('In-store pickup is currently disabled.');
  }

  // 1. If Supabase configured, invoke atomic RPC create_order_atomic
  if (isSupabaseConfigured() && supabase) {
    const payloadItems = items.map(i => ({
      product_id: i.product.id,
      quantity: i.quantity
    }));

    // Calculate delivery charge
    const rawSubtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const deliveryCharge = (customerInfo.delivery_type === 'store_pickup' || rawSubtotal >= settings.free_delivery_above)
      ? 0
      : settings.delivery_charges;

    const payloadOrder = {
      ...customerInfo,
      delivery_charge: deliveryCharge
    };

    const { data, error } = await supabase.rpc('create_order_atomic', {
      p_order: payloadOrder,
      p_items: payloadItems
    });

    if (error) {
      throw new Error(error.message);
    }

    // Fetch the inserted order
    const orderId = (data as { order_id: string }).order_id;
    const { data: orderData } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderData) {
      return { success: true, order: orderData as Order };
    }
  }

  // 2. Local Mode Atomic Order Processing & Stock Validation
  const allProducts = getLocalProducts();

  // Validate stock and recompute real price strictly from database
  let serverCalculatedSubtotal = 0;
  const verifiedOrderItems: OrderItem[] = [];

  for (const item of items) {
    const dbProductIndex = allProducts.findIndex(p => p.id === item.product.id);
    if (dbProductIndex === -1) {
      throw new Error(`Product "${item.product.name}" could not be found.`);
    }

    const dbProduct = allProducts[dbProductIndex];

    if (!dbProduct.is_published) {
      throw new Error(`Product "${dbProduct.name}" is no longer available.`);
    }

    if (dbProduct.is_sold_out || dbProduct.is_reserved) {
      throw new Error(`Product "${dbProduct.name}" is already sold out.`);
    }

    if (dbProduct.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock_quantity} left in stock.`);
    }

    // Atomically decrement stock
    dbProduct.stock_quantity -= item.quantity;
    if (dbProduct.stock_quantity <= 0) {
      dbProduct.is_sold_out = true;
    }
    allProducts[dbProductIndex] = dbProduct;

    const itemTotal = dbProduct.price * item.quantity;
    serverCalculatedSubtotal += itemTotal;

    verifiedOrderItems.push({
      product_id: dbProduct.id,
      product_name: dbProduct.name,
      product_brand: dbProduct.brand,
      product_model: dbProduct.model,
      product_image: dbProduct.primary_image,
      condition: dbProduct.condition,
      unit_price: dbProduct.price,
      quantity: item.quantity,
      total_price: itemTotal
    });
  }

  // Check minimum order amount if set
  if (settings.minimum_order_amount > 0 && serverCalculatedSubtotal < settings.minimum_order_amount) {
    throw new Error(`Minimum order amount is ${formatINR(settings.minimum_order_amount)}. Current order is ${formatINR(serverCalculatedSubtotal)}.`);
  }

  // Calculate delivery charge
  const deliveryCharge = (customerInfo.delivery_type === 'store_pickup' || serverCalculatedSubtotal >= settings.free_delivery_above)
    ? 0
    : settings.delivery_charges;

  const totalAmount = serverCalculatedSubtotal + deliveryCharge;

  // Generate unique order number (e.g. DW-20261013-4821)
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `DW-${todayStr}-${randomSuffix}`;
  const orderId = `ord_${Date.now()}_${randomSuffix}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    ...customerInfo,
    subtotal: serverCalculatedSubtotal,
    delivery_charge: deliveryCharge,
    total_amount: totalAmount,
    payment_status: 'pending',
    order_status: 'pending',
    created_at: now,
    updated_at: now,
    items: verifiedOrderItems,
    status_history: [
      {
        order_id: orderId,
        status: 'pending',
        note: 'Order submitted online by customer',
        created_at: now,
        updated_by: 'system'
      }
    ]
  };

  // Persist updated inventory and new order
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(allProducts));
  const currentOrders = getLocalOrders();
  currentOrders.unshift(newOrder);
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(currentOrders));

  return { success: true, order: newOrder };
};

// ==================== ORDER TRACKING & LOOKUP ====================
export const getOrderByIdOrNumber = async (orderNumber: string, phone: string): Promise<Order | null> => {
  const cleanOrderNum = orderNumber.trim().toUpperCase();
  const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), order_status_history(*)')
        .eq('order_number', cleanOrderNum)
        .ilike('customer_phone', `%${cleanPhone}%`)
        .single();
      if (!error && data) {
        return {
          ...data,
          items: data.order_items,
          status_history: data.order_status_history
        } as Order;
      }
    } catch {
      // fallback
    }
  }

  const orders = getLocalOrders();
  const found = orders.find(o =>
    (o.order_number.toUpperCase() === cleanOrderNum || o.id === orderNumber) &&
    o.customer_phone.replace(/\D/g, '').slice(-10) === cleanPhone
  );
  return found || null;
};

// ==================== ADMIN OPERATIONS ====================
export const getAllOrdersAdmin = async (): Promise<Order[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), order_status_history(*)')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((item: Record<string, unknown>) => ({
          ...item,
          items: item.order_items,
          status_history: item.order_status_history
        })) as Order[];
      }
    } catch {
      // fallback
    }
  }
  return getLocalOrders();
};

export const updateOrderStatusAdmin = async (
  orderId: string,
  status: OrderStatus,
  note: string = ''
): Promise<Order> => {
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    const { error: orderError } = await supabase
      .from('orders')
      .update({ order_status: status, updated_at: now })
      .eq('id', orderId);

    if (orderError) throw new Error(orderError.message);

    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: status,
      note: note || `Status updated to ${status}`,
      updated_by: 'Vishal Soni (Admin)'
    });

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*), order_status_history(*)')
      .eq('id', orderId)
      .single();

    return {
      ...data,
      items: data.order_items,
      status_history: data.order_status_history
    } as Order;
  }

  const orders = getLocalOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) throw new Error('Order not found');

  const historyItem = {
    order_id: orderId,
    status: status,
    note: note || `Status changed to ${status}`,
    created_at: now,
    updated_by: 'Vishal Soni'
  };

  orders[idx].order_status = status;
  orders[idx].updated_at = now;
  orders[idx].status_history = [...(orders[idx].status_history || []), historyItem];

  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
  return orders[idx];
};

export const updatePaymentStatusAdmin = async (
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<Order> => {
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus, updated_at: now })
      .eq('id', orderId)
      .select('*, order_items(*), order_status_history(*)')
      .single();

    if (error) throw new Error(error.message);
    return {
      ...data,
      items: data.order_items,
      status_history: data.order_status_history
    } as Order;
  }

  const orders = getLocalOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) throw new Error('Order not found');

  orders[idx].payment_status = paymentStatus;
  orders[idx].updated_at = now;
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
  return orders[idx];
};

// ==================== ADMIN PRODUCT MANAGEMENT ====================
export const getAllProductsAdmin = async (): Promise<Product[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((item: Record<string, unknown>) => ({
          ...item,
          category_name: (item.categories as Record<string, unknown>)?.name as string || ''
        })) as Product[];
      }
    } catch {
      // fallback
    }
  }
  return getLocalProducts();
};

export const addProductAdmin = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  const now = new Date().toISOString();
  const newId = `p_${Date.now()}`;

  const newProduct: Product = {
    ...productData,
    id: newId,
    created_at: now,
    updated_at: now
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        images: productData.images || []
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Product;
  }

  const products = getLocalProducts();
  products.unshift(newProduct);
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  return newProduct;
};

export const updateProductAdmin = async (productId: string, updates: Partial<Product>): Promise<Product> => {
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: now })
      .eq('id', productId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Product;
  }

  const products = getLocalProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) throw new Error('Product not found');

  products[idx] = { ...products[idx], ...updates, updated_at: now };
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  return products[idx];
};

export const deleteProductAdmin = async (productId: string): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw new Error(error.message);
    return true;
  }

  let products = getLocalProducts();
  products = products.filter(p => p.id !== productId);
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  return true;
};

// Clear demo products helper for shop launch
export const clearDemoProductsAdmin = async (): Promise<number> => {
  if (isSupabaseConfigured() && supabase) {
    const { count, error } = await supabase
      .from('products')
      .delete({ count: 'exact' })
      .eq('is_demo_product', true);
    if (error) throw new Error(error.message);
    return count || 0;
  }

  const products = getLocalProducts();
  const realProducts = products.filter(p => !p.is_demo_product);
  const deletedCount = products.length - realProducts.length;
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(realProducts));
  return deletedCount;
};

// Reset to initial demo products
export const resetDemoDataAdmin = (): void => {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(initialProducts));
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(initialCategories));
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(initialStoreSettings));
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(initialOrders));
};

// ==================== ADMIN AUTHENTICATION ====================
export const adminLogin = async (email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> => {
  // If Supabase Auth is configured, use it
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email || email,
            role: 'owner'
          }
        };
      }
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  }

  // Local development / fallback owner auth
  const cleanEmail = email.trim().toLowerCase();
  const configuredPassword = (STORE_CONFIG as unknown as { adminPassword?: string }).adminPassword;
  const customSavedPassword = localStorage.getItem('dw_admin_custom_password');
  const validPasswords = [customSavedPassword, configuredPassword, 'admin123', 'soni2026', 'digital123'].filter(Boolean);

  if (
    cleanEmail === 'admin@digitalworld.com' ||
    cleanEmail === 'vishal@digitalworld.in' ||
    cleanEmail === STORE_CONFIG.adminEmail.toLowerCase() ||
    cleanEmail === 'admin'
  ) {
    if (validPasswords.includes(password)) {
      const user: AdminUser = {
        id: 'admin_local_vishal',
        email: cleanEmail,
        role: 'owner'
      };
      localStorage.setItem(STORAGE_ADMIN, JSON.stringify(user));
      return { success: true, user };
    }
  }

  return { success: false, error: 'Invalid email or password. Please verify your administrative credentials.' };
};

export const changeAdminPassword = (newPassword: string): boolean => {
  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  localStorage.setItem('dw_admin_custom_password', newPassword.trim());
  return true;
};

export const adminLogout = async (): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(STORAGE_ADMIN);
};

export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email || '',
        role: 'owner'
      };
    }
  }

  const saved = localStorage.getItem(STORAGE_ADMIN);
  if (saved) {
    return JSON.parse(saved);
  }
  return null;
};

// ==================== WHATSAPP URL HELPERS ====================
export const generateProductWhatsAppUrl = (
  whatsappNumber: string,
  product: Product,
  currentUrl?: string
): string => {
  const targetNumber = whatsappNumber || STORE_CONFIG.whatsappNumber;
  const cleanNumber = targetNumber ? targetNumber.replace(/\D/g, '') : '';
  const url = currentUrl || window.location.href;

  const text = `Hello ${STORE_CONFIG.shopName}, I am interested in this product:

Product: ${product.name}
Model: ${product.brand} ${product.model}
Condition: ${product.condition === 'second_hand' ? 'Certified Refurbished' : 'Brand New'}
Price: ${formatINR(product.price)}
Product Link: ${url}

Please confirm availability and delivery details.`;

  return `https://wa.me/${cleanNumber ? (cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`) : ''}?text=${encodeURIComponent(text)}`;
};

export const generateCartWhatsAppUrl = (
  whatsappNumber: string,
  items: { product: Product; quantity: number }[],
  subtotal: number,
  notes?: string
): string => {
  const targetNumber = whatsappNumber || STORE_CONFIG.whatsappNumber;
  const cleanNumber = targetNumber ? targetNumber.replace(/\D/g, '') : '';

  let message = `Hello ${STORE_CONFIG.shopName}, I would like to inquire about the following items in my cart:\n\n`;

  items.forEach((item, index) => {
    message += `${index + 1}. ${item.product.name}\n   Qty: ${item.quantity} | Price: ${formatINR(item.product.price * item.quantity)}\n`;
  });

  message += `\nEstimated Subtotal: ${formatINR(subtotal)}`;

  if (notes && notes.trim() !== '') {
    message += `\nCustomer Notes: ${notes.trim()}`;
  }

  message += `\n\nPlease let me know if these items are in stock and the delivery timeframe. Thank you!`;

  return `https://wa.me/${cleanNumber ? (cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`) : ''}?text=${encodeURIComponent(message)}`;
};

export const generateOwnerOrderNotificationUrl = (
  ownerWhatsappNumber: string,
  order: Order
): string => {
  const targetNumber = ownerWhatsappNumber || STORE_CONFIG.whatsappNumber;
  const cleanNumber = targetNumber ? targetNumber.replace(/\D/g, '') : '';

  let message = `*🔔 NEW ORDER RECEIVED - ${STORE_CONFIG.shopName}*\n\n`;
  message += `*Order ID:* ${order.order_number}\n`;
  message += `*Customer:* ${order.customer_name}\n`;
  message += `*Phone:* ${order.customer_phone}\n`;
  message += `*WhatsApp:* ${order.customer_whatsapp}\n`;
  message += `*Delivery Type:* ${order.delivery_type === 'store_pickup' ? 'Store Pickup' : 'Home Delivery'}\n`;
  message += `*Address:* ${order.delivery_address}, ${order.city}, ${order.state} - ${order.pincode}\n`;
  message += `*Payment Method:* ${order.payment_method.toUpperCase()} (${order.payment_status})\n\n`;
  message += `*Items Ordered:*\n`;

  (order.items || []).forEach((item, index) => {
    message += `${index + 1}. ${item.product_name} (x${item.quantity}) - ${formatINR(item.total_price)}\n`;
  });

  message += `\n*Subtotal:* ${formatINR(order.subtotal)}`;
  message += `\n*Delivery:* ${order.delivery_charge === 0 ? 'FREE' : formatINR(order.delivery_charge)}`;
  message += `\n*Total Payable:* ${formatINR(order.total_amount)}\n`;

  if (order.order_notes) {
    message += `*Notes:* ${order.order_notes}\n`;
  }

  message += `\nTime: ${new Date(order.created_at).toLocaleString('en-IN')}`;

  return `https://wa.me/${cleanNumber ? (cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`) : ''}?text=${encodeURIComponent(message)}`;
};

export const generateCustomerWhatsAppUpdateUrl = (
  customerPhone: string,
  order: Order,
  status: OrderStatus
): string => {
  const cleanPhone = customerPhone.replace(/\D/g, '');

  let statusText = '';
  switch (status) {
    case 'confirmed':
      statusText = 'confirmed and being prepared for packing.';
      break;
    case 'processing':
      statusText = 'currently being tested and securely packed.';
      break;
    case 'shipped':
      statusText = 'dispatched / out for delivery to your address.';
      break;
    case 'delivered':
      statusText = 'marked as successfully delivered. Thank you for shopping with Digital World!';
      break;
    case 'cancelled':
      statusText = 'cancelled.';
      break;
    default:
      statusText = 'received and pending confirmation.';
  }

  const message = `Namaste ${order.customer_name},\n\nYour order *${order.order_number}* at Digital World has been ${statusText}\n\nTotal: ${formatINR(order.total_amount)}\nPayment: ${order.payment_method.toUpperCase()} (${order.payment_status})\n\nIf you have any questions, feel free to reply here.\n\nWarm regards,\nVishal Soni\nDigital World`;

  return `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(message)}`;
};
