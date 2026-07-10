import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'FAN' | 'VOLUNTEER' | 'VENUE_STAFF' | 'ORGANIZER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  preferredLanguage: string;
  accessibilityPreference: string;
  avatar?: string;
}

interface AppState {
  token: string | null;
  user: User | null;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
  syncThemeClass: () => void;

  // Persistent Chat State
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;

  // Selected Venue context
  selectedVenueId: string | null;
  setSelectedVenueId: (id: string | null) => void;

  // Notifications State
  notifications: string[];
  addNotification: (notification: string) => void;
  clearNotifications: () => void;

  // Cart State for Food ordering compatibility
  cart: { itemId: string; name: string; price: number; quantity: number; vendorId: string }[];
  addToCart: (item: { id: string; name: string; price: number; vendorId: string }) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;

  // Order History State
  orderHistory: {
    orderId: number;
    vendorName: string;
    location: string;
    status: string;
    estimatedWaitMinutes: number;
    queueNumber: number;
    createdAt: string;
    items: { name: string; quantity: number; price: number }[];
  }[];
  addOrderToHistory: (order: {
    orderId: number;
    vendorName: string;
    location: string;
    status: string;
    estimatedWaitMinutes: number;
    queueNumber: number;
    createdAt: string;
    items: { name: string; quantity: number; price: number }[];
  }) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null, currentConversationId: null, notifications: [], cart: [], orderHistory: [] }),

      theme: 'dark',
      toggleTheme: () => {
        const nextTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: nextTheme });
        get().syncThemeClass();
      },
      syncThemeClass: () => {
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          const currentTheme = get().theme;
          root.classList.remove('light', 'dark');
          root.classList.add(currentTheme);
        }
      },

      // Chat persistence
      currentConversationId: null,
      setCurrentConversationId: (id) => set({ currentConversationId: id }),

      // Venue context
      selectedVenueId: null,
      setSelectedVenueId: (id) => set({ selectedVenueId: id }),

      // Notifications
      notifications: [],
      addNotification: (note) => set((state) => ({ notifications: [note, ...state.notifications] })),
      clearNotifications: () => set({ notifications: [] }),

      // Cart Actions
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const itemsFromDifferentVendor = state.cart.some((i) => i.vendorId !== item.vendorId);
          const currentCart = itemsFromDifferentVendor ? [] : [...state.cart];

          const existingIndex = currentCart.findIndex((i) => i.itemId === item.id);
          if (existingIndex > -1) {
            const nextCart = [...currentCart];
            nextCart[existingIndex].quantity += 1;
            return { cart: nextCart };
          }

          return {
            cart: [
              ...currentCart,
              { itemId: item.id, name: item.name, price: item.price, quantity: 1, vendorId: item.vendorId },
            ],
          };
        }),
      removeFromCart: (itemId) =>
        set((state) => {
          const existingIndex = state.cart.findIndex((i) => i.itemId === itemId);
          if (existingIndex > -1) {
            const nextCart = [...state.cart];
            if (nextCart[existingIndex].quantity > 1) {
              nextCart[existingIndex].quantity -= 1;
              return { cart: nextCart };
            }
            return { cart: nextCart.filter((i) => i.itemId !== itemId) };
          }
          return { cart: state.cart };
        }),
      clearCart: () => set({ cart: [] }),

      orderHistory: [],
      addOrderToHistory: (order) =>
        set((state) => ({
          orderHistory: [order, ...state.orderHistory],
        })),
    }),
    {
      name: 'stadiumpilot-store-v2',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        theme: state.theme,
        currentConversationId: state.currentConversationId,
        selectedVenueId: state.selectedVenueId,
        cart: state.cart,
        orderHistory: state.orderHistory
      }),
    }
  )
);
