import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiActivity, FiPackage, FiShield, FiLogOut } from 'react-icons/fi';

const AdminLayout = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a1a] text-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/10 text-center">
          <div className="text-2xl font-display font-bold text-white tracking-widest uppercase">Niksa<span className="text-gold">Mart</span></div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Super Admin</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <NavLink to="/admin/dashboard" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-gold text-navy' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}><FiActivity /> Overview</NavLink>
          <NavLink to="/admin/vendors" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-gold text-navy' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}><FiShield /> Vendor Approvals</NavLink>
          <NavLink to="/admin/orders" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-gold text-navy' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}><FiShoppingBag /> Global Orders</NavLink>
          <NavLink to="/admin/products" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-gold text-navy' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}><FiPackage /> Catalog Moderation</NavLink>
          <NavLink to="/admin/users" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-gold text-navy' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}><FiUsers /> Users</NavLink>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <FiLogOut /> Exit System
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="font-bold text-navy">Command Center</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-navy text-gold flex items-center justify-center font-bold">A</div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
