import React from 'react';
import { RefreshCw, type LucideIcon } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconSize?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  icon: Icon = RefreshCw,
  iconColor = 'text-purple-600',
  iconSize = 32,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs ${className}`}
    >
      <Icon className={`animate-spin ${iconColor} mb-3`} size={iconSize} />
      {message && <p className="text-slate-500 font-medium text-sm">{message}</p>}
    </div>
  );
};
