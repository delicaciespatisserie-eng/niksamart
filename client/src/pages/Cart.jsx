import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag, FiHeart, FiTag } from 'react-icons/fi';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { toggleItem } from '../store/slices/wishlistSlice';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector((s) => s.cart);
  const [coupon, setCoupon] = useState('');

  // Note: Updated GST to 5% based on requirement
  const shipping = totalPrice >= 499 ? 0 : 49;
  const tax = Math.round(totalPrice * 0.05); 
  const total = totalPrice + shipping + tax;

  const handleSaveForLater = (item) => {
    dispatch(toggleItem(item.product));
    dispatch(removeFromCart(item.product));
    toast.success('Moved to Wishlist');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-40 h-40 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-8">
          <FiShoppingBag size={64} className="text-navy opacity-50" />
        </div>
        <h2 className="text-3xl font-display font-bold text-navy mb-4">Your cart is feeling light</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">There's nothing in your cart yet. Let's add some premium wellness products to your daily routine!</p>
        <Link to="/products" className="inline-flex items-center gap-2 gradient-navy text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-navy/20">
          <FiShoppingBag size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'} in your bag</p>
        </div>
        <button onClick={() => dispatch(clearCart())} className="text-red-500 font-semibold text-sm hover:underline">Clear All</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-bold text-gray-400 uppercase tracking-wider pb-4 border-b border-gray-100">
            <div className="col-span-6">Product Details</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {items.map((item) => (
            <div key={item.product} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 hover:border-gold/30 transition-colors">
              <div className="col-span-1 md:col-span-6 flex gap-4">
                <Link to={`/product/${item.product}`} className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                  <img src={item.image || 'https://placehold.co/200x200/f8f9fa/ccc?text=Item'} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">{item.vendor?.shopName || 'Niksa Mart'}</span>
                  <Link to={`/product/${item.product}`} className="font-bold text-gray-800 hover:text-navy transition-colors line-clamp-2 leading-snug">
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-4 mt-3">
                    <button onClick={() => dispatch(removeFromCart(item.product))} className="text-sm font-medium text-red-500 hover:underline flex items-center gap-1"><FiTrash2 /> Remove</button>
                    <button onClick={() => handleSaveForLater(item)} className="text-sm font-medium text-gray-500 hover:text-navy hover:underline flex items-center gap-1"><FiHeart /> Save for Later</button>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-center mt-4 md:mt-0">
                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                  <button onClick={() => dispatch(updateQuantity({ product: item.product, quantity: Math.max(1, item.quantity - 1) }))} className="px-3 py-2 hover:text-navy"><FiMinus size={14} /></button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ product: item.product, quantity: Math.min(item.stock, item.quantity + 1) }))} className="px-3 py-2 hover:text-navy"><FiPlus size={14} /></button>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 text-right hidden md:block">
                <span className="font-semibold text-gray-600">₹{item.price.toLocaleString('en-IN')}</span>
              </div>

              <div className="col-span-1 md:col-span-2 text-right flex justify-between md:block mt-2 md:mt-0">
                <span className="md:hidden text-gray-500">Subtotal:</span>
                <span className="font-bold text-navy text-lg">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-3xl border border-gray-100 p-8 sticky top-32 shadow-sm">
            <h3 className="font-display font-bold text-2xl text-navy mb-6">Order Summary</h3>
            
            <div className="mb-6 relative">
              <input 
                type="text" 
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Apply Coupon Code" 
                className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm uppercase" 
              />
              <FiTag className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <button className="absolute right-2 top-2 px-3 py-1.5 text-xs font-bold bg-navy text-white rounded-lg">Apply</button>
            </div>

            <div className="space-y-4 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
              <div className="flex justify-between items-center">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-bold text-gray-800">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Charge</span>
                <span className="font-bold">{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>GST (5%)</span>
                <span className="font-bold text-gray-800">₹{tax.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-gray-800 text-lg">Total Amount</span>
              <div className="text-right">
                <span className="block font-bold text-3xl text-navy">₹{total.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-gray-400">Inclusive of all taxes</span>
              </div>
            </div>

            {totalPrice < 499 && (
              <div className="bg-gold/10 text-gold-dark border border-gold/20 p-3 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2">
                <FiShoppingBag /> Add ₹{499 - totalPrice} more to your cart to get FREE delivery!
              </div>
            )}

            <Link to="/checkout" className="w-full gradient-navy text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-navy/20">
              Proceed to Checkout <FiArrowRight />
            </Link>
            <Link to="/products" className="w-full text-center text-navy text-sm font-bold mt-4 block hover:text-gold transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
