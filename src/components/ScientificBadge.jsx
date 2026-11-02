import React from 'react';
import { ShieldCheck, AlertTriangle, Cpu } from 'lucide-react';

export default function ScientificBadge({ status = 'verified', size = 'sm', showText = true }) {
  if (status === 'verified') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}>
        <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {showText && <span>Verified ARAI/CPCB Standard</span>}
      </span>
    );
  }

  if (status === 'custom') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800 ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}>
        <Cpu className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {showText && <span>User Configured Parameter</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 ${
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    }`}>
      <AlertTriangle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {showText && <span>Pending Scientific Verification</span>}
    </span>
  );
}
