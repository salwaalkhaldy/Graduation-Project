import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-150 ${
        hoverable ? 'hover:border-teal-300 hover:shadow-sm' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div
    className={`p-5 border-b border-slate-100 flex items-start justify-between gap-4 ${className}`}
  >
    <div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-0.5 leading-normal">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3 ${className}`}
  >
    {children}
  </div>
);
