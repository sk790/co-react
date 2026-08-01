import React from 'react';
import { BookOpen, type LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionButton?: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  iconBorderColor?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = BookOpen,
  title,
  description,
  actionButton,
  iconBgColor = 'bg-purple-50',
  iconTextColor = 'text-purple-600',
  iconBorderColor = 'border-purple-100',
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-sm ${className}`}>
      <div className={`w-16 h-16 ${iconBgColor} ${iconTextColor} rounded-2xl flex items-center justify-center mb-4 border ${iconBorderColor}`}>
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-slate-500 text-sm max-w-md">{description}</p>}
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
};
