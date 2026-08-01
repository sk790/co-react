import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: (type, message, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, type, message, duration };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  success: (message, duration) => get().showToast('success', message, duration),
  error: (message, duration) => get().showToast('error', message, duration),
  info: (message, duration) => get().showToast('info', message, duration),
  warning: (message, duration) => get().showToast('warning', message, duration),
}));

export const toast = {
  success: (msg: string, duration?: number) => useToastStore.getState().success(msg, duration),
  error: (msg: string, duration?: number) => useToastStore.getState().error(msg, duration),
  info: (msg: string, duration?: number) => useToastStore.getState().info(msg, duration),
  warning: (msg: string, duration?: number) => useToastStore.getState().warning(msg, duration),
};
