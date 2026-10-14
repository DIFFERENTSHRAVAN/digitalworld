import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import { getProducts, getCategories } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Laptop,
  Sparkles
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [selectedCondition, setSelectedCondition] = useState<'all' | 'new' | 'second_hand'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Pagination / Load more
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Sync category param with filter state
  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
  }, [categorySlug]);

  // Sync search param with filter state
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts()
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Compute available unique brands from actual inventory
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Map category slug to id if needed
  const selectedCatId = useMemo(() => {
    if (selectedCategory === 'all') return 'all';
    if (selectedCategory === 'second-hand-laptops' || selectedCategory === 'refurbished-laptops') {
      const match = categories.find(c => c.slug === 'refurbished-laptops' || c.slug === 'second-hand-laptops' || c.id === 'c1');
      if (match) return match.id;
    }
    const match = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);
    return match ? match.id : selectedCategory;
  }, [selectedCategory, categories]);

  // Client-side filtering with full reactivity
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category filter
      if (selectedCatId !== 'all') {
        const categoryMatch = product.category_id === selectedCatId || product.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
        if (!categoryMatch) return false;
      }

      // 2. Condition filter
      if (selectedCondition !== 'all' && product.condition !== selectedCondition) {
        return false;
      }

      // 3. Brand filter
      if (selectedBrand !== 'all' && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // 4. In Stock filter
      if (inStockOnly && (product.stock_quantity <= 0 || product.is_sold_out || product.is_reserved)) {
        return false;
      }

      // 5. Min / Max Price
      const min = minPrice ? parseFloat(minPrice) : null;
      const max = maxPrice ? parseFloat(maxPrice) : null;
      if (min !== null && product.price < min) return false;
      if (max !== null && product.price > max) return false;

      // 6. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesModel = product.model.toLowerCase().includes(query);
        const matchesCpu = product.processor?.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesPid = product.pid?.toLowerCase().includes(query);
        const matchesItemCode = product.item_code?.toLowerCase().includes(query);

        if (!matchesName && !matchesBrand && !matchesModel && !matchesCpu && !matchesDesc && !matchesPid && !matchesItemCode) {
          return false;
        }
      }

      // 7. URL collection filter
      const collectionFilter = searchParams.get('filter');
      if (collectionFilter === 'updated' && !product.is_updated_product) {
        return false;
      }
      if (collectionFilter === 'new_arrival' && !product.is_new_arrival) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [products, selectedCatId, selectedCategory, selectedCondition, selectedBrand, inStockOnly, minPrice, maxPrice, searchQuery, sortBy]);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedCondition('all');
    setSelectedBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  const currentCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return 'All Electronics & Hardware';
    const cat = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);
    return cat ? cat.name : 'Category Catalog';
  }, [selectedCategory, categories]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-charcoal-muted mb-1">
            <span>Home</span>
            <span>/</span>
            <span>Catalog</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-secondary font-semibold">{currentCategoryName}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">
            {currentCategoryName}
          </h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Showing {filteredProducts.length} verified products available from Digital World
          </p>
        </div>

        {/* Filter Drawer Toggle on Mobile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter & Sort</span>
          </button>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-charcoal-muted hidden sm:inline">{t('sortBy')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_asc' | 'price_desc')}
              className="px-3 py-2 bg-surface-muted border border-slate-300 rounded-xl text-xs font-semibold text-charcoal focus:bg-white focus:border-secondary"
            >
              <option value="newest">{t('sortNewest')}</option>
              <option value="price_asc">{t('sortPriceAsc')}</option>
              <option value="price_desc">{t('sortPriceDesc')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main layout: Sidebar filters + Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden md:block md:col-span-1 lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-sm text-primary">
              <Filter className="w-4 h-4 text-secondary" />
              <span>{t('filters')}</span>
            </div>
            {(selectedCategory !== 'all' || selectedCondition !== 'all' || selectedBrand !== 'all' || minPrice || maxPrice || inStockOnly || searchQuery) && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-semibold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search in Catalog */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Product, brand, CPU..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface-muted border border-slate-300 rounded-xl text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal">Condition</label>
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  checked={selectedCondition === 'all'}
                  onChange={() => setSelectedCondition('all')}
                  className="text-secondary focus:ring-secondary"
                />
                <span>All Conditions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-700">
                <input
                  type="radio"
                  name="condition"
                  checked={selectedCondition === 'second_hand'}
                  onChange={() => setSelectedCondition('second_hand')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>{t('conditionSecondHand')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-blue-700">
                <input
                  type="radio"
                  name="condition"
                  checked={selectedCondition === 'new'}
                  onChange={() => setSelectedCondition('new')}
                  className="text-secondary focus:ring-secondary"
                />
                <span>Brand New</span>
              </label>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal">Categories</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white font-bold'
                    : 'text-charcoal hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors cursor-pointer truncate ${
                    selectedCategory === cat.slug || selectedCategory === cat.id
                      ? 'bg-primary text-white font-bold'
                      : 'text-charcoal hover:bg-slate-100'
                  }`}
                  title={cat.name}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          {availableBrands.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-muted border border-slate-300 rounded-xl text-xs text-charcoal"
              >
                <option value="all">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal">Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-muted border border-slate-300 rounded-xl text-xs"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-muted border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* In Stock Only Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-secondary focus:ring-secondary"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <main className="md:col-span-3 lg:col-span-4 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-charcoal">No products match your criteria</h3>
              <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                Try widening your price range, clearing brand/category filters, or searching for a general keyword.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-light transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.slice(0, visibleCount).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < filteredProducts.length && (
                <div className="pt-6 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="px-8 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-charcoal font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Load More Products ({filteredProducts.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MOBILE FILTER MODAL */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs md:hidden animate-fade-in">
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-base text-primary">
                <SlidersHorizontal className="w-5 h-5 text-secondary" />
                <span>Filters & Sorting</span>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-charcoal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Condition on Mobile */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal">Condition</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['all', 'second_hand', 'new'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCondition(c as 'all' | 'new' | 'second_hand')}
                    className={`py-2 px-2 rounded-xl border text-center font-semibold capitalize ${
                      selectedCondition === c
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-muted text-charcoal border-slate-200'
                    }`}
                  >
                    {c === 'all' ? 'All' : c === 'second_hand' ? 'Used Laptop' : 'Brand New'}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories on Mobile */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-surface-muted border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price inputs on Mobile */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-muted border border-slate-300 rounded-xl text-xs"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-muted border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* In stock toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-secondary focus:ring-secondary w-4 h-4"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-3 border border-slate-300 rounded-xl text-xs font-bold text-charcoal"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold"
              >
                Show Results ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
