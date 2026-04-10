import React from 'react';
import { useGame } from '../lib/store';
import { PlaySquare, Coins, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const AD_TYPES = [
  { id: 1, name: "Quick Ad 1", reward: 4, max: 20 },
  { id: 2, name: "Quick Ad 2", reward: 4, max: 20 },
  { id: 3, name: "Standard Ad 1", reward: 5, max: 20 },
  { id: 4, name: "Standard Ad 2", reward: 5, max: 20 },
  { id: 5, name: "Standard Ad 3", reward: 5, max: 20 },
  { id: 6, name: "Premium Ad 1", reward: 6, max: 20 },
  { id: 7, name: "Premium Ad 2", reward: 6, max: 20 },
  { id: 8, name: "Premium Ad 3", reward: 6, max: 20 },
  { id: 9, name: "Video Ad 1", reward: 7, max: 20 },
  { id: 10, name: "Video Ad 2", reward: 7, max: 20 },
];

export const WatchAds = () => {
  const { state, showAd, claimWatchAd } = useGame();

  const handleWatch = (index: number, reward: number) => {
    if (state.watchAdsProgress[index] >= AD_TYPES[index].max) return;
    
    const adIds = ['int-27388', 'int-27389', 'int-27390', 'int-27391', 'int-27392'];
    const adId = adIds[index % 5];
    
    showAd(adId, () => {
      claimWatchAd(index, reward);
    });
  };

  const totalEarnedToday = AD_TYPES.reduce((sum, ad, i) => sum + (state.watchAdsProgress[i] * ad.reward), 0);

  return (
    <div className="p-6 pb-32 h-full overflow-y-auto perspective-1000">
      <div className="mb-8 mt-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Watch & Earn</h2>
        <p className="text-slate-500 text-sm">Watch ads to earn up to 1,100 DRP daily.</p>
        
        <motion.div 
          whileHover={{ rotateX: 5, rotateY: -5 }}
          className="mt-6 bg-indigo-600 rounded-[24px] p-6 flex justify-between items-center shadow-[0_10px_30px_rgba(79,70,229,0.3)] relative overflow-hidden preserve-3d"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
            <div className="text-indigo-200 text-sm mb-1">Earned Today</div>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              {totalEarnedToday} <span className="text-lg text-indigo-200">DRP</span>
            </div>
          </div>

          <motion.div 
            animate={{ rotateY: 360, y: [-5, 5, -5] }} 
            transition={{ 
              rotateY: { duration: 6, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm preserve-3d relative z-10 border border-white/30"
          >
            <Coins size={32} className="text-white" style={{ transform: 'translateZ(15px)' }} />
          </motion.div>
        </motion.div>
      </div>

      <div className="space-y-4">
        {AD_TYPES.map((ad, index) => {
          const progress = state.watchAdsProgress[index];
          const isMaxed = progress >= ad.max;

          return (
            <motion.div 
              key={ad.id} 
              whileHover={!isMaxed ? { scale: 1.02, rotateX: 2 } : {}}
              className="bg-white border border-slate-200 rounded-[24px] p-5 flex flex-col relative overflow-hidden shadow-sm preserve-3d transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-center mb-4 relative z-10" style={{ transform: 'translateZ(10px)' }}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isMaxed ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50 border-indigo-100'}`}>
                    {isMaxed ? <CheckCircle2 size={20} className="text-slate-400" /> : <PlaySquare size={20} className="text-indigo-500" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{ad.name}</h3>
                    <div className="text-indigo-600 font-medium text-sm">+{ad.reward} DRP</div>
                  </div>
                </div>
                <motion.button
                  whileTap={!isMaxed ? { scale: 0.9 } : {}}
                  onClick={() => handleWatch(index, ad.reward)}
                  disabled={isMaxed}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all preserve-3d ${
                    isMaxed 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                      : 'bg-indigo-600 text-white shadow-[0_5px_15px_rgba(79,70,229,0.3)] hover:bg-indigo-500'
                  }`}
                >
                  <span style={{ transform: 'translateZ(5px)' }}>{isMaxed ? 'Done' : 'Watch'}</span>
                </motion.button>
              </div>

              <div className="flex items-center gap-3 relative z-10" style={{ transform: 'translateZ(5px)' }}>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all" 
                    style={{ width: `${(progress / ad.max) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs font-bold text-slate-400 w-10 text-right">
                  {progress}/{ad.max}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};


