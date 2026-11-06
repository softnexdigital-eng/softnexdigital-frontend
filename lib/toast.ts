'use client';

import toast, { type Renderable } from 'react-hot-toast';

type ToastOptions = {
  duration?: number;
  position?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left';
  icon?: Renderable;
};

export const showToast = {
  success: (message: string, options?: ToastOptions | number) => {
    const duration = typeof options === 'number' ? options : options?.duration || 2500;
    const position = typeof options === 'object' ? options?.position : undefined;
    const icon = typeof options === 'object' ? options?.icon : undefined;
    toast.success(message, {
      duration,
      position,
      icon: icon || '✅',
      style: {
        borderRadius: '10px',
        padding: '12px 20px',
        fontSize: '14px',
        background: '#F0FDF4',
        color: '#166534',
        border: '1px solid #BBF7D0',
      },
      iconTheme: {
        primary: '#166534',
        secondary: '#FFF1F2',
      },
    });
  },
  error: (message: string, options?: ToastOptions | number) => {
    const duration = typeof options === 'number' ? options : options?.duration || 3000;
    const position = typeof options === 'object' ? options?.position : undefined;
    const icon = typeof options === 'object' ? options?.icon : undefined;
    toast.error(message, {
      duration,
      position,
      icon: icon || '❌',
      style: {
        borderRadius: '10px',
        padding: '12px 20px',
        fontSize: '14px',
        background: '#FEF2F2',
        color: '#991B1B',
        border: '1px solid #FECACA',
      },
      iconTheme: {
        primary: '#991B1B',
        secondary: '#FFF1F2',
      },
    });
  },
  warning: (message: string, options?: ToastOptions | number) => {
    const duration = typeof options === 'number' ? options : options?.duration || 3000;
    const position = typeof options === 'object' ? options?.position : undefined;
    const icon = typeof options === 'object' ? options?.icon : undefined;
    toast(message, {
      duration,
      position,
      icon: icon || '⚠️',
      style: {
        borderRadius: '10px',
        padding: '12px 20px',
        fontSize: '14px',
        background: '#FFFBEB',
        color: '#92400E',
        border: '1px solid #FDE68A',
      },
      iconTheme: {
        primary: '#92400E',
        secondary: '#FFF1F2',
      },
    });
  },
  info: (message: string, options?: ToastOptions | number) => {
    const duration = typeof options === 'number' ? options : options?.duration || 2500;
    const position = typeof options === 'object' ? options?.position : undefined;
    const icon = typeof options === 'object' ? options?.icon : undefined;
    toast(message, {
      duration,
      position,
      icon: icon || 'ℹ️',
      style: {
        borderRadius: '10px',
        padding: '12px 20px',
        fontSize: '14px',
        background: '#EFF6FF',
        color: '#1E40AF',
        border: '1px solid #BFDBFE',
      },
      iconTheme: {
        primary: '#1E40AF',
        secondary: '#FFF1F2',
      },
    });
  },
  loading: (message: string, options?: ToastOptions) => {
    const duration = options?.duration;
    const position = options?.position;
    const icon = options?.icon;
    return toast.loading(message, {
      duration,
      position,
      icon: icon || '⏳',
      style: {
        borderRadius: '10px',
        padding: '12px 20px',
        fontSize: '14px',
        background: '#F1F5F9',
        color: '#475569',
        border: '1px solid #CBD5E1',
      },
      iconTheme: {
        primary: '#475569',
        secondary: '#FFF1F2',
      },
    });
  },
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

export default showToast;