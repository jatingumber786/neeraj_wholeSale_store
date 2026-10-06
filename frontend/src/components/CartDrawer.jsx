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
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-slideLeft">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-slate-900">Wholesale Cart</h2>
                <p className="text-[10px] sm:text-xs text-slate-500">{cartCount} items in bulk dispatch</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors active:scale-95"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 overscroll-contain">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-bold text-slate-800 text-base">Your cart is empty</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Browse our wholesale catalog to add bulk staples, grains, spices, and edible oils.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm active:scale-95"
                >
                  Start Ordering
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center text-xs text-slate-500 pb-1">
                  <span>Selected Commodities</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-600 hover:text-rose-700 font-bold hover:underline active:scale-95"
                  >
                    Clear All
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 items-center hover:border-slate-300 transition-all"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{item.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        ₹{item.price.toLocaleString('en-IN')} / {item.unit}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Stepper */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded active:scale-90"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded disabled:opacity-30 active:scale-90"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          ₹{item.subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-90"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Free Delivery Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Eligible for <strong>Free Commercial Freight Delivery</strong> to your mandi/shop!</span>
                </div>
              </>
            )}
          </div>

          {/* Sticky Checkout Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3 shrink-0 shadow-lg">
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Wholesale Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Freight Delivery:</span>
                  <span className="font-bold">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm sm:text-base font-black text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-brand-700">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 transition-all active:scale-98"
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
