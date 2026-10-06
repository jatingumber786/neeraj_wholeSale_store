import React from 'react';
import { ShoppingCart, Store, ShieldCheck, User, LogOut, Search, FileSpreadsheet, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  setIsCartOpen,
  setIsAuthOpen,
  setIsOrdersOpen,
  sheetStatus
}) => {
  const { user, isDealer, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('shop')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Bulk<span className="text-brand-600">Mart</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-800 rounded-full">
                  Wholesale B2B
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Automated Google Sheets Ordering</p>
            </div>
          </div>

          {/* Search Bar (when in Shop view) */}
          {activeTab === 'shop' && (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search wholesale products, grains, oils, spices..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-500 rounded-xl text-sm transition-all outline-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Google Sheet Live Pill */}
            <div
              onClick={() => setActiveTab('dealer')}
              title={sheetStatus?.isConfigured ? 'Google Sheets Live Connected' : 'Google Sheets Simulation Mode Active'}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sheet: {sheetStatus?.todaySheetTitle || 'Today'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Portal Switcher */}
            <button
              onClick={() => setActiveTab(activeTab === 'dealer' ? 'shop' : 'dealer')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                activeTab === 'dealer'
                  ? 'bg-dealer-900 text-white border-dealer-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-dealer-600 hover:text-dealer-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              <span>{activeTab === 'dealer' ? 'Customer Portal' : 'Dealer Portal'}</span>
            </button>

            {/* Customer Navigation: Cart & My Orders */}
            {activeTab === 'shop' && (
              <>
                <button
                  onClick={() => setIsOrdersOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-brand-700 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-medium transition-all"
                  title="View Previous Orders"
                >
                  <Package className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">My Orders</span>
                </button>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-brand-600/30"
                >
                  <ShoppingCart className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Bulk Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 sm:relative sm:top-0 sm:right-0 sm:ml-1.5 bg-amber-400 text-slate-900 font-extrabold text-[11px] px-1.5 py-0.2 rounded-full min-w-[20px] text-center shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* User Account / Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-900 leading-tight max-w-[100px] truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 transition-all"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
