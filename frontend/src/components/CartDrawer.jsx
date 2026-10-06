import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-lg text-slate-900">Wholesale Cart</h2>
              <span className="bg-brand-100 text-brand-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {cartCount} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-semibold text-slate-700 text-base">Your cart is empty</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Browse our wholesale catalog to add bulk items, grains, spices, and oils.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Start Ordering
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center text-xs text-slate-500 pb-1">
                  <span>Selected Products</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-600 hover:text-rose-700 font-medium hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500">
                        ₹{item.price.toLocaleString('en-IN')} / {item.unit}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Stepper */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="text-sm font-bold text-slate-900">
                          ₹{item.subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Free Delivery Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Eligible for <strong>Free Bulk Freight Delivery</strong> to your pin code!</span>
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout button */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Wholesale Subtotal:</span>
                  <span className="font-semibold text-slate-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Freight Delivery:</span>
                  <span className="font-semibold">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-extrabold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-brand-700">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
