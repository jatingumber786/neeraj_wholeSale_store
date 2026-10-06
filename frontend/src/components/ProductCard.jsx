import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(product.minOrderQty || 1);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.outOfStock || product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock < 10;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > (product.minOrderQty || 1)) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const added = addToCart(product, quantity);
    if (added) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1200);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
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

        {/* Stock Badge */}
        <div className="absolute top-3 left-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock: {product.stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 backdrop-blur-sm text-white shadow-sm">
              <Check className="w-3.5 h-3.5" />
              In Stock ({product.stock})
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 mb-3 min-h-[32px]">
            {product.description || `Wholesale grade ${product.category} in bulk packaging.`}
          </p>

          {/* Pricing & Unit Info */}
          <div className="flex items-baseline gap-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block">Wholesale Rate</span>
              <span className="text-xl font-extrabold text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              per {product.unit || 'Unit'}
            </span>
            {product.minOrderQty > 1 && (
              <span className="ml-auto text-[11px] text-amber-700 font-medium">
                Min: {product.minOrderQty}
              </span>
            )}
          </div>
        </div>

        {/* Controls & Add to Cart */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-slate-600">Quantity:</span>
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 ml-auto">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={isOutOfStock || quantity <= (product.minOrderQty || 1)}
                className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-900 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-slate-800">
                {isOutOfStock ? 0 : quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={isOutOfStock || quantity >= product.stock}
                className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-900 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-brand-600/20 hover:shadow-md'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4" />
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
