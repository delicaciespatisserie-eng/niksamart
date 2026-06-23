import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiGrid, FiPackage, FiShoppingCart, FiDollarSign, 
  FiSettings, FiLogOut, FiMenu, FiX 
} from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';

const VendorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: <FiGrid />, end: true },
    { name: 'Products', path: '/vendor/products', icon: <FiPackage /> },
    { name: 'Orders', path: '/vendor/orders', icon: <FiShoppingCart /> },
    { name: 'Earnings', path: '/vendor/earnings', icon: <FiDollarSign /> },
    { name: 'Shop Settings', path: '/vendor/settings', icon: <FiSettings /> },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="bg-gray-50 min-h-screen flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-navy text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center bg-white text-navy font-bold text-lg">N</div>
            <span className="font-display font-bold text-xl text-gold">Vendor Panel</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white"><FiX size={24} /></button>
        </div>

        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=C8A84B&color=fff`} alt="" className="w-10 h-10 rounded-full" />
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">{user?.name || 'Vendor'}</p>
            <p className="text-xs text-gray-400 truncate">Vendor Account</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path}
              end={link.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive ? 'bg-gold text-navy' : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-gray-300 hover:bg-red-500 hover:text-white transition-colors">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header (Mobile) */}
        <header className="md:hidden bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-gold font-bold">N</div>
            <span className="font-bold text-navy">Vendor Panel</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-navy"><FiMenu size={24} /></button>
        </header>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;
