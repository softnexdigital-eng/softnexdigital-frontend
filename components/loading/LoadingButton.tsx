'use client';

import { useState, ReactNode } from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
  secondary: 'bg-rose-100 text-rose-800 hover:bg-rose-200 active:bg-rose-300',
  outline: 'border border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white active:bg-rose-700',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function LoadingButton({ 
  children, 
  loading = false, 
  loadingText = 'Loading...',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  ...props 
}: LoadingButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading && (
        <FiLoader className="w-4 h-4 animate-spin" />
      )}
      {loading ? loadingText : children}
    </button>
  );
}