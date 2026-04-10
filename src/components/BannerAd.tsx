import React, { useEffect, useRef } from 'react';

export const BannerAd = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    
    // Prevent duplicate script injections
    if (bannerRef.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = '//pl29111815.profitablecpmratenetwork.com/403ef7ff7f15d6b55831fb8bdc09479e/invoke.js';
    
    bannerRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full bg-white border-b border-slate-200 p-2 flex items-center justify-center min-h-[64px] shrink-0 relative z-20 shadow-sm">
      <div id="container-403ef7ff7f15d6b55831fb8bdc09479e" ref={bannerRef}></div>
    </div>
  );
};
