import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <div className="space-y-4">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children }: TabsListProps) {
  return (
    <div className="flex space-x-2 border-b border-gray-200">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  return (
    <button
      onClick={() => {
        const parent = document.querySelector('[data-tabs]');
        if (parent) {
          const onValueChange = (parent as any).__onValueChange;
          if (onValueChange) onValueChange(value);
        }
      }}
      className={`px-4 py-2 text-sm font-medium transition-colors relative
        ${document.querySelector('[data-tabs]')?.__value === value
          ? 'text-purple-600 border-b-2 border-purple-600'
          : 'text-gray-600 hover:text-gray-900'
        }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: TabsContentProps) {
  const parent = document.querySelector('[data-tabs]');
  const currentValue = parent ? (parent as any).__value : null;

  if (currentValue !== value) {
    return null;
  }

  return <div>{children}</div>;
}
