import React from 'react';

const VARIANTS = {
  primary: 'bg-accent text-ink hover:bg-accentDark',
  secondary: 'bg-transparent border border-gray-700 hover:border-accent hover:text-accent',
  danger: 'bg-red-600/90 text-white hover:bg-red-500',
};

export default function Button({
  children, variant = 'primary', className = '', disabled, ...rest
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
