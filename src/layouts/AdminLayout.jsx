import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdListAlt, MdPerson, MdLogout,
  MdStore, MdMenu, MdClose
} from 'react-icons/md';

const navItems = [
  { to: '/admin/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/admin/orders', icon: MdListAlt, label: 'Orders' },
  { to: '/admin/profile', icon: MdPerson, label: 'Shop Profile' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const NavLinks = () => (
    <>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
            ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
          }
        >
          <Icon className="text-xl shrink-0" />
          {label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 xl:w-64 bg-white border-r border-gray-100 flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center shrink-0">
              <MdStore className="text-white text-lg" />
            </div>
            <div>
              <span className="font-bold text-blue-700 text-lg leading-none">PrintFlow</span>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Admin Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-medium text-gray-800 truncate">{user?.shopName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full min-h-[44px]"
          >
            <MdLogout className="text-xl" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                  <MdStore className="text-white text-lg" />
                </div>
                <span className="font-bold text-blue-700 text-lg">PrintFlow</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                aria-label="Close menu"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <NavLinks />
            </nav>
            <div className="px-3 py-4 border-t border-gray-100">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs text-gray-500">Logged in as</p>
                <p className="text-sm font-medium text-gray-800 truncate">{user?.shopName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full"
              >
                <MdLogout className="text-xl" /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <MdMenu className="text-xl" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{user?.shopName}</h1>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{user?.shopAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-sm text-gray-600 font-medium truncate max-w-[150px]">
              {user?.ownerName}
            </span>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
              {user?.ownerName?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 sm:p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
