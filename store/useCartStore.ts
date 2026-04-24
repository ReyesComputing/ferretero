import { create } from 'zustand';
import { Product } from '../types/database';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      const updatedItems = items.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      );
      set({ items: updatedItems, total: get().total + (product.price * quantity) });
    } else {
      set({ items: [...items, { ...product, quantity }], total: get().total + (product.price * quantity) });
    }
  },
  removeItem: (productId) => {
    const items = get().items;
    const itemToRemove = items.find((item) => item.id === productId);
    if (!itemToRemove) return;

    set({
      items: items.filter((item) => item.id !== productId),
      total: get().total - (itemToRemove.price * itemToRemove.quantity),
    });
  },
  updateQuantity: (productId, quantity) => {
    const items = get().items;
    const updatedItems = items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    
    const newTotal = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    set({ items: updatedItems, total: newTotal });
  },
  clearCart: () => set({ items: [], total: 0 }),
}));
