import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('wholesale_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wholesale_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    if (product.outOfStock || product.stock <= 0) return false;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product._id);
      if (existingIndex > -1) {
        const newCart = [...prev];
        const newQty = Math.min(product.stock, newCart[existingIndex].quantity + quantity);
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newQty,
          subtotal: newQty * product.price
        };
        return newCart;
      } else {
        const initialQty = Math.min(product.stock, Math.max(product.minOrderQty || 1, quantity));
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            unit: product.unit || 'Unit',
            image: product.image,
            stock: product.stock,
            minOrderQty: product.minOrderQty || 1,
            quantity: initialQty,
            subtotal: initialQty * product.price
          }
        ];
      }
    });
    return true;
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const validQty = Math.max(1, Math.min(item.stock, quantity));
            return {
              ...item,
              quantity: validQty,
              subtotal: validQty * item.price
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
