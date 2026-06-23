import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import api from '../../utils/axios';
import ProductCard from '../../components/shared/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [showFilters, setShowFilters] = useState(false);

  // Sync state with URL params
  const keyword = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || 'new';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const pageParam = parseInt(searchParams.get('page')) || 1;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: {
          search: keyword,
          category: categoryParam,
          sort: sortParam,
          minPrice,
          maxPrice,
          rating: ratingParam,
          page: pageParam,
          limit: 12
        }
      });
      setProducts(data.products);
      setTotalProducts(data.totalProducts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);
  }, [searchParams]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 on filter change
    if (key !== 'page') newParams.set('page', 1);
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">
            {keyword ? `Search: "${keyword}"` : categoryParam ? categoryParam : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{totalProducts} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={sortParam} 
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none bg-white"
          >
            <option value="new">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden p-2.5 rounded-xl border border-gray-200 bg-white">
            <FiFilter size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} md:block md:relative md:w-64 shrink-0`}>
          <div className="flex items-center justify-between md:hidden mb-6 pb-4 border-b">
            <h3 className="text-lg font-bold text-navy">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-50 rounded-full"><FiX size={20} /></button>
          </div>

          <div className="space-y-8">
            {/* Categories */}
            <div>
              <h4 className="font-semibold text-gray-800 text-sm mb-4 uppercase tracking-wider">Categories</h4>
              <div className="space-y-3">
                {['Ghee', 'Honey', 'Spices', 'Dry Fruits', 'Wellness', 'Oils'].map((c) => (
                  <label key={c} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-navy group">
                    <input 
                      type="radio" 
                      name="category"
                      checked={categoryParam === c}
                      onChange={() => updateFilters('category', c)}
                      className="w-4 h-4 text-navy border-gray-300 focus:ring-navy" 
                    />
                    <span className="group-hover:font-medium">{c}</span>
                  </label>
                ))}
                {categoryParam && (
                  <button onClick={() => updateFilters('category', '')} className="text-xs text-red-500 mt-2 font-medium">Clear Category</button>
                )}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 className="font-semibold text-gray-800 text-sm mb-4 uppercase tracking-wider">Price Range</h4>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={minPrice} 
                  onChange={(e) => updateFilters('minPrice', e.target.value)} 
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-navy outline-none" 
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  value={maxPrice} 
                  onChange={(e) => updateFilters('maxPrice', e.target.value)} 
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-navy outline-none" 
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="font-semibold text-gray-800 text-sm mb-4 uppercase tracking-wider">Rating</h4>
              <div className="space-y-3">
                {[4, 3, 2, 1].map((r) => (
                  <label key={r} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-navy group">
                    <input 
                      type="radio" 
                      name="rating"
                      checked={ratingParam === String(r)}
                      onChange={() => updateFilters('rating', r)}
                      className="w-4 h-4 text-navy border-gray-300 focus:ring-navy" 
                    /> 
                    <span className="flex items-center group-hover:font-medium">
                      {Array(5).fill(0).map((_, i) => (
                         <span key={i} className={i < r ? "text-gold" : "text-gray-300"}>★</span>
                      ))}
                      <span className="ml-1">& above</span>
                    </span>
                  </label>
                ))}
                {ratingParam && (
                  <button onClick={() => updateFilters('rating', '')} className="text-xs text-red-500 mt-2 font-medium">Clear Rating</button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => <ProductCard key={i} isLoading={true} />)}
             </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => <ProductCard key={p._id} product={p} isLoading={false} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 border-t border-gray-100 pt-8">
                  <button 
                    onClick={() => updateFilters('page', Math.max(1, pageParam - 1))} 
                    disabled={pageParam === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Prev
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button 
                      key={i + 1} 
                      onClick={() => updateFilters('page', i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${pageParam === i + 1 ? 'bg-navy text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => updateFilters('page', Math.min(totalPages, pageParam + 1))} 
                    disabled={pageParam === totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold text-navy mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
              <button onClick={() => setSearchParams(new URLSearchParams())} className="mt-6 text-gold font-semibold hover:text-navy transition-colors">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
