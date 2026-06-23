import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiUser, FiShoppingBag, FiHeart, FiMapPin, 
  FiStar, FiCreditCard, FiLogOut, FiMenu, FiX 
} from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';

const AccountLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'My Profile', path: '/account', icon: <FiUser />, end: true },
    { name: 'My Orders', path: '/account/orders', icon: <FiShoppingBag /> },
    { name: 'Wishlist', path: '/account/wishlist', icon: <FiHeart /> },
    { name: 'Saved Addresses', path: '/account/addresses', icon: <FiMapPin /> },
    { name: 'Reviews & Ratings', path: '/account/reviews', icon: <FiStar /> },
    { name: 'Wallet / Referrals', path: '/account/wallet', icon: <FiCreditCard /> },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
          <span className="font-bold text-navy">Account Menu</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-50 rounded-lg text-navy">
            {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-72 shrink-0`}>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden sticky top-32 shadow-sm">
            
            {/* User Info Header */}
            <div className="p-6 gradient-navy text-white text-center relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=C8A84B&color=fff`} 
                  alt={user?.name} 
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white/20 object-cover"
                />
                <h2 className="font-bold text-lg">{user?.name || 'Customer'}</h2>
                <p className="text-sm text-gray-300 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.name} 
                  to={link.path}
                  end={link.end}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive ? 'bg-navy/5 text-navy border border-navy/10' : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                  }`}
                >
                  <span className={({ isActive }) => isActive ? 'text-navy' : 'text-gray-400'}>{link.icon}</span>
                  {link.name}
                </NavLink>
              ))}
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all text-left"
              >
                <FiLogOut /> Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm min-h-[600px]">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AccountLayout;
