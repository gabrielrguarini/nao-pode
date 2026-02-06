import clsx from 'clsx';
import { type ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) => {
  const baseStyles = 'rounded-full font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-yellow-400 text-purple-900 shadow-lg hover:bg-yellow-300',
    secondary: 'bg-purple-500 text-white hover:bg-purple-400 shadow-md',
    danger: 'bg-red-500 text-white hover:bg-red-400 shadow-md',
    ghost: 'bg-transparent text-purple-200 hover:bg-white/10'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-xl'
  };

  return (
    <button 
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    />
  );
};
