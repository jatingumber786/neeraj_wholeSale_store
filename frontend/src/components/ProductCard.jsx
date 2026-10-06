import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(product.minOrderQty || 1);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.outOfStock || product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock < 10;

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > (product.minOrderQty || 1)) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const added = addToCart(product, quantity);
    if (added) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1400);
    }
  };

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 hover:border-brand-500/50 shadow-xs hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image & Floating Badges */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-rose-600 text-white shadow-sm">
              <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Out of Stock</span>
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Only {product.stock} left</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-600/95 backdrop-blur-xs text-white shadow-sm">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>In Stock ({product.stock})</span>
            </span>
          )}
        </div>

        {/* Category Tag */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/95 backdrop-blur-xs text-slate-700 shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-brand-700 transition-colors line-clamp-2 min-h-[38px] sm:min-h-[44px]">
            {product.name}
          </h3>

          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1 mb-3 min-h-[30px]">
            {product.description || `Wholesale packaging standard.`}
          </p>

          {/* Wholesale Pricing Banner */}
          <div className="flex items-baseline justify-between gap-1 mb-3.5 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block leading-tight">Wholesale Rate</span>
              <span className="text-base sm:text-xl font-black text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 inline-block">
                per {product.unit || 'Unit'}
              </span>
              {product.minOrderQty > 1 && (
                <span className="block text-[10px] text-amber-700 font-semibold mt-0.5">
                  Min: {product.minOrderQty}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls & Add to Cart */}
        <div className="space-y-2.5">
          {/* Quantity Stepper */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Qty:</span>
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={isOutOfStock || quantity <= (product.minOrderQty || 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-900 rounded-lg disabled:opacity-30 active:scale-90 transition-all cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 sm:w-10 text-center font-black text-xs sm:text-sm text-slate-800">
                {isOutOfStock ? 0 : quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={isOutOfStock || quantity >= product.stock}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-900 rounded-lg disabled:opacity-30 active:scale-90 transition-all cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add to Bulk Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-brand-600/20'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Bulk Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
