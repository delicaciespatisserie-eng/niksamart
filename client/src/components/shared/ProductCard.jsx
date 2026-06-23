import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { addToCart } from '../../store/slices/cartSlice';

const ProductCard = ({ product, isLoading }) => {
  const dispatch = useDispatch();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm animate-pulse">
        <div className="aspect-[4/5] bg-gray-200 rounded-xl mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  const discount = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Assuming RTK slice logic handles the actual cart state
    // dispatch(addToCart(product));
    toast.success('Added to cart');
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-navy/5 transition-all duration-300 relative flex flex-col h-full">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            {discount}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-gold text-navy text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            Featured
          </span>
        )}
      </div>

      <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm">
        <FiHeart size={16} />
      </button>

      <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
        <img 
          src={product.thumbnail || product.images?.[0] || 'https://placehold.co/400x500/f8f9fa/ccc?text=Product'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-navy text-white px-4 py-2 font-bold uppercase tracking-widest text-sm rounded-lg">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="text-[11px] font-semibold text-gold uppercase tracking-wider mb-1 truncate">
          {product.vendorId?.shopName || 'Niksa Mart'}
        </div>
        
        <Link to={`/product/${product.slug}`} className="font-semibold text-gray-800 leading-snug mb-2 hover:text-navy transition-colors line-clamp-2">
          {product.name}
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <FiStar className="text-gold" fill={product.rating > 0 ? "currentColor" : "none"} size={14} />
          <span className="text-xs font-medium text-gray-600">{product.rating || 'New'}</span>
          <span className="text-xs text-gray-400 ml-1">({product.totalReviews || 0})</span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-navy">₹{product.price?.toLocaleString('en-IN')}</span>
              {product.mrp > product.price && (
                <span className="text-xs text-gray-400 line-through">₹{product.mrp?.toLocaleString('en-IN')}</span>
              )}
            </div>
            <span className="text-[10px] text-gray-400">per {product.unit || 'piece'}</span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-10 h-10 rounded-full gradient-navy text-white flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md"
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
