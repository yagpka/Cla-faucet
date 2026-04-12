import React, { useEffect, useRef } from 'react';

export const AdBanner = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    
    // Clear previous content to prevent duplicates
    bannerRef.current.innerHTML = '';

    const conf = document.createElement('script');
    conf.type = 'text/javascript';
    conf.innerHTML = `
      atOptions = {
        'key' : '8e484b640909cc8255d4195f003d22f0',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highperformanceformat.com/8e484b640909cc8255d4195f003d22f0/invoke.js';

    bannerRef.current.appendChild(conf);
    bannerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center my-6 w-full overflow-hidden min-h-[250px] relative z-20">
      <div ref={bannerRef} className="w-[300px] h-[250px] bg-slate-100/50 rounded-xl flex items-center justify-center">
        <span className="text-slate-400 text-sm">Loading Ad...</span>
      </div>
    </div>
  );
};
