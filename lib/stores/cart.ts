import { create } from 'zustand';
import { CartSeat } from '@/types';

interface CartState {
  seats: CartSeat[];
  eventId: string | null;
  lockedUntil: Date | null;
  addSeat: (seat: CartSeat) => void;
  removeSeat: (seatId: string) => void;
  clearCart: () => void;
  setLockExpiry: (expiresAt: string) => void;
  setEventId: (eventId: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  seats: [],
  eventId: null,
  lockedUntil: null,
  addSeat: (seat) => set((state) => ({
    seats: state.seats.find(s => s.seatId === seat.seatId)
      ? state.seats
      : [...state.seats, seat],
  })),
  removeSeat: (seatId) => set((state) => ({
    seats: state.seats.filter(s => s.seatId !== seatId),
  })),
  clearCart: () => set({ seats: [], lockedUntil: null }),
  setLockExpiry: (expiresAt) => set({ lockedUntil: new Date(expiresAt) }),
  setEventId: (eventId) => set({ eventId }),
}));
