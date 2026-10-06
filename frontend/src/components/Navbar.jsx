import React, { useState } from 'react';
import { ShoppingCart, Store, ShieldCheck, User, LogOut, Search, FileSpreadsheet, Package, X, ChevronRight } from 'lucide-react';
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
  const { cartCount, cartTotal } = useCart();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('shop')}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 active:scale-95 transition-transform">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-lg sm:text-2xl tracking-tight text-slate-900">
                  Bulk<span className="text-brand-600">Mart</span>
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-brand-100 text-brand-800 rounded-full">
                  B2B
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">Automated Google Sheets Ordering</p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          {activeTab === 'shop' && (
            <div className="flex-1 max-w-lg hidden md:block mx-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search wholesale products, grains, oils, spices..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-500 rounded-xl text-sm transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Toggle Button */}
            {activeTab === 'shop' && (
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Google Sheet Live Pill (Desktop & Tablet) */}
            <div
              onClick={() => setActiveTab('dealer')}
              title={sheetStatus?.isConfigured ? 'Google Sheets Live Connected' : 'Google Sheets Simulation Mode Active'}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sheet: {sheetStatus?.todaySheetTitle || 'Today'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Portal Switcher Button */}
            <button
              onClick={() => setActiveTab(activeTab === 'dealer' ? 'shop' : 'dealer')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border active:scale-95 ${
                activeTab === 'dealer'
                  ? 'bg-dealer-900 text-white border-dealer-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-dealer-600 hover:text-dealer-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500" />
              <span className="whitespace-nowrap">{activeTab === 'dealer' ? 'Customer View' : 'Dealer Portal'}</span>
            </button>

            {/* Customer Navigation: My Orders (Desktop) */}
            {activeTab === 'shop' && (
              <button
                onClick={() => setIsOrdersOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-brand-700 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95"
                title="View Previous Orders"
              >
                <Package className="w-4 h-4 text-slate-600" />
                <span>My Orders</span>
              </button>
            )}

            {/* Cart Button */}
            {activeTab === 'shop' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-brand-600/30 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Bulk Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:relative sm:top-0 sm:right-0 sm:ml-1.5 bg-amber-400 text-slate-900 font-black text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Account / Login */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-slate-100 rounded-xl">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-900 leading-tight max-w-[90px] truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {activeTab === 'shop' && mobileSearchOpen && (
          <div className="md:hidden pb-3 pt-1 px-1 animate-fadeIn">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wholesale commodities..."
                className="w-full pl-9 pr-9 py-2 bg-slate-100 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl text-xs outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
