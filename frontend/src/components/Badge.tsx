import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid';

type BadgeVariant = 'authentic' | 'tampered' | 'pending' | 'unknown';

interface BadgeProps {
  variant: BadgeVariant;
  text?: string;
  className?: string;
}

const config = {
  authentic: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    icon: CheckCircleIcon,
    defaultText: 'Authentic',
    animate: false,
  },
  tampered: {
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/20',
    icon: XCircleIcon,
    defaultText: 'Tampered',
    animate: true,
  },
  pending: {
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    icon: ExclamationTriangleIcon,
    defaultText: 'Pending',
    animate: false,
  },
  unknown: {
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/20',
    icon: QuestionMarkCircleIcon,
    defaultText: 'Unknown',
    animate: false,
  }
};

const Badge = ({ variant, text, className = '' }: BadgeProps) => {
  const { color, bg, border, icon: Icon, defaultText, animate } = config[variant];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${border} ${color} ${className}`}>
      {animate ? (
        <div className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 bg-current`}></span>
        </div>
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      {text || defaultText}
    </div>
  );
};

export default Badge;
