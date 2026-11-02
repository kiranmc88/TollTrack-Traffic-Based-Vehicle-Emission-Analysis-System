import React from 'react';

const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200/80 dark:border-emerald-900/60',
    iconBg: 'bg-emerald-600 text-white',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-200/80 dark:border-teal-900/60',
    iconBg: 'bg-teal-600 text-white',
    accentText: 'text-teal-700 dark:text-teal-400',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
  },
  blue: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-200/80 dark:border-sky-900/60',
    iconBg: 'bg-sky-600 text-white',
    accentText: 'text-sky-700 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200/80 dark:border-amber-900/60',
    iconBg: 'bg-amber-600 text-white',
    accentText: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200/80 dark:border-rose-900/60',
    iconBg: 'bg-rose-600 text-white',
    accentText: 'text-rose-700 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-900/50',
    border: 'border-slate-200 dark:border-slate-800',
    iconBg: 'bg-slate-700 text-white dark:bg-slate-700',
    accentText: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  }
};

export default function KPICard({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  variant = 'emerald',
  badgeText,
  onClick,
}) {
  const theme = COLOR_MAP[variant] || COLOR_MAP.emerald;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border ${theme.border} bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-700' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {value}
            </span>
            {unit && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${theme.badge}`}>
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${theme.iconBg} shadow-sm shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtext || badgeText) && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{subtext}</span>
          {badgeText && (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
