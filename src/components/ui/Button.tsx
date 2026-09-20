import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading,
      loading,
      disabled,
      className = '',
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isBtnLoading = isLoading || loading || false;
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5 min-h-[36px]',
      md: 'px-4 py-2 text-sm font-semibold gap-2 min-h-[44px]',
      lg: 'px-6 py-3 text-base font-semibold gap-2.5 min-h-[48px]',
    };

    const variantClasses = {
      primary:
        'bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 border border-teal-700 shadow-sm focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2',
      secondary:
        'bg-teal-50 text-teal-800 hover:bg-teal-100 active:bg-teal-200 border border-teal-200 shadow-xs focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2',
      outline:
        'bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-300 shadow-xs focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 border-transparent focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-rose-600 shadow-sm focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-600 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
    };

    const isDisabled = disabled || isBtnLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 select-none whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isBtnLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
