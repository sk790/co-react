import React from 'react';
import { Link } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';

export interface CardTag {
  id?: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
}

export interface CardDetail {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
}

export interface CardAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
}

export interface DataCardProps {
  title: React.ReactNode;
  titleLink?: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: LucideIcon;
  avatarUrl?: string;
  
  headerActions?: React.ReactNode;
  
  tags?: CardTag[];
  details?: CardDetail[];
  
  children?: React.ReactNode;
  
  footerActions?: CardAction[] | React.ReactNode;
  footerLeft?: React.ReactNode;
  
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  titleLink,
  subtitle,
  badge,
  icon: Icon,
  avatarUrl,
  headerActions,
  tags,
  details,
  children,
  footerActions,
  footerLeft,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : Icon ? (
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 shrink-0">
                <Icon size={20} />
              </div>
            ) : null}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {titleLink ? (
                  <Link
                    to={titleLink}
                    className="font-extrabold text-slate-900 text-lg hover:text-purple-600 transition-colors"
                  >
                    {title}
                  </Link>
                ) : (
                  <span className="font-extrabold text-slate-900 text-lg">{title}</span>
                )}

                {badge && (
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {badge}
                  </span>
                )}
              </div>

              {subtitle && (
                <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">{subtitle}</p>
              )}
            </div>
          </div>

          {headerActions && <div className="flex items-center gap-1 shrink-0">{headerActions}</div>}
        </div>

        {/* Body Section */}
        <div className="p-5 space-y-3">
          {/* Details Grid */}
          {details && details.length > 0 && (
            <div className="space-y-2">
              {details.map((det, idx) => {
                const DetIcon = det.icon;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      {DetIcon && <DetIcon size={14} />} {det.label}
                    </span>
                    <span className="text-slate-800 font-bold">{det.value}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tags / Pills */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag, idx) => {
                const TagIcon = tag.icon;
                return (
                  <span
                    key={tag.id || idx}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                      tag.color || 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {TagIcon && <TagIcon size={12} className="text-purple-600" />}
                    {tag.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Custom Body Content */}
          {children}
        </div>
      </div>

      {/* Footer Actions */}
      {(footerActions || footerLeft) && (
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>{footerLeft}</div>

          {Array.isArray(footerActions) ? (
            <div className="flex items-center gap-2">
              {footerActions.map((act, idx) => {
                const ActIcon = act.icon;
                const baseStyles = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs";
                const variantStyles =
                  act.variant === 'primary'
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : act.variant === 'outline'
                    ? "border border-purple-200 text-purple-600 hover:bg-purple-50"
                    : act.variant === 'secondary'
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    : "text-purple-600 hover:text-purple-700";

                return act.href ? (
                  <Link key={idx} to={act.href} className={`${baseStyles} ${variantStyles}`}>
                    {ActIcon && <ActIcon size={14} />} {act.label}
                  </Link>
                ) : (
                  <button key={idx} onClick={act.onClick} className={`${baseStyles} ${variantStyles}`}>
                    {ActIcon && <ActIcon size={14} />} {act.label}
                  </button>
                );
              })}
            </div>
          ) : (
            footerActions
          )}
        </div>
      )}
    </div>
  );
};
