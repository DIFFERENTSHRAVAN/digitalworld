import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'soni_electronics_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1): { success: boolean; message?: string } => {
    if (product.stock_quantity <= 0 || product.is_sold_out || product.is_reserved) {
      return { success: false, message: 'This item is currently sold out or reserved.' };
    }

    const existingIndex = items.findIndex(i => i.product.id === product.id);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > product.stock_quantity) {
        return {
          success: false,
          message: `Only ${product.stock_quantity} available in stock. You already have ${currentQty} in your cart.`
        };
      }

      const updated = [...items];
      updated[existingIndex].quantity = newQty;
      setItems(updated);
      setIsCartDrawerOpen(true);
      return { success: true };
    } else {
      if (quantity > product.stock_quantity) {
        return {
          success: false,
          message: `Only ${product.stock_quantity} available in stock.`
        };
      }

      setItems([...items, { product, quantity }]);
      setIsCartDrawerOpen(true);
      return { success: true };
    }
  };

  const removeFromCart = (productId: string) => {
    setItems(items.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const existing = items.find(i => i.product.id === productId);
    if (!existing) return { success: false, message: 'Item not in cart' };

    if (quantity > existing.product.stock_quantity) {
      return {
        success: false,
        message: `Cannot add more than ${existing.product.stock_quantity} available units.`
      };
    }

    setItems(items.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
    return { success: true };
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        isCartDrawerOpen,
        setIsCartDrawerOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
