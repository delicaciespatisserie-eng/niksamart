import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiHeart, FiLogOut, FiPackage } from 'react-icons/fi';
import { logout } from "../../store/slices/authSlice";
import { useLogoutMutation } from '../../store/api/authApi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { totalQuantity } = useSelector((s) => s.cart);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logoutMutation();
    dispatch(logout());
    setUserMenu(false);
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'}`}>
      {/* Top bar */}
      <div className="gradient-navy text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="hidden sm:inline">🚚 Free shipping on orders above ₹499</span>
          <div className="flex gap-4">
            <Link to="/vendor/apply" className="hover:text-gold transition-colors">Sell on Niksa Mart</Link>
            <Link to="/about" className="hover:text-gold transition-colors">About</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 gradient-navy rounded-lg flex items-center justify-center">
              <span className="text-gold font-bold text-lg font-display">N</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-navy leading-tight tracking-tight">Niksa Mart</h1>
              <p className="text-[10px] text-gray-400 -mt-0.5 tracking-widest uppercase">Marketplace</p>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full pl-4 pr-12 py-2.5 rounded-full border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none text-sm transition-all"
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 bg-navy text-white p-2 rounded-full hover:bg-navy-light transition-colors">
                <FiSearch size={16} />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            <Link to="/wishlist" className="p-2 text-gray-600 hover:text-navy transition-colors relative" title="Wishlist">
              <FiHeart size={20} />
            </Link>

            <Link to="/cart" className="p-2 text-gray-600 hover:text-navy transition-colors relative" title="Cart">
              <FiShoppingCart size={20} />
              {totalQuantity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 p-2 text-gray-600 hover:text-navy transition-colors">
                  <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                    <span className="text-navy font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                  </div>
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeInUp">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-navy transition-colors">
                      <FiUser size={16} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-navy transition-colors">
                      <FiPackage size={16} /> My Orders
                    </Link>
                    {user?.role === 'vendor' && (
                      <Link to="/vendor/dashboard" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-navy transition-colors">
                        <FiPackage size={16} /> Vendor Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-navy transition-colors">
                        <FiUser size={16} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-2 bg-navy text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-navy-light transition-colors">
                <FiUser size={16} /> Login
              </Link>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-600">
              {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories bar */}
      <div className="hidden md:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 h-10 text-sm">
          {['All Categories', 'Electronics', 'Fashion', 'Home & Living', 'Health', 'Beauty', 'Grocery', 'Deals'].map((cat) => (
            <Link key={cat} to={`/products?category=${cat.toLowerCase()}`} className="text-gray-600 hover:text-navy font-medium transition-colors whitespace-nowrap">
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-fadeInUp">
          <form onSubmit={handleSearch} className="p-4">
            <div className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 text-sm" />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 bg-navy text-white p-2 rounded-full"><FiSearch size={14} /></button>
            </div>
          </form>
          <div className="px-4 pb-4 space-y-1">
            {['Electronics', 'Fashion', 'Home & Living', 'Health', 'Beauty', 'Grocery'].map((c) => (
              <Link key={c} to={`/products?category=${c.toLowerCase()}`} onClick={() => setIsOpen(false)} className="block py-2.5 px-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">{c}</Link>
            ))}
            {!isAuthenticated && (
              <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center bg-navy text-white py-2.5 rounded-full text-sm font-medium mt-3">Login / Register</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
