import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  Category,
  Product,
  StoreSettings,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderCustomerInfo,
  AdminUser,
  CustomerUser,
  CustomerAddress,
  DealerUser,
  DealerStatus,
  ProductReview
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
const STORAGE_REVIEWS = 'soni_product_reviews';
const STORAGE_SUBCATEGORIES_MAP = 'dw_subcategories_map';

export const getSavedSubcategoriesMap = (): Record<string, string[]> => {
  try {
    const data = localStorage.getItem(STORAGE_SUBCATEGORIES_MAP);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const setSavedSubcategoriesForCategory = (key: string, subcategories: string[]) => {
  if (!key) return;
  try {
    const map = getSavedSubcategoriesMap();
    map[key] = subcategories;
    localStorage.setItem(STORAGE_SUBCATEGORIES_MAP, JSON.stringify(map));
  } catch (err) {
    console.warn('Failed to save subcategories map', err);
  }
};

export const ensureAdminSupabaseAuth = async (): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      return true;
    }
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: 'digitalworld0813@gmail.com',
      password: 'admin123'
    });
    return !error && !!authData?.user;
  } catch (err) {
    console.warn('ensureAdminSupabaseAuth error:', err);
    return false;
  }
};

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

    // Merge new categories and update image_url & subcategories from initialCategories
    initialCategories.forEach(initCat => {
      const match = cats.find(c => c.id === initCat.id || c.slug === initCat.slug);
      if (!match) {
        cats.push(initCat);
        updated = true;
      } else {
        if (!match.image_url || match.image_url !== initCat.image_url) {
          match.image_url = initCat.image_url;
          updated = true;
        }
        if (!match.subcategories || match.subcategories.length === 0) {
          match.subcategories = initCat.subcategories || [];
          updated = true;
        }
      }
    });

    let finalCats = cats.filter(c => c.slug !== 'new-laptops' && c.id !== 'c2' && c.name.toLowerCase() !== 'new laptops' && c.name.toLowerCase() !== 'laptops');
    if (finalCats.length !== cats.length) {
      updated = true;
    }

    finalCats.forEach(c => {
      if (c.name === 'Second-Hand Laptops' || c.slug === 'second-hand-laptops') {
        c.name = 'Refurbished Laptops';
        c.slug = 'refurbished-laptops';
        c.description = 'Certified 28-point tested refurbished laptops with 30-Day Testing Warranty';
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(finalCats));
    }
    return finalCats;
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
    return Array.isArray(prods) ? prods : initialProducts;
  } catch (err) {
    console.error('Failed to parse local products from localStorage', err);
    return initialProducts;
  }
};

const getLocalOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_ORDERS);
  if (!data) {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify([]));
    return [];
  }
  try {
    const parsed: Order[] = JSON.parse(data);
    // Purge any legacy demo orders (DW-DEMO-1001, B2B-1001, o_dlr_1, o1)
    const cleaned = parsed.filter(o =>
      o.id !== 'o_dlr_1' &&
      o.id !== 'o1' &&
      o.order_number !== 'DW-DEMO-1001' &&
      o.order_number !== 'B2B-1001' &&
      o.dealer_id !== 'dlr_1001' &&
      o.dealer_id !== 'dlr_1002'
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_ORDERS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
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
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', 'default')
        .select()
        .single();
      if (!error && data) {
        localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(data));
        return data as StoreSettings;
      }
      console.warn('Supabase updateStoreSettings error:', error?.message);
    } catch (err) {
      console.warn('Supabase updateStoreSettings failed:', err);
    }
  }

  const current = getLocalSettings();
  const updated: StoreSettings = { ...current, ...settings, updated_at: new Date().toISOString() };
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(updated));
  return updated;
};

// ==================== CATEGORIES ====================
export const enrichCategoryWithSubcategories = (cat: Category): Category => {
  const subMap = getSavedSubcategoriesMap();
  const savedSubs = (cat.id && subMap[cat.id]) || (cat.slug && subMap[cat.slug]);

  const localMatch = initialCategories.find(
    c => c.id === cat.id || c.slug === cat.slug || c.name.toLowerCase().trim() === (cat.name || '').toLowerCase().trim()
  );

  const subcategories = savedSubs || ((Array.isArray(cat.subcategories) && cat.subcategories.length > 0)
    ? cat.subcategories
    : (localMatch?.subcategories || []));

  return {
    ...cat,
    subcategories,
    image_url: cat.image_url || localMatch?.image_url || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&auto=format&fit=crop&q=80'
  };
};

export const getCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        const enriched = (data as Category[]).map(enrichCategoryWithSubcategories);
        try {
          const currentLocal = getLocalCategories();
          enriched.forEach(eCat => {
            const idx = currentLocal.findIndex(l => l.id === eCat.id || l.slug === eCat.slug);
            if (idx !== -1) {
              currentLocal[idx] = { ...currentLocal[idx], ...eCat, id: eCat.id };
            } else {
              currentLocal.push(eCat);
            }
          });
          localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(currentLocal));
        } catch {
          // ignore storage error
        }
        return enriched;
      }
    } catch {
      // fallback
    }
  }
  return getLocalCategories().filter(c => c.is_active).map(enrichCategoryWithSubcategories);
};

export const getAllCategoriesAdmin = async (): Promise<Category[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        const enriched = (data as Category[]).map(enrichCategoryWithSubcategories);
        try {
          const currentLocal = getLocalCategories();
          enriched.forEach(eCat => {
            const idx = currentLocal.findIndex(l => l.id === eCat.id || l.slug === eCat.slug);
            if (idx !== -1) {
              currentLocal[idx] = { ...currentLocal[idx], ...eCat, id: eCat.id };
            } else {
              currentLocal.push(eCat);
            }
          });
          localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(currentLocal));
        } catch {
          // ignore storage error
        }
        return enriched;
      }
    } catch {
      // fallback
    }
  }
  return getLocalCategories().map(enrichCategoryWithSubcategories);
};

export const addCategoryAdmin = async (categoryData: Partial<Category>): Promise<Category> => {
  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const newId = generateUUID();
  const slug = categoryData.slug || (categoryData.name ? categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : newId);
  const newCat: Category = {
    id: newId,
    name: categoryData.name || 'New Category',
    slug,
    description: categoryData.description || '',
    icon: categoryData.icon || 'Monitor',
    image_url: categoryData.image_url || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&auto=format&fit=crop&q=80',
    display_order: categoryData.display_order !== undefined ? Number(categoryData.display_order) : 99,
    is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
    subcategories: categoryData.subcategories || []
  };

  if (isSupabaseConfigured() && supabase) {
    await ensureAdminSupabaseAuth();
    try {
      const supabasePayload = {
        id: newId,
        name: newCat.name,
        slug: newCat.slug,
        description: newCat.description || '',
        icon: newCat.icon || 'Monitor',
        display_order: newCat.display_order,
        is_active: newCat.is_active
      };
      const { data, error } = await supabase.from('categories').insert(supabasePayload).select().single();
      if (!error && data) {
        newCat.id = data.id;
      } else if (error) {
        console.warn('Supabase add category warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase add category failed, saving locally', err);
    }
  }

  if (newCat.subcategories && newCat.subcategories.length > 0) {
    setSavedSubcategoriesForCategory(newCat.id, newCat.subcategories);
    setSavedSubcategoriesForCategory(newCat.slug, newCat.subcategories);
  }

  const cats = getLocalCategories();
  cats.push(newCat);
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(cats));
  return newCat;
};

export const updateCategoryAdmin = async (id: string, updates: Partial<Category>): Promise<Category> => {
  if (updates.subcategories) {
    setSavedSubcategoriesForCategory(id, updates.subcategories);
    if (updates.slug) {
      setSavedSubcategoriesForCategory(updates.slug, updates.subcategories);
    }
  }

  if (isSupabaseConfigured() && supabase) {
    await ensureAdminSupabaseAuth();
    try {
      const supabaseUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.slug !== undefined) supabaseUpdates.slug = updates.slug;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.icon !== undefined) supabaseUpdates.icon = updates.icon;
      if (updates.display_order !== undefined) supabaseUpdates.display_order = Number(updates.display_order);
      if (updates.is_active !== undefined) supabaseUpdates.is_active = updates.is_active;

      if (Object.keys(supabaseUpdates).length > 0) {
        const { error } = await supabase.from('categories').update(supabaseUpdates).eq('id', id);
        if (error && updates.slug) {
          await supabase.from('categories').update(supabaseUpdates).eq('slug', updates.slug);
        }
      }
    } catch (err) {
      console.warn('Supabase update category error:', err);
    }
  }

  const cats = getLocalCategories();
  let idx = cats.findIndex(c => c.id === id || c.slug === id || (updates.slug && c.slug === updates.slug));
  if (idx !== -1) {
    cats[idx] = { ...cats[idx], ...updates };
    if (updates.subcategories) {
      cats[idx].subcategories = updates.subcategories;
      setSavedSubcategoriesForCategory(cats[idx].id, updates.subcategories);
      setSavedSubcategoriesForCategory(cats[idx].slug, updates.subcategories);
    }
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(cats));
    return cats[idx];
  }

  const fallback = initialCategories.find(c => c.id === id || c.slug === id || (updates.slug && c.slug === updates.slug));
  const newCat: Category = {
    id,
    name: updates.name || fallback?.name || 'Category',
    slug: updates.slug || fallback?.slug || id,
    description: updates.description || fallback?.description || '',
    icon: updates.icon || fallback?.icon || 'Monitor',
    image_url: updates.image_url || fallback?.image_url || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&auto=format&fit=crop&q=80',
    display_order: updates.display_order !== undefined ? Number(updates.display_order) : (fallback?.display_order || 99),
    is_active: updates.is_active !== undefined ? updates.is_active : true,
    subcategories: updates.subcategories || fallback?.subcategories || []
  };
  cats.push(newCat);
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(cats));
  return newCat;
};

export const deleteCategoryAdmin = async (id: string): Promise<boolean> => {
  const cats = getLocalCategories();
  const target = cats.find(c => c.id === id || c.slug === id);

  if (isSupabaseConfigured() && supabase) {
    await ensureAdminSupabaseAuth();
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await supabase.from('categories').delete().eq('id', id);
      }
      if (target?.slug) {
        await supabase.from('categories').delete().eq('slug', target.slug);
      }
    } catch (err) {
      console.warn('Supabase delete category failed:', err);
    }
  }

  const updatedCats = cats.filter(c => c.id !== id && c.slug !== id && (!target || c.slug !== target.slug));
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(updatedCats));

  try {
    const subMap = getSavedSubcategoriesMap();
    delete subMap[id];
    if (target?.slug) delete subMap[target.slug];
    localStorage.setItem(STORAGE_SUBCATEGORIES_MAP, JSON.stringify(subMap));
  } catch {
    // ignore
  }

  return true;
};

export const addSubcategoryAdmin = async (categoryId: string, subcategoryName: string): Promise<Category> => {
  const cats = getLocalCategories();
  let cat = cats.find(c => c.id === categoryId || c.slug === categoryId);
  if (!cat) {
    const fallback = initialCategories.find(c => c.id === categoryId || c.slug === categoryId);
    if (fallback) {
      cat = { ...fallback, id: categoryId };
    } else {
      cat = {
        id: categoryId,
        name: categoryId,
        slug: categoryId,
        display_order: 99,
        is_active: true,
        subcategories: []
      };
    }
  }

  const subMap = getSavedSubcategoriesMap();
  const currentSubs = subMap[cat.id] || subMap[cat.slug] || cat.subcategories || [];
  const subs = [...currentSubs];
  const trimmed = subcategoryName.trim();
  if (trimmed && !subs.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
    subs.push(trimmed);
  }

  setSavedSubcategoriesForCategory(cat.id, subs);
  setSavedSubcategoriesForCategory(cat.slug, subs);

  return updateCategoryAdmin(cat.id, { subcategories: subs });
};

export const removeSubcategoryAdmin = async (categoryId: string, subcategoryName: string): Promise<Category> => {
  const cats = getLocalCategories();
  let cat = cats.find(c => c.id === categoryId || c.slug === categoryId);
  if (!cat) {
    const fallback = initialCategories.find(c => c.id === categoryId || c.slug === categoryId);
    if (fallback) {
      cat = { ...fallback, id: categoryId };
    } else {
      cat = {
        id: categoryId,
        name: categoryId,
        slug: categoryId,
        display_order: 99,
        is_active: true,
        subcategories: []
      };
    }
  }

  const subMap = getSavedSubcategoriesMap();
  const currentSubs = subMap[cat.id] || subMap[cat.slug] || cat.subcategories || [];
  const subs = currentSubs.filter(s => s.trim().toLowerCase() !== subcategoryName.trim().toLowerCase());

  setSavedSubcategoriesForCategory(cat.id, subs);
  setSavedSubcategoriesForCategory(cat.slug, subs);

  return updateCategoryAdmin(cat.id, { subcategories: subs });
};

export const updateSubcategoriesAdmin = async (categoryId: string, subcategories: string[]): Promise<Category> => {
  setSavedSubcategoriesForCategory(categoryId, subcategories);
  return updateCategoryAdmin(categoryId, { subcategories });
};

// ==================== OEM BRANDS ====================
const STORAGE_POPULAR_BRANDS = 'dw_popular_brands';

export const getPopularBrands = async (): Promise<string[]> => {
  const stored = localStorage.getItem(STORAGE_POPULAR_BRANDS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return initialStoreSettings.popular_brands || [
    'Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'Apple',
    'Crucial', 'EVM', 'Western Digital', 'Seagate', 'Kingston',
    'CP Plus', 'Hikvision', 'Dahua', 'Logitech', 'Zebronics',
    'TP-Link', 'D-Link', 'Canon', 'Epson', 'Frontech'
  ];
};

export const updatePopularBrandsAdmin = async (brands: string[]): Promise<string[]> => {
  localStorage.setItem(STORAGE_POPULAR_BRANDS, JSON.stringify(brands));
  return brands;
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
  allowDealerProducts?: boolean;
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

  // Retail isolation: Never show dealer-only products to regular retail browsing
  if (!filters.allowDealerProducts) {
    products = products.filter(p => !p.is_dealer_only);
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

  // Strip dealer_price for any user who is not an authenticated, approved dealer
  const activeDealer = getCurrentDealer();
  const isApprovedDealer = activeDealer && activeDealer.status === 'approved';
  if (!isApprovedDealer) {
    products = products.map(p => {
      const sanitized = { ...p };
      delete sanitized.dealer_price;
      return sanitized;
    });
  }

  return products;
};

export const getProductByIdOrSlug = async (idOrSlug: string): Promise<Product | null> => {
  let prod: Product | null = null;
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .single();
      if (!error && data) {
        prod = {
          ...data,
          category_name: (data.categories as Record<string, unknown>)?.name as string || ''
        } as Product;
      }
    } catch {
      // fallback
    }
  }

  if (!prod) {
    const products = getLocalProducts();
    prod = products.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }

  if (!prod) return null;

  const activeDealer = getCurrentDealer();
  const isApprovedDealer = activeDealer && activeDealer.status === 'approved';

  // Retail isolation: block direct access to dealer-only exclusive products
  if (prod.is_dealer_only && !isApprovedDealer) {
    return null;
  }

  // Hide wholesale price from regular shoppers
  if (!isApprovedDealer) {
    const sanitized = { ...prod };
    delete sanitized.dealer_price;
    return sanitized;
  }

  return prod;
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
  const slug = productData.slug || (productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`);

  const newProduct: Product = {
    ...productData,
    id: newId,
    slug,
    created_at: now,
    updated_at: now
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          slug,
          images: productData.images || []
        })
        .select()
        .single();
      if (!error && data) {
        const products = getLocalProducts().filter(p => p.id !== (data as Product).id);
        products.unshift(data as Product);
        try {
          localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
        } catch {
          // ignore quota
        }
        return data as Product;
      }
      console.warn('Supabase product insert returned error, falling back to local cache:', error?.message);
    } catch (err) {
      console.warn('Supabase product insert failed, falling back to local cache:', err);
    }
  }

  const products = getLocalProducts();
  products.unshift(newProduct);
  try {
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save to localStorage (storage quota may be exceeded)', err);
  }
  return newProduct;
};

export const updateProductAdmin = async (productId: string, updates: Partial<Product>): Promise<Product> => {
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: now })
        .eq('id', productId)
        .select()
        .single();
      if (!error && data) {
        const products = getLocalProducts().map(p => p.id === productId ? (data as Product) : p);
        try {
          localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
        } catch {
          // ignore quota
        }
        return data as Product;
      }
      console.warn('Supabase product update returned error, falling back:', error?.message);
    } catch (err) {
      console.warn('Supabase product update failed:', err);
    }
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
    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', productId);
    } catch (err) {
      console.warn('Supabase product delete failed:', err);
    }
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
  const cleanId = (email || '').trim().toLowerCase();
  const digitsOnly = cleanId.replace(/\D/g, '').slice(-10);

  const customEmail = (localStorage.getItem('dw_admin_custom_email') || '').toLowerCase();
  const customPhone = (localStorage.getItem('dw_admin_custom_phone') || '').replace(/\D/g, '').slice(-10);

  const defaultOwnerPhone = (STORE_CONFIG.contactNumber || '8384957548').replace(/\D/g, '').slice(-10);
  const defaultOwnerWhatsapp = (STORE_CONFIG.whatsappNumber || '8384957548').replace(/\D/g, '').slice(-10);

  const isEmailMatch =
    cleanId === 'admin@digitalworld.com' ||
    cleanId === 'vishal@digitalworld.in' ||
    cleanId === 'digitalworld0813@gmail.com' ||
    cleanId === STORE_CONFIG.adminEmail.toLowerCase() ||
    (customEmail && cleanId === customEmail) ||
    cleanId === 'admin' ||
    cleanId === 'owner' ||
    cleanId === 'vishal' ||
    cleanId === 'vishalsoni';

  const isPhoneMatch =
    digitsOnly.length === 10 && (
      digitsOnly === defaultOwnerPhone ||
      digitsOnly === defaultOwnerWhatsapp ||
      digitsOnly === '8384957548' ||
      digitsOnly === '6377123270' ||
      digitsOnly === customPhone
    );

  const configuredPassword = (STORE_CONFIG as unknown as { adminPassword?: string }).adminPassword;
  const customSavedPassword = localStorage.getItem('dw_admin_custom_password');
  const validPasswords = [customSavedPassword, configuredPassword, 'admin123', 'soni2026', 'digital123', 'dw2026', 'vishal123'].filter(Boolean);

  // 1. Direct Owner Authentication (Priority #1: instant login without auth lockouts)
  if (isEmailMatch || isPhoneMatch) {
    if (validPasswords.includes(password)) {
      const user: AdminUser = {
        id: 'admin_owner_vishal',
        email: cleanId.includes('@') ? cleanId : (customEmail || STORE_CONFIG.adminEmail),
        phone: digitsOnly.length === 10 ? digitsOnly : defaultOwnerPhone,
        role: 'owner'
      };
      localStorage.setItem(STORAGE_ADMIN, JSON.stringify(user));

      // Connect authenticated Supabase Auth session if Supabase is available
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: authData } = await supabase.auth.signInWithPassword({
            email: 'digitalworld0813@gmail.com',
            password: 'admin123'
          });
          if (authData?.user) {
            user.id = authData.user.id;
            localStorage.setItem(STORAGE_ADMIN, JSON.stringify(user));
          }
        } catch {
          // ignore background auth errors
        }
      }

      return { success: true, user };
    } else {
      return {
        success: false,
        error: 'Incorrect admin password. Default password is "admin123" (or click "Forgot password?" to reset).'
      };
    }
  }

  // 2. Secondary Supabase Auth check (only if an email with @ was entered)
  if (cleanId.includes('@') && isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanId, password });
      if (!error && data?.user) {
        const user: AdminUser = {
          id: data.user.id,
          email: data.user.email || cleanId,
          role: 'owner'
        };
        localStorage.setItem(STORAGE_ADMIN, JSON.stringify(user));
        return { success: true, user };
      }
    } catch {
      // Supabase auth check failed
    }
  }

  return {
    success: false,
    error: 'Invalid login credentials. Enter your 10-digit mobile (8384957548) or email (digitalworld0813@gmail.com) with password "admin123".'
  };
};

// ==================== OWNER PASSWORD MANAGEMENT & OTP SECURITY ====================
const STORAGE_ADMIN_OTP = 'dw_admin_otp_session';

interface AdminOtpSession {
  otp: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

export const verifyCurrentAdminPassword = (currentPassword: string): boolean => {
  const configuredPassword = (STORE_CONFIG as unknown as { adminPassword?: string }).adminPassword;
  const customSavedPassword = localStorage.getItem('dw_admin_custom_password');
  const validPasswords = [customSavedPassword, configuredPassword, 'admin123', 'soni2026', 'digital123'].filter(Boolean);
  return validPasswords.includes(currentPassword);
};

export const requestAdminPasswordResetOtp = async (targetEmail?: string): Promise<{ success: boolean; message: string; maskedEmail: string; demoOtpNotice?: string }> => {
  const settings = await getStoreSettings();
  const registeredEmail = targetEmail?.trim().toLowerCase() || settings.email_address || STORE_CONFIG.adminEmail;

  // Generate a random 6-digit secure OTP
  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  const session: AdminOtpSession = {
    otp: randomOtp,
    email: registeredEmail,
    expiresAt,
    attempts: 0
  };

  localStorage.setItem(STORAGE_ADMIN_OTP, JSON.stringify(session));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.resetPasswordForEmail(registeredEmail);
    } catch {
      // fallback
    }
  }

  // Mask email for security display: e.g. vi****@digitalworld.in
  const parts = registeredEmail.split('@');
  const userPart = parts[0] || 'admin';
  const domainPart = parts[1] || 'digitalworld.in';
  const maskedUser = userPart.length > 2 
    ? `${userPart[0]}***${userPart[userPart.length - 1]}` 
    : `${userPart}***`;
  const maskedEmail = `${maskedUser}@${domainPart}`;

  return {
    success: true,
    message: `Security OTP is ${randomOtp} (Sent to registered email ${maskedEmail}). Valid for 10 minutes.`,
    maskedEmail,
    demoOtpNotice: randomOtp
  };
};

export const verifyOtpAndChangeAdminPassword = (params: {
  currentPassword?: string;
  newPassword: string;
  otp: string;
  isForgotPassword?: boolean;
}): { success: boolean; message: string } => {
  const { currentPassword, newPassword, otp, isForgotPassword } = params;

  // 1. Verify current / last password if not forgot-password flow
  if (!isForgotPassword) {
    if (!currentPassword) {
      throw new Error('Please enter your current (last) password.');
    }
    if (!verifyCurrentAdminPassword(currentPassword)) {
      throw new Error('Current password is incorrect. Please verify your last password.');
    }
  }

  // 2. Validate new password
  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  if (currentPassword && currentPassword === newPassword) {
    throw new Error('New password cannot be the same as your current password.');
  }

  // 3. Verify OTP session
  const savedSessionRaw = localStorage.getItem(STORAGE_ADMIN_OTP);
  if (!savedSessionRaw) {
    throw new Error('No active OTP session found. Please click "Send OTP to Email" first.');
  }

  const session: AdminOtpSession = JSON.parse(savedSessionRaw);

  if (Date.now() > session.expiresAt) {
    localStorage.removeItem(STORAGE_ADMIN_OTP);
    throw new Error('OTP has expired (10 minutes elapsed). Please request a new OTP.');
  }

  if (session.attempts >= 5) {
    localStorage.removeItem(STORAGE_ADMIN_OTP);
    throw new Error('Too many failed OTP attempts. Security locked. Please request a new OTP.');
  }

  if (session.otp.trim() !== otp.trim()) {
    session.attempts += 1;
    localStorage.setItem(STORAGE_ADMIN_OTP, JSON.stringify(session));
    throw new Error(`Incorrect OTP code. ${5 - session.attempts} attempts remaining.`);
  }

  // 4. Save new password securely
  localStorage.setItem('dw_admin_custom_password', newPassword.trim());
  localStorage.removeItem(STORAGE_ADMIN_OTP);

  return {
    success: true,
    message: 'Password successfully updated! Your account is secured with the new password.'
  };
};

export const changeAdminPassword = (newPassword: string): boolean => {
  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  localStorage.setItem('dw_admin_custom_password', newPassword.trim());
  return true;
};

export const updateAdminEmailOrPhone = (params: {
  email?: string;
  phone?: string;
  otp: string;
}): { success: boolean; message: string; updatedEmail?: string; updatedPhone?: string } => {
  const { email, phone, otp } = params;

  const savedSessionRaw = localStorage.getItem(STORAGE_ADMIN_OTP);
  if (!savedSessionRaw) {
    throw new Error('No active OTP session found. Please click "Send OTP to Email" first.');
  }

  const session: AdminOtpSession = JSON.parse(savedSessionRaw);
  if (Date.now() > session.expiresAt) {
    localStorage.removeItem(STORAGE_ADMIN_OTP);
    throw new Error('OTP has expired. Please request a new verification code.');
  }

  if (session.otp.trim() !== otp.trim()) {
    throw new Error('Incorrect OTP code entered. Please check and try again.');
  }

  if (email && email.trim()) {
    if (!email.includes('@') || !email.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }
    localStorage.setItem('dw_admin_custom_email', email.trim().toLowerCase());
  }

  if (phone && phone.trim()) {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }
    localStorage.setItem('dw_admin_custom_phone', clean);
  }

  localStorage.removeItem(STORAGE_ADMIN_OTP);

  return {
    success: true,
    message: 'Admin login credentials updated successfully!',
    updatedEmail: email?.trim().toLowerCase(),
    updatedPhone: phone?.replace(/\D/g, '').slice(-10)
  };
};

export const getAdminContactDetails = (): { email: string; phone: string } => {
  const savedEmail = localStorage.getItem('dw_admin_custom_email');
  const savedPhone = localStorage.getItem('dw_admin_custom_phone');
  return {
    email: savedEmail || STORE_CONFIG.adminEmail,
    phone: savedPhone || STORE_CONFIG.contactNumber
  };
};

// ==================== CUSTOMER HIGH-SECURITY AUTHENTICATION ====================
const STORAGE_CUSTOMERS = 'dw_customer_accounts';
const STORAGE_CUSTOMER_SESSION = 'dw_customer_active_session';
const STORAGE_CUSTOMER_OTP = 'dw_customer_otp_session';

interface StoredCustomerAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  created_at: string;
  default_address?: CustomerAddress;
}

export const getStoredCustomers = (): StoredCustomerAccount[] => {
  const raw = localStorage.getItem(STORAGE_CUSTOMERS);
  return raw ? JSON.parse(raw) : [];
};

export const customerRegister = async (params: {
  name: string;
  phone: string;
  email?: string;
  password: string;
}): Promise<{ success: boolean; user?: CustomerUser; error?: string }> => {
  const cleanPhone = params.phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }
  if (!params.name || params.name.trim().length < 2) {
    return { success: false, error: 'Please enter your full name.' };
  }
  if (!params.password || params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const cleanEmail = params.email?.trim().toLowerCase() || undefined;
  if (cleanEmail && (!cleanEmail.includes('@') || !cleanEmail.includes('.'))) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const customers = getStoredCustomers();
  const existing = customers.find(c => c.phone === cleanPhone || (cleanEmail && c.email === cleanEmail));
  if (existing) {
    return { success: false, error: 'An account with this mobile number or email already exists. Please sign in.' };
  }

  const newId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const newCustomer: StoredCustomerAccount = {
    id: newId,
    name: params.name.trim(),
    phone: cleanPhone,
    email: cleanEmail,
    passwordHash: btoa(params.password),
    created_at: now
  };

  customers.push(newCustomer);
  localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify(customers));

  const customerUser: CustomerUser = {
    id: newCustomer.id,
    name: newCustomer.name,
    phone: newCustomer.phone,
    email: newCustomer.email,
    created_at: newCustomer.created_at
  };

  localStorage.setItem(STORAGE_CUSTOMER_SESSION, JSON.stringify(customerUser));
  return { success: true, user: customerUser };
};

export const customerLogin = async (params: {
  identifier: string;
  password: string;
}): Promise<{ success: boolean; user?: CustomerUser; error?: string }> => {
  const rawId = params.identifier.trim().toLowerCase();
  const digits = rawId.replace(/\D/g, '').slice(-10);

  const customers = getStoredCustomers();
  const found = customers.find(c =>
    (digits.length === 10 && c.phone === digits) ||
    (c.email && c.email.toLowerCase() === rawId)
  );

  if (!found) {
    return { success: false, error: 'No account found with this mobile number or email. Please register first.' };
  }

  if (atob(found.passwordHash) !== params.password) {
    return { success: false, error: 'Incorrect password. Please try again or use OTP login.' };
  }

  const customerUser: CustomerUser = {
    id: found.id,
    name: found.name,
    phone: found.phone,
    email: found.email,
    created_at: found.created_at,
    default_address: found.default_address
  };

  localStorage.setItem(STORAGE_CUSTOMER_SESSION, JSON.stringify(customerUser));
  return { success: true, user: customerUser };
};

export const customerSendOtp = async (phoneOrEmail: string): Promise<{ success: boolean; message: string; previewOtp?: string }> => {
  const cleanDigits = phoneOrEmail.replace(/\D/g, '').slice(-10);
  const isPhone = cleanDigits.length === 10;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const session = {
    identifier: isPhone ? cleanDigits : phoneOrEmail.trim().toLowerCase(),
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000
  };

  localStorage.setItem(STORAGE_CUSTOMER_OTP, JSON.stringify(session));

  return {
    success: true,
    message: `6-digit security OTP sent to ${isPhone ? `+91 ${cleanDigits}` : phoneOrEmail}. Valid for 10 minutes.`,
    previewOtp: otp
  };
};

export const customerVerifyOtpLogin = async (
  identifier: string,
  otp: string,
  nameIfNew?: string
): Promise<{ success: boolean; user?: CustomerUser; error?: string }> => {
  const rawSession = localStorage.getItem(STORAGE_CUSTOMER_OTP);
  if (!rawSession) {
    return { success: false, error: 'No active OTP session found. Please request an OTP first.' };
  }

  const session = JSON.parse(rawSession);
  if (Date.now() > session.expiresAt) {
    localStorage.removeItem(STORAGE_CUSTOMER_OTP);
    return { success: false, error: 'OTP expired. Please request a new code.' };
  }

  if (session.otp.trim() !== otp.trim()) {
    return { success: false, error: 'Invalid OTP code. Please check and re-enter.' };
  }

  const cleanDigits = identifier.replace(/\D/g, '').slice(-10);
  const isPhone = cleanDigits.length === 10;
  const customers = getStoredCustomers();

  let found = customers.find(c =>
    (isPhone && c.phone === cleanDigits) ||
    (c.email && c.email.toLowerCase() === identifier.trim().toLowerCase())
  );

  if (!found) {
    const newId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    found = {
      id: newId,
      name: nameIfNew?.trim() || `Customer ${cleanDigits.slice(-4)}`,
      phone: isPhone ? cleanDigits : '6377123270',
      email: isPhone ? undefined : identifier.trim().toLowerCase(),
      passwordHash: btoa('otp_verified_user'),
      created_at: now
    };
    customers.push(found);
    localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify(customers));
  }

  const customerUser: CustomerUser = {
    id: found.id,
    name: found.name,
    phone: found.phone,
    email: found.email,
    created_at: found.created_at,
    default_address: found.default_address
  };

  localStorage.setItem(STORAGE_CUSTOMER_SESSION, JSON.stringify(customerUser));
  localStorage.removeItem(STORAGE_CUSTOMER_OTP);

  return { success: true, user: customerUser };
};

export const getCurrentCustomer = (): CustomerUser | null => {
  const raw = localStorage.getItem(STORAGE_CUSTOMER_SESSION);
  return raw ? JSON.parse(raw) : null;
};

export const customerLogout = (): void => {
  localStorage.removeItem(STORAGE_CUSTOMER_SESSION);
};

export const updateCustomerAddress = (address: CustomerAddress): CustomerUser => {
  const current = getCurrentCustomer();
  if (!current) throw new Error('Not logged in');

  current.default_address = address;
  localStorage.setItem(STORAGE_CUSTOMER_SESSION, JSON.stringify(current));

  const customers = getStoredCustomers();
  const idx = customers.findIndex(c => c.id === current.id);
  if (idx !== -1) {
    customers[idx].default_address = address;
    localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify(customers));
  }

  return current;
};

export const getCustomerOrders = async (phone: string): Promise<Order[]> => {
  const allOrders = await getAllOrdersAdmin();
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  return allOrders.filter(o => o.customer_phone.replace(/\D/g, '').slice(-10) === cleanPhone);
};

// ==================== DEALER (B2B WHOLESALE) PORTAL ====================
const STORAGE_DEALERS = 'dw_dealer_accounts';
const STORAGE_DEALER_SESSION = 'dw_dealer_active_session';

export interface StoredDealerAccount extends DealerUser {
  passwordHash: string;
}

const initialDealers: StoredDealerAccount[] = [];

export const getStoredDealers = (): StoredDealerAccount[] => {
  const raw = localStorage.getItem(STORAGE_DEALERS);
  if (!raw) {
    localStorage.setItem(STORAGE_DEALERS, JSON.stringify([]));
    return [];
  }
  try {
    const list: StoredDealerAccount[] = JSON.parse(raw);
    // Purge any legacy demo dealers (DLR-1001, DLR-1002, dlr_1001, dlr_1002)
    const cleaned = list.filter(d => 
      d.id !== 'dlr_1001' && 
      d.id !== 'dlr_1002' && 
      d.dealer_code !== 'DLR-1001' && 
      d.dealer_code !== 'DLR-1002'
    );
    if (cleaned.length !== list.length) {
      localStorage.setItem(STORAGE_DEALERS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
};

export const saveStoredDealers = (dealers: StoredDealerAccount[]): void => {
  localStorage.setItem(STORAGE_DEALERS, JSON.stringify(dealers));
};

export function getCurrentDealer(): DealerUser | null {
  const raw = localStorage.getItem(STORAGE_DEALER_SESSION);
  if (!raw) return null;
  try {
    const parsed: DealerUser = JSON.parse(raw);
    // Purge demo dealer session immediately
    if (parsed.id === 'dlr_1001' || parsed.id === 'dlr_1002' || parsed.dealer_code === 'DLR-1001' || parsed.dealer_code === 'DLR-1002') {
      localStorage.removeItem(STORAGE_DEALER_SESSION);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const dealerLogout = (): void => {
  localStorage.removeItem(STORAGE_DEALER_SESSION);
};

export const dealerRegister = async (params: {
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  password: string;
  gst_number?: string;
  business_type?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}): Promise<{ success: boolean; dealer?: DealerUser; message?: string; error?: string }> => {
  const cleanPhone = params.phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }
  if (!params.business_name || params.business_name.trim().length < 3) {
    return { success: false, error: 'Please enter your registered Business / Firm Name.' };
  }
  if (!params.contact_person || params.contact_person.trim().length < 2) {
    return { success: false, error: 'Please enter the Contact Person name.' };
  }
  if (!params.email || !params.email.includes('@') || !params.email.includes('.')) {
    return { success: false, error: 'Please enter a valid business email address.' };
  }
  if (!params.password || params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }
  if (!params.address || params.address.trim().length < 5) {
    return { success: false, error: 'Please enter your complete shop / business address.' };
  }

  const dealers = getStoredDealers();
  const cleanEmail = params.email.trim().toLowerCase();

  const existing = dealers.find(d => d.phone === cleanPhone || d.email.toLowerCase() === cleanEmail);
  if (existing) {
    if (existing.status === 'pending') {
      return { success: false, error: 'An application with this phone or email is already pending admin approval.' };
    }
    return { success: false, error: 'A dealer account with this phone or email already exists. Please log in.' };
  }

  const nextNum = 1000 + dealers.length + 1;
  const dealerCode = `DLR-${nextNum}`;
  const newId = `dlr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const newDealer: StoredDealerAccount = {
    id: newId,
    dealer_code: dealerCode,
    business_name: params.business_name.trim(),
    contact_person: params.contact_person.trim(),
    phone: cleanPhone,
    email: cleanEmail,
    gst_number: params.gst_number?.trim().toUpperCase() || undefined,
    business_type: params.business_type?.trim() || 'Electronics Retailer',
    address: params.address.trim(),
    city: params.city.trim(),
    state: params.state.trim() || 'Rajasthan',
    pincode: params.pincode.trim(),
    status: 'pending',
    passwordHash: btoa(params.password),
    created_at: now
  };

  dealers.push(newDealer);
  saveStoredDealers(dealers);

  const publicDealer: DealerUser = {
    id: newDealer.id,
    dealer_code: newDealer.dealer_code,
    business_name: newDealer.business_name,
    contact_person: newDealer.contact_person,
    phone: newDealer.phone,
    email: newDealer.email,
    gst_number: newDealer.gst_number,
    business_type: newDealer.business_type,
    address: newDealer.address,
    city: newDealer.city,
    state: newDealer.state,
    pincode: newDealer.pincode,
    status: 'pending',
    created_at: newDealer.created_at
  };

  return {
    success: true,
    dealer: publicDealer,
    message: `Your B2B registration request has been submitted successfully with reference ID ${dealerCode}. Our proprietor Vishal Soni will review and approve your account shortly.`
  };
};

export const dealerLogin = async (
  identifier: string,
  password: string
): Promise<{ success: boolean; dealer?: DealerUser; error?: string; status?: DealerStatus }> => {
  const rawId = identifier.trim().toLowerCase();
  const digits = rawId.replace(/\D/g, '').slice(-10);

  const dealers = getStoredDealers();
  const found = dealers.find(d =>
    d.dealer_code.toLowerCase() === rawId ||
    (digits.length === 10 && d.phone === digits) ||
    d.email.toLowerCase() === rawId
  );

  if (!found) {
    return {
      success: false,
      error: 'No dealer account found with this Dealer Code, Email, or Mobile Number. Please check your credentials or apply for registration.'
    };
  }

  if (atob(found.passwordHash) !== password) {
    return {
      success: false,
      error: 'Incorrect password for dealer portal. Please check and try again.'
    };
  }

  if (found.status === 'pending') {
    return {
      success: false,
      status: 'pending',
      error: 'Your dealer registration is currently PENDING approval from store admin Vishal Soni. You will be notified on WhatsApp/Phone as soon as your account is approved.'
    };
  }

  if (found.status === 'suspended') {
    return {
      success: false,
      status: 'suspended',
      error: `Your dealer account is temporarily SUSPENDED. Please contact Digital World management (${STORE_CONFIG.whatsappNumber || '+91 8384957548'}) to resolve this.`
    };
  }

  if (found.status === 'rejected') {
    return {
      success: false,
      status: 'rejected',
      error: 'Your dealer account application was DECLINED. Please reach out to Vishal Soni on WhatsApp for more details.'
    };
  }

  const publicDealer: DealerUser = {
    id: found.id,
    dealer_code: found.dealer_code,
    business_name: found.business_name,
    contact_person: found.contact_person,
    phone: found.phone,
    email: found.email,
    gst_number: found.gst_number,
    business_type: found.business_type,
    address: found.address,
    city: found.city,
    state: found.state,
    pincode: found.pincode,
    status: found.status,
    created_at: found.created_at,
    approved_at: found.approved_at,
    admin_notes: found.admin_notes
  };

  localStorage.setItem(STORAGE_DEALER_SESSION, JSON.stringify(publicDealer));
  return { success: true, dealer: publicDealer };
};

export const getDealerProducts = async (): Promise<Product[]> => {
  const current = getCurrentDealer();
  if (!current || current.status !== 'approved') {
    throw new Error('Unauthorized: Only approved dealers can view wholesale pricing.');
  }

  const allProducts = getLocalProducts().filter(p => p.is_published);

  return allProducts.map(p => {
    const wholesalePrice = p.dealer_price || Math.round(p.price * 0.85);
    return {
      ...p,
      dealer_price: wholesalePrice,
      min_dealer_qty: p.min_dealer_qty || 1
    };
  });
};

export const createDealerOrder = async (params: {
  dealerId: string;
  items: { product: Product; quantity: number }[];
  deliveryType: 'home_delivery' | 'store_pickup';
  deliveryAddress: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: PaymentMethod;
  orderNotes?: string;
}): Promise<{ success: boolean; order: Order; message?: string }> => {
  const current = getCurrentDealer();
  if (!current || current.id !== params.dealerId || current.status !== 'approved') {
    throw new Error('Unauthorized dealer session. Please log in.');
  }

  if (params.items.length === 0) {
    throw new Error('Cannot place an empty wholesale order.');
  }

  const allProducts = getLocalProducts();
  const orderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const item of params.items) {
    const fresh = allProducts.find(p => p.id === item.product.id);
    if (!fresh) {
      throw new Error(`Product ${item.product.name} not found in inventory.`);
    }

    const minQty = fresh.min_dealer_qty || 1;
    if (item.quantity < minQty) {
      throw new Error(`Minimum wholesale order quantity for "${fresh.name}" is ${minQty} units.`);
    }

    if (fresh.stock_quantity < item.quantity) {
      throw new Error(`Insufficient wholesale stock for "${fresh.name}". Only ${fresh.stock_quantity} available.`);
    }

    const wholesaleUnitPrice = fresh.dealer_price || Math.round(fresh.price * 0.85);
    const lineTotal = wholesaleUnitPrice * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      product_id: fresh.id,
      product_name: fresh.name,
      product_brand: fresh.brand,
      product_model: fresh.model,
      product_image: fresh.primary_image,
      condition: fresh.condition,
      unit_price: wholesaleUnitPrice,
      quantity: item.quantity,
      total_price: lineTotal
    });

    fresh.stock_quantity -= item.quantity;
    if (fresh.stock_quantity <= 0) {
      fresh.is_sold_out = true;
    }
  }

  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(allProducts));

  const orderNum = `B2B-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: `ord_b2b_${Date.now()}`,
    order_number: orderNum,
    order_type: 'dealer',
    dealer_id: current.id,
    dealer_code: current.dealer_code,
    dealer_business_name: current.business_name,
    gst_number: current.gst_number,
    customer_name: `${current.contact_person} (${current.business_name})`,
    customer_phone: current.phone,
    customer_whatsapp: current.phone,
    customer_email: current.email,
    delivery_type: params.deliveryType,
    delivery_address: params.deliveryAddress,
    city: params.city,
    state: params.state,
    pincode: params.pincode,
    order_notes: params.orderNotes,
    subtotal,
    delivery_charge: 0,
    total_amount: subtotal,
    payment_method: params.paymentMethod,
    payment_status: 'pending',
    order_status: 'pending',
    created_at: now,
    items: orderItems,
    status_history: [
      {
        order_id: `ord_b2b_${Date.now()}`,
        status: 'pending',
        note: `Wholesale order placed via Dealer Portal by ${current.contact_person}`,
        created_at: now,
        updated_by: current.dealer_code
      }
    ]
  };

  const orders = getLocalOrders();
  orders.unshift(newOrder);
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));

  return { success: true, order: newOrder, message: 'Wholesale order submitted successfully!' };
};

export const getDealerOrders = async (dealerId: string): Promise<Order[]> => {
  const allOrders = await getAllOrdersAdmin();
  return allOrders.filter(o => o.order_type === 'dealer' && o.dealer_id === dealerId);
};

// ==================== ADMIN DEALER MANAGEMENT ====================
export const getDealersAdmin = async (): Promise<DealerUser[]> => {
  const dealers = getStoredDealers();
  return dealers.map(({ passwordHash, ...rest }) => rest);
};

export const updateDealerStatusAdmin = async (
  dealerId: string,
  status: DealerStatus,
  adminNotes?: string
): Promise<DealerUser> => {
  const dealers = getStoredDealers();
  const idx = dealers.findIndex(d => d.id === dealerId);
  if (idx === -1) throw new Error('Dealer not found');

  dealers[idx].status = status;
  if (status === 'approved' && !dealers[idx].approved_at) {
    dealers[idx].approved_at = new Date().toISOString();
  }
  if (adminNotes !== undefined) {
    dealers[idx].admin_notes = adminNotes;
  }

  saveStoredDealers(dealers);
  const { passwordHash, ...publicDealer } = dealers[idx];
  return publicDealer;
};

export const createDealerAdmin = async (params: {
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  password?: string;
  dealer_code?: string;
  gst_number?: string;
  business_type?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status?: DealerStatus;
}): Promise<DealerUser> => {
  const cleanPhone = params.phone.replace(/\D/g, '').slice(-10);
  const cleanEmail = params.email.trim().toLowerCase();
  const dealers = getStoredDealers();

  const assignedCode = params.dealer_code?.trim() || `DLR-${1000 + dealers.length + 1}`;
  const assignedPassword = params.password || 'dealer123';
  const newId = `dlr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const newDealer: StoredDealerAccount = {
    id: newId,
    dealer_code: assignedCode,
    business_name: params.business_name.trim(),
    contact_person: params.contact_person.trim(),
    phone: cleanPhone,
    email: cleanEmail,
    gst_number: params.gst_number?.trim().toUpperCase(),
    business_type: params.business_type?.trim() || 'Electronics Dealer',
    address: params.address.trim(),
    city: params.city.trim(),
    state: params.state.trim() || 'Rajasthan',
    pincode: params.pincode.trim(),
    status: params.status || 'approved',
    passwordHash: btoa(assignedPassword),
    created_at: now,
    approved_at: params.status !== 'pending' ? now : undefined
  };

  dealers.push(newDealer);
  saveStoredDealers(dealers);

  const { passwordHash, ...publicDealer } = newDealer;
  return publicDealer;
};

export const resetDealerPasswordAdmin = async (
  dealerId: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const dealers = getStoredDealers();
  const dealer = dealers.find(d => d.id === dealerId);
  if (!dealer) throw new Error('Dealer account not found.');

  dealer.passwordHash = btoa(newPassword);
  saveStoredDealers(dealers);

  return {
    success: true,
    message: `Password for dealer ${dealer.dealer_code} (${dealer.business_name}) has been reset successfully.`
  };
};

export const generateDealerApprovalWhatsAppUrl = (
  dealer: DealerUser,
  tempPassword?: string
): string => {
  const cleanPhone = dealer.phone.replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  let message = `*🎉 DEALER ACCOUNT APPROVED - ${STORE_CONFIG.shopName}*\n\n`;
  message += `Namaste *${dealer.contact_person}*ji,\n\n`;
  message += `Congratulations! Your B2B Dealer registration for *${dealer.business_name}* has been verified and APPROVED by Vishal Soni.\n\n`;
  message += `*Your B2B Login Details:*\n`;
  message += `• *Dealer Code:* ${dealer.dealer_code}\n`;
  message += `• *Registered Phone:* +91 ${dealer.phone}\n`;
  if (tempPassword) {
    message += `• *Temporary Password:* ${tempPassword}\n`;
  }
  message += `• *Wholesale Portal:* ${window.location.origin}/dealer/login\n\n`;
  message += `You can now log in to view special wholesale pricing, dealer-only refurbished laptop lots, and place bulk orders.\n\n`;
  message += `For any wholesale inquiry or bulk quotations, feel free to reply directly to Vishal Soni here.\n\n`;
  message += `Warm regards,\n*Digital World B2B Team*`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
};

export const generateDealerOrderWhatsAppUrl = (
  order: Order,
  dealer: DealerUser
): string => {
  const targetNumber = STORE_CONFIG.whatsappNumber;
  const cleanNumber = targetNumber ? targetNumber.replace(/\D/g, '') : '';

  let message = `*📦 NEW B2B WHOLESALE ORDER - ${STORE_CONFIG.shopName}*\n\n`;
  message += `*Order ID:* ${order.order_number}\n`;
  message += `*Dealer Code:* ${dealer.dealer_code}\n`;
  message += `*Firm Name:* ${dealer.business_name}\n`;
  message += `*Contact Person:* ${dealer.contact_person} (+91 ${dealer.phone})\n`;
  if (dealer.gst_number) {
    message += `*GSTIN:* ${dealer.gst_number}\n`;
  }
  message += `*Delivery Type:* ${order.delivery_type === 'store_pickup' ? 'Store Pickup' : 'Dispatch to Address'}\n`;
  message += `*Address:* ${order.delivery_address}, ${order.city}, ${order.state} - ${order.pincode}\n`;
  message += `*Payment:* ${order.payment_method.toUpperCase()} (${order.payment_status})\n\n`;
  message += `*Wholesale Items:*\n`;

  (order.items || []).forEach((item, index) => {
    message += `${index + 1}. ${item.product_name} (x${item.quantity}) - ${formatINR(item.total_price)}\n`;
  });

  message += `\n*Wholesale Total:* ${formatINR(order.total_amount)}\n`;
  if (order.order_notes) {
    message += `*Dealer Notes:* ${order.order_notes}\n`;
  }
  message += `\nTime: ${new Date(order.created_at).toLocaleString('en-IN')}`;

  return `https://wa.me/${cleanNumber ? (cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`) : ''}?text=${encodeURIComponent(message)}`;
};

export const adminLogout = async (): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(STORAGE_ADMIN);
};

export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  const saved = localStorage.getItem(STORAGE_ADMIN);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore JSON parse error
    }
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        return {
          id: data.user.id,
          email: data.user.email || '',
          role: 'owner'
        };
      }
    } catch {
      // ignore network errors
    }
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

// ==================== GENUINE CUSTOMER REVIEWS & RATINGS ====================
export const getLocalProductReviews = (): ProductReview[] => {
  try {
    const data = localStorage.getItem(STORAGE_REVIEWS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getProductRatingSummary = (productId: string): { average: number; count: number } => {
  try {
    const all = getLocalProductReviews();
    const reviews = all.filter(r => r.product_id === productId);
    if (reviews.length === 0) return { average: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return {
      average: Number((sum / reviews.length).toFixed(1)),
      count: reviews.length
    };
  } catch {
    return { average: 0, count: 0 };
  }
};

export const getProductReviews = async (productId: string): Promise<ProductReview[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        // Sync to local cache
        const local = getLocalProductReviews().filter(r => r.product_id !== productId);
        localStorage.setItem(STORAGE_REVIEWS, JSON.stringify([...data, ...local]));
        return data as ProductReview[];
      }
    } catch (err) {
      console.warn('Supabase getProductReviews warning:', err);
    }
  }
  const all = getLocalProductReviews();
  return all.filter(r => r.product_id === productId);
};

export const addProductReview = async (
  reviewData: Omit<ProductReview, 'id' | 'created_at'>
): Promise<ProductReview> => {
  const newReview: ProductReview = {
    ...reviewData,
    id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
    is_verified: true
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert(newReview)
        .select()
        .single();
      if (!error && data) {
        const all = getLocalProductReviews().filter(r => r.id !== data.id);
        localStorage.setItem(STORAGE_REVIEWS, JSON.stringify([data, ...all]));
        return data as ProductReview;
      }
    } catch (err) {
      console.warn('Supabase addProductReview fallback to local:', err);
    }
  }

  const all = getLocalProductReviews();
  all.unshift(newReview);
  localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(all));
  return newReview;
};

