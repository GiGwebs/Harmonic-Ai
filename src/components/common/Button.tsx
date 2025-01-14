import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ 
  children, 
  loading, 
  variant = 'primary',
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'flex items-center justify-center px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white disabled:hover:bg-purple-600',
    secondary: 'bg-transparent border-2 border-purple-600 hover:bg-purple-600/10 text-purple-600'
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}