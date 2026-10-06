import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle2, Truck, FileSpreadsheet, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';

const CustomerOrders = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneSearch, setPhoneSearch] = useState('');

  const fetchOrders = async (phoneToQuery) => {
    setLoading(true);
    setError(null);
    try {
      const q = phoneToQuery || (user?.phone ? user.phone : phoneSearch);
      const res = await orderService.getMyOrders(q);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || 'Could not fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (user?.phone) {
        setPhoneSearch(user.phone);
        fetchOrders(user.phone);
      } else {
        fetchOrders();
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">My Wholesale Orders</h3>
              <p className="text-xs text-slate-500">Track bulk dispatches and Google Sheet records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search by phone if guest */}
        {!user && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2">
            <input
              type="tel"
              placeholder="Enter your phone number (e.g. 9811223344)"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-500"
            />
            <button
              onClick={() => fetchOrders(phoneSearch)}
              className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Search Orders
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-brand-600 mb-2" />
              <p className="text-xs">Fetching order history...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Package className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No previous orders found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Orders placed using your phone number or account will appear here along with Google Sheet sync details.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord._id}
                className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      #{ord.orderId}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Google Sheet Sync badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                      {ord.sheetSynced ? 'Synced to Sheet' : 'Sheet Queue'}
                    </span>

                    {/* Status badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 text-xs">
                  {ord.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-slate-700">
                      <span className="font-medium">
                        {item.name} <span className="text-slate-400">× {item.quantity} {item.unit}</span>
                      </span>
                      <span className="font-mono font-semibold">₹{item.subtotal?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs gap-2">
                  <div className="text-slate-500 truncate max-w-[320px]">
                    📍 {ord.address}, {ord.city} ({ord.zip})
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">
                    Total: <span className="text-brand-700">₹{ord.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;
