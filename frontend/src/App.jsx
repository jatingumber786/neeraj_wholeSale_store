import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import CustomerOrders from './components/CustomerOrders';
import DealerDashboard from './components/DealerDashboard';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { productService, sheetService } from './services/api';
import {
  Sparkles,
  Truck,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  Store,
  Package,
  ShoppingCart,
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';

function App() {
  const { user, isDealer } = useAuth();
  const { cartCount, cartTotal } = useCart();

  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'dealer'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sheetStatus, setSheetStatus] = useState(null);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        search: searchQuery,
        category: selectedCategory,
        status: statusFilter
      });
      if (res.data.success) {
        setProducts(res.data.products);
        if (res.data.categories && res.data.categories.length > 0) {
          setCategories(res.data.categories);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSheetInfo = async () => {
    try {
      const res = await sheetService.getInfo();
      if (res.data.success) {
        setSheetStatus(res.data.data);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchSheetInfo();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 pb-20 md:pb-0">
      {/* Top Wholesale Announcement Banner */}
      <div className="bg-slate-900 text-slate-300 px-3 sm:px-4 py-2 text-[11px] sm:text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-white">Wholesale B2B Live Ordering</span>
          <span className="hidden sm:inline text-slate-400">
            | Orders sync instantly to Google Sheet ({sheetStatus?.todaySheetTitle || 'Today'})
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400">
          <span>⚡ Real-Time Stock Validation</span>
          <span>🚚 Free Bulk Freight</span>
          <span>🔒 Enterprise Security</span>
        </div>
      </div>

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsCartOpen={setIsCartOpen}
        setIsAuthOpen={setIsAuthOpen}
        setIsOrdersOpen={setIsOrdersOpen}
        sheetStatus={sheetStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12 sm:pb-16">
        {activeTab === 'dealer' ? (
          /* Dealer Portal View */
          <DealerDashboard onOpenAuth={() => setIsAuthOpen(true)} />
        ) : (
          /* Customer Wholesale Shop View */
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
            {/* Wholesale Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-brand-800 to-slate-900 rounded-3xl p-5 sm:p-10 text-white shadow-xl">
              <div className="relative z-10 max-w-2xl space-y-2 sm:space-y-3">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/10 backdrop-blur-md text-emerald-300 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Wholesale Mandi & Mill Direct Supply</span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Bulk Ordering, <br className="hidden sm:block" />
                  <span className="text-emerald-400">Instant Sheets Sync.</span>
                </h1>
                <p className="text-slate-200 text-xs sm:text-sm max-w-lg leading-relaxed">
                  Bulk staples, grains, refined edible oils, and packaged wholesale commodities with atomic stock validation and automated daily Google Sheet recording.
                </p>

                <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-emerald-100 bg-white/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/10">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    <span>Free Commercial Freight</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-emerald-100 bg-white/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/10">
                    <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    <span>Daily Google Worksheet Output</span>
                  </div>
                </div>
              </div>

              {/* Decorative graphic background */}
              <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block opacity-15 pointer-events-none">
                <FileSpreadsheet className="w-64 h-64 text-white" />
              </div>
            </div>

            {/* Filter and Category Controls */}
            <div className="space-y-3 sm:space-y-4">
              {/* Category Chips Scroller */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none touch-pan-x">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 shadow-2xs ${
                      selectedCategory === cat
                        ? 'bg-brand-600 text-white shadow-brand-600/25 ring-2 ring-brand-600/20'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Status Filters: All, In Stock, Low Stock, Out of Stock */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none shadow-2xs">
                  <button
                    onClick={() => setStatusFilter('')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all active:scale-95 ${
                      statusFilter === ''
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => setStatusFilter('In Stock')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all active:scale-95 ${
                      statusFilter === 'In Stock'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    onClick={() => setStatusFilter('Low Stock')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all active:scale-95 ${
                      statusFilter === 'Low Stock'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Low Stock (&lt;10)
                  </button>
                  <button
                    onClick={() => setStatusFilter('Out of Stock')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all active:scale-95 ${
                      statusFilter === 'Out of Stock'
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Out of Stock
                  </button>
                </div>

                <div className="text-slate-500 text-[11px] sm:text-xs">
                  Showing <strong className="text-slate-900">{products.length}</strong> wholesale commodities
                </div>
              </div>
            </div>

            {/* Product Catalog Responsive Grid */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mb-3" />
                <p className="text-sm font-semibold text-slate-700">Loading wholesale inventory...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-900">No products match your filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing search or switching category filters.
                </p>
                <button
                  onClick={() => { setSelectedCategory('All'); setStatusFilter(''); setSearchQuery(''); }}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors active:scale-95"
                >
                  Reset Catalog Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Sticky Mobile Cart Quick-Bar (Shown on mobile when cart has items) */}
      {cartCount > 0 && activeTab === 'shop' && (
        <div className="md:hidden fixed bottom-16 left-3 right-3 z-30 animate-slideUp">
          <div
            onClick={() => setIsCartOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer active:scale-98 transition-all border border-brand-500"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black leading-tight">
                  {cartCount} items in cart • ₹{cartTotal.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-emerald-100">Free Freight Eligible</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-black bg-white text-brand-700 px-3 py-1.5 rounded-xl shadow-xs">
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Fixed at bottom on phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around text-[10px] font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all active:scale-90 ${
            activeTab === 'shop' ? 'text-brand-700 font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Shop</span>
        </button>

        <button
          onClick={() => setIsOrdersOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl transition-all hover:text-slate-900 active:scale-90"
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center py-1 px-3 rounded-xl transition-all hover:text-slate-900 active:scale-90"
        >
          <ShoppingCart className="w-5 h-5 mb-0.5 text-brand-600" />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-amber-500 text-white font-black text-[9px] px-1 rounded-full min-w-[16px] text-center">
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('dealer')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all active:scale-90 ${
            activeTab === 'dealer' ? 'text-dealer-700 font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5 text-sky-600" />
          <span>Dealer</span>
        </button>

        <button
          onClick={() => (user ? setIsOrdersOpen(true) : setIsAuthOpen(true))}
          className="flex flex-col items-center py-1 px-3 rounded-xl transition-all hover:text-slate-900 active:scale-90"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{user ? 'Account' : 'Login'}</span>
        </button>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={() => {
          fetchProducts();
          fetchSheetInfo();
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Customer Orders Modal */}
      <CustomerOrders
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Desktop Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">BulkMart Wholesale Platform</span>
            <span>• Prepared for Jatin Gumber</span>
          </div>
          <div className="flex items-center gap-4">
            <span>MERN + Google Sheets API</span>
            <span className="text-emerald-600 font-semibold">● Real-time Daily Sheet Automation Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
