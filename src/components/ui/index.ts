// Simple UI Components for Database Monitoring Dashboard
import React from 'react';

// Button component
export const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  disabled = false, 
  className = '' 
}) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`px-4 py-2 rounded font-medium ${
      variant === 'default' ? 'bg-blue-600 text-white hover:bg-blue-700' :
      variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700' :
      variant === 'outline' ? 'border border-gray-300 bg-transparent hover:bg-gray-50' :
      variant === 'ghost' ? 'bg-transparent hover:bg-gray-100' : ''
    } ${
      size === 'xs' ? 'text-xs px-2 py-1' :
      size === 'sm' ? 'text-sm px-3 py-1.5' :
      size === 'lg' ? 'text-lg px-5 py-2.5' : ''
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
  >
    {children}
  </button>
);

// Card component
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

// Flex component
export const Flex = ({ 
  children, 
  direction = 'row', 
  justify = 'start', 
  align = 'start', 
  gap = 0,
  className = '' 
}) => (
  <div 
    className={`flex ${
      direction === 'column' ? 'flex-col' : 'flex-row'
    } ${
      justify === 'start' ? 'justify-start' :
      justify === 'end' ? 'justify-end' :
      justify === 'center' ? 'justify-center' :
      justify === 'between' ? 'justify-between' :
      justify === 'around' ? 'justify-around' : 'justify-start'
    } ${
      align === 'start' ? 'items-start' :
      align === 'end' ? 'items-end' :
      align === 'center' ? 'items-center' :
      align === 'baseline' ? 'items-baseline' :
      align === 'stretch' ? 'items-stretch' : 'items-start'
    } ${
      gap ? `gap-${gap}` : ''
    } ${className}`}
  >
    {children}
  </div>
);

// Text component
export const Text = ({ 
  children, 
  size = 'default', 
  weight = 'normal',
  color = 'default',
  className = '' 
}) => (
  <p 
    className={`${
      size === 'xs' ? 'text-xs' :
      size === 'sm' ? 'text-sm' :
      size === 'lg' ? 'text-lg' :
      size === 'xl' ? 'text-xl' : 'text-base'
    } ${
      weight === 'bold' ? 'font-bold' :
      weight === 'semibold' ? 'font-semibold' :
      weight === 'light' ? 'font-light' : 'font-normal'
    } ${
      color === 'default' ? 'text-gray-900' :
      color === 'muted' ? 'text-gray-500' :
      color === 'gray' ? 'text-gray-400' :
      color
    } ${className}`}
  >
    {children}
  </p>
);

// Grid component
export const Grid = ({ 
  children, 
  columns = 1, 
  gap = 4,
  className = '' 
}) => (
  <div 
    className={`grid grid-cols-1 md:grid-cols-${columns} gap-${gap} ${className}`}
  >
    {children}
  </div>
);

// Box component
export const Box = ({ 
  children,
  padding = 4,
  className = '' 
}) => (
  <div className={`p-${padding} ${className}`}>
    {children}
  </div>
);

// Select component
export const Select = ({ 
  id,
  children,
  value,
  onChange,
  className = '' 
}) => (
  <select 
    id={id}
    value={value}
    onChange={onChange}
    className={`block w-full p-2 border border-gray-300 rounded-md ${className}`}
  >
    {children}
  </select>
);

// Label component
export const Label = ({ 
  htmlFor,
  children,
  className = '' 
}) => (
  <label 
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
  >
    {children}
  </label>
);

// Heading component
export const Heading = ({ 
  children,
  level = 2,
  className = '' 
}) => {
  const Tag = `h${level}`;
  return (
    <Tag className={`font-semibold ${className}`}>
      {children}
    </Tag>
  );
};

// Badge component
export const Badge = ({ 
  children,
  variant = 'default',
  className = '' 
}) => (
  <span 
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      variant === 'default' ? 'bg-gray-100 text-gray-800' :
      variant === 'success' ? 'bg-green-100 text-green-800' :
      variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
      variant === 'destructive' ? 'bg-red-100 text-red-800' :
      variant === 'outline' ? 'bg-transparent border border-gray-300 text-gray-700' : ''
    } ${className}`}
  >
    {children}
  </span>
);

// Spinner component
export const Spinner = ({ 
  size = 'default',
  className = '' 
}) => (
  <div
    className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${
      size === 'sm' ? 'h-4 w-4' :
      size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
    } ${className}`}
  ></div>
);

// TextInput component
export const TextInput = ({ 
  id,
  type = 'text',
  value,
  onChange,
  min,
  max,
  className = '' 
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    min={min}
    max={max}
    className={`block w-full p-2 border border-gray-300 rounded-md ${className}`}
  />
);

// Export all components
export { default as React } from 'react'; 