import React from 'react';

export const BannerAd = () => {
  return (
    <div className="w-full bg-white border-b border-slate-200 p-2 flex items-center justify-center h-16 shrink-0 relative z-20 shadow-sm">
      <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3">
        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
        Advertisement
        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
      </div>
    </div>
  );
};
