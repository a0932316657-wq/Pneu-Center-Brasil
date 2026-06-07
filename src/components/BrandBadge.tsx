import React from 'react';
import { getBrands } from '../lib/appStore';

interface BrandBadgeProps {
  brandName: string;
}

export default function BrandBadge({ brandName }: BrandBadgeProps) {
  if (!brandName || !brandName.trim()) return null;

  const trimmedName = brandName.trim();
  
  // Find brand by ignoring-case & extra spaces
  const allBrands = getBrands();
  const match = allBrands.find(
    (b) => b.name.trim().toLowerCase() === trimmedName.toLowerCase()
  );

  // Use logo only if brand is active and has a valid logo
  const logoUrl = match && match.active && match.logo && match.logo.trim() ? match.logo.trim() : null;

  return (
    <div
      className="absolute top-2.5 left-2.5 z-10 flex items-center justify-center rounded-lg bg-white/90 dark:bg-slate-900/85 backdrop-blur-xs px-2 py-1 shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 max-w-[85px] h-[26px]"
      title={trimmedName}
    >
      {logoUrl ? (
        <img
          src={logoUrl || null}
          alt={trimmedName}
          className="max-h-full max-w-full object-contain filter hover:brightness-105 transition-all"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to text if image error
            (e.target as HTMLImageElement).style.display = 'none';
            const textNode = document.createElement('span');
            textNode.className = 'text-[10px] font-bold text-slate-800 dark:text-orange-400 uppercase tracking-wider truncate max-w-full';
            textNode.innerText = trimmedName;
            e.currentTarget.parentElement?.appendChild(textNode);
          }}
        />
      ) : (
        <span className="text-[10px] font-bold text-slate-800 dark:text-orange-400 uppercase tracking-widest truncate max-w-full font-mono">
          {trimmedName}
        </span>
      )}
    </div>
  );
}
