import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function InputField({ icon, className = '', ...props }: InputFieldProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {icon}
        </div>
      )}
      <input
        className={`w-full px-4 py-2 ${
          icon ? 'pl-10' : ''
        } rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
}