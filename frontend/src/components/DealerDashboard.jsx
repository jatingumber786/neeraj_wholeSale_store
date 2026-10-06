import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ShoppingBag,
  Clock,
  Sparkles
} from 'lucide-react';
import ProductManagement from './ProductManagement';
import { orderService, sheetService, productService } from '../services/api';

const DealerDashboard = ({ onOpenAuth }) => {
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' | 'inventory' | 'sheets'
  const [stats, setStats] = useState(null);
  const [todayOrders, setTodayOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [sheetInfo, setSheetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testingSheet, setTestingSheet] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, sheetRes] = await Promise.all([
        orderService.getStats().catch(() => ({ data: { success: false } })),
        orderService.getTodayOrders().catch(() => ({ data: { success: false, orders: [] } })),
        productService.getProducts().catch(() => ({ data: { success: false, products: [] } })),
        sheetService.getInfo().catch(() => ({ data: { success: false } }))
      ]);

      if (statsRes.data?.success) setStats(statsRes.data);
      if (ordersRes.data?.success) setTodayOrders(ordersRes.data.orders);
      if (productsRes.data?.success) setProducts(productsRes.data.products);
      if (sheetRes.data?.success) setSheetInfo(sheetRes.data.data);
    } catch (err) {
      console.error('Error loading dealer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleTestSheetConnection = async () => {
    setTestingSheet(true);
    setTestResult(null);
    try {
      const res = await sheetService.testConnection();
      setTestResult({
        success: res.data.success,
        message: res.data.message,
        configured: res.data.configured
      });
      // Refresh sheet info
      const s = await sheetService.getInfo();
      if (s.data?.success) setSheetInfo(s.data.data);
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Connection test failed'
      });
    } finally {
      setTestingSheet(false);
    }
  };

  const todayTitle = sheetInfo?.todaySheetTitle || 'Today';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Welcome & Sync Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-dealer-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Dealer Control Center
            </span>
            <span className="text-xs text-slate-400">Daily Google Sheet Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Wholesale Operations & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Live order stream, automated worksheet generation (e.g. {todayTitle}), and inventory threshold management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {sheetInfo?.sheetUrl ? (
            <a
              href={sheetInfo.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Open Google Sheet</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          ) : (
            <button
              onClick={() => setActiveSubTab('sheets')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-bold border border-slate-600 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Configure Live Sheet</span>
            </button>
          )}

          <button
            onClick={fetchAllData}
            disabled={loading}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards (FR-10 Dealer Dashboard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Today's Orders</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats?.today?.orderCount ?? todayOrders.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Worksheet: <span className="font-mono text-slate-700 font-semibold">{todayTitle}</span>
          </p>
        </div>

        {/* Wholesale Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ₹{(stats?.today?.revenue ?? todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Real-time order processing &lt; 2s</p>
        </div>

        {/* In-Stock Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>In-Stock Products</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats?.inventory?.inStock ?? products.filter((p) => !p.outOfStock && p.stock >= 10).length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total Catalog: {products.length} Items</p>
        </div>

        {/* Out / Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Inventory Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {stats?.inventory?.outOfStock ?? products.filter((p) => p.outOfStock || p.stock <= 0).length}
            </span>
            <span className="text-xs text-rose-600 font-semibold">Out of Stock</span>
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            Low Stock: {stats?.inventory?.lowStock ?? products.filter((p) => !p.outOfStock && p.stock > 0 && p.stock < 10).length} items
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'orders'
              ? 'border-dealer-600 text-dealer-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Today's Orders Feed ({todayOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'inventory'
              ? 'border-dealer-600 text-dealer-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Product & Inventory Management ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sheets')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'sheets'
              ? 'border-dealer-600 text-dealer-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets Automation</span>
          {sheetInfo?.isConfigured && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>
      </div>

      {/* Sub-tab 1: Orders Feed */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Live Google Sheet Mirror (Worksheet: {todayTitle})
              </h3>
              <p className="text-xs text-slate-500">
                Format: Order ID | Time | Customer | Phone | Product | Qty | Address | ZIP
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-Appended</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
                  <th className="p-3 font-mono">Order ID</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Products Ordered</th>
                  <th className="p-3">Total Qty</th>
                  <th className="p-3">Address</th>
                  <th className="p-3 font-mono">ZIP</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-right">Sheet Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-12 text-slate-400">
                      <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">No orders placed today yet</p>
                      <p className="text-[11px] text-slate-500">
                        When customers order from the wholesale catalog, rows will appear here and in Google Sheet "{todayTitle}" instantly.
                      </p>
                    </td>
                  </tr>
                ) : (
                  todayOrders.map((ord) => {
                    const timeStr = new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const totalQty = ord.items.reduce((s, it) => s + it.quantity, 0);

                    return (
                      <tr key={ord._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900 bg-slate-50/50">
                          #{ord.orderId}
                        </td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">{timeStr}</td>
                        <td className="p-3 font-semibold text-slate-900">{ord.customerName}</td>
                        <td className="p-3 text-slate-600 font-mono">{ord.customerPhone}</td>
                        <td className="p-3">
                          <div className="space-y-0.5 max-w-[220px]">
                            {ord.items.map((it, idx) => (
                              <p key={idx} className="text-slate-800 truncate">
                                • {it.name} <span className="text-slate-500 font-mono">({it.quantity} {it.unit})</span>
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-800 text-center">{totalQty}</td>
                        <td className="p-3 text-slate-600 max-w-[200px] truncate" title={ord.address}>
                          {ord.address}{ord.city ? `, ${ord.city}` : ''}
                        </td>
                        <td className="p-3 font-mono text-slate-600">{ord.zip}</td>
                        <td className="p-3 font-extrabold text-slate-900">
                          ₹{ord.totalAmount?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ord.sheetSynced
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <FileSpreadsheet className="w-3 h-3" />
                            {ord.sheetSynced ? 'Synced' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Inventory & Products */}
      {activeSubTab === 'inventory' && (
        <ProductManagement products={products} onProductUpdated={fetchAllData} />
      )}

      {/* Sub-tab 3: Google Sheets Control Center */}
      {activeSubTab === 'sheets' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Google Sheets API Configuration (FR-9)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every order is written in real-time to a dedicated daily worksheet (format: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">DD-MM-YYYY</code>).
                </p>
              </div>

              <button
                onClick={handleTestSheetConnection}
                disabled={testingSheet}
                className="px-4 py-2 bg-dealer-900 hover:bg-dealer-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0"
              >
                {testingSheet ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{testingSheet ? 'Testing Connection...' : 'Test Google Sheet Connection'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Status Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold">Connection Mode</span>
                <p className="font-bold text-slate-900 text-sm">
                  {sheetInfo?.isConfigured ? '🟢 Live Google Sheets API' : '🟡 Simulation Fallback Mode'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {sheetInfo?.isConfigured ? 'Direct API writes active' : 'Orders logged locally and ready for export'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold">Today's Worksheet Title</span>
                <p className="font-bold text-slate-900 text-sm font-mono">{todayTitle}</p>
                <p className="text-[11px] text-slate-500">Automatically created on first daily order</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold">Target Google Sheet ID</span>
                <p className="font-mono text-slate-900 truncate font-semibold">
                  {sheetInfo?.spreadsheetId || 'Not configured in .env'}
                </p>
                {sheetInfo?.sheetUrl && (
                  <a
                    href={sheetInfo.sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Open Live Spreadsheet <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Setup Instructions Box */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">How to connect your live Google Sheet:</h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Create a Google Spreadsheet in Google Drive (or use an existing one).</li>
                <li>In Google Cloud Console, enable <strong>Google Sheets API</strong> and create a <strong>Service Account</strong>.</li>
                <li>Share your Google Spreadsheet with the Service Account email as <strong>Editor</strong>.</li>
                <li>Add the following variables to <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono">backend/.env</code>:</li>
              </ol>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
{`GOOGLE_SHEET_ID=your_sheet_id_from_url
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerDashboard;
