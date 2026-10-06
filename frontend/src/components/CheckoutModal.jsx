import React, { useState, useEffect } from 'react';
import { X, CheckCircle, MapPin, Phone, User, Building, Send, FileSpreadsheet, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';

const CheckoutModal = ({ isOpen, onClose, onOrderPlaced }) => {
  const { user, addAddress } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    saveAddress: true
  });

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerPhone: user.phone || prev.customerPhone
      }));

      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        const idx = user.addresses.indexOf(defaultAddr);
        setSelectedAddressIndex(idx);
        setFormData((prev) => ({
          ...prev,
          customerName: defaultAddr.name || user.name,
          customerPhone: defaultAddr.phone || user.phone,
          street: defaultAddr.street || '',
          city: defaultAddr.city || '',
          state: defaultAddr.state || '',
          zip: defaultAddr.zip || ''
        }));
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSelectSavedAddress = (idx) => {
    setSelectedAddressIndex(idx);
    const addr = user.addresses[idx];
    setFormData((prev) => ({
      ...prev,
      customerName: addr.name || user.name,
      customerPhone: addr.phone || user.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setError('Please provide customer name and phone number');
      return;
    }
    if (!formData.street.trim() || !formData.zip.trim()) {
      setError('Please provide complete delivery street address and PIN/ZIP code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. If logged in and saveAddress checked, save to address book
      if (user && formData.saveAddress && selectedAddressIndex === -1) {
        try {
          await addAddress({
            name: formData.customerName,
            phone: formData.customerPhone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            isDefault: !user.addresses || user.addresses.length === 0
          });
        } catch (e) {
          console.warn('Failed to save address to book:', e);
        }
      }

      // 2. Submit order payload matching FR-5
      const payload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit
        })),
        address: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip: formData.zip.trim()
      };

      const res = await orderService.placeOrder(payload);

      if (res.data.success) {
        setOrderSuccess(res.data);
        clearCart();

        // Trigger confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

        if (onOrderPlaced) onOrderPlaced(res.data.order);
      } else {
        setError(res.data.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Order checkout error:', err);
      setError(
        err.response?.data?.message ||
        'Error communicating with wholesale server. Please verify stock availability.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              {orderSuccess ? 'Order Confirmation' : 'Wholesale Checkout'}
            </h3>
            <p className="text-xs text-slate-500">
              {orderSuccess
                ? 'Your order has been recorded and synced to Google Sheets'
                : 'Enter wholesale delivery address & confirm bulk dispatch'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderSuccess ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full mb-2">
                Order #{orderSuccess.order.orderId} Placed
              </span>
              <h2 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h2>
              <p className="text-slate-600 text-sm mt-1">
                Thank you, <strong className="text-slate-800">{orderSuccess.order.customerName}</strong>. Your bulk order is booked.
              </p>
            </div>

            {/* Google Sheets Sync Status Box */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Google Sheets Automation (FR-5 & FR-9)</span>
              </div>
              <p className="text-xs text-emerald-800">
                Worksheet: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">{orderSuccess.googleSheet?.sheetTitle}</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{orderSuccess.googleSheet?.live ? 'Live Google Sheet updated immediately' : 'Order recorded to daily worksheet and sync queue'}</span>
              </div>
            </div>

            {/* Order Details Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-slate-900">#{orderSuccess.order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Address:</span>
                <span className="font-medium text-slate-900 text-right max-w-[280px]">
                  {orderSuccess.order.address}, {orderSuccess.order.city} ({orderSuccess.order.zip})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Items:</span>
                <span className="font-medium text-slate-900">{orderSuccess.order.items.length} wholesale products</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-brand-700">₹{orderSuccess.order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-brand-600/20"
              >
                Continue Browsing Wholesale Catalog
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Saved Addresses Selector (if logged in and has addresses) */}
            {user?.addresses && user.addresses.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Choose Saved Address
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user.addresses.map((addr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSavedAddress(idx)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedAddressIndex === idx
                          ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-600'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span>{addr.name}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-brand-200 text-brand-800 px-1.5 py-0.2 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 truncate">{addr.street}</p>
                      <p className="text-slate-500">{addr.city} - {addr.zip}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressIndex(-1);
                      setFormData((prev) => ({
                        ...prev,
                        street: '',
                        city: '',
                        state: '',
                        zip: ''
                      }));
                    }}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold flex items-center justify-center transition-all ${
                      selectedAddressIndex === -1
                        ? 'border-brand-600 bg-brand-50/50 text-brand-700'
                        : 'border-dashed border-slate-300 text-slate-600 hover:border-brand-500 hover:text-brand-600'
                    }`}
                  >
                    + Enter New Address
                  </button>
                </div>
              </div>
            )}

            {/* Customer Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer / Business Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Gupta / Kirana Store"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9812345678"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Street Address & Landmark *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Warehouse / Shop No., Wholesale Mandi, Street, Landmark"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Delhi / Panipat"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Haryana / Delhi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN / ZIP *</label>
                  <input
                    type="text"
                    name="zip"
                    required
                    value={formData.zip}
                    onChange={handleInputChange}
                    placeholder="110001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Order Value Preview */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total ({cart.length} items)</span>
                <span className="text-lg font-extrabold text-slate-900">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-600 font-semibold block">✓ In-Stock Validated</span>
                <span className="text-[11px] text-slate-500">Instant Google Sheet Sync</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:bg-slate-300 text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Wholesale Order & Sheets Sync...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Place Order & Append to Google Sheet</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
