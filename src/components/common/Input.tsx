import clsx from 'clsx';
import { type InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = ({ className, label, ...props }: InputProps) => {
  return (
      <div className="flex flex-col gap-1 w-full">
          {label && <label className="text-sm font-semibold text-purple-200">{label}</label>}
          <input 
            className={twMerge(clsx('bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all', className))}
            {...props}
          />
      </div>
  );
};
