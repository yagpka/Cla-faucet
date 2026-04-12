import React, { useState } from 'react';
import { useGame } from '../lib/store';
import { sounds } from '../lib/sounds';
import { AdBanner } from '../components/AdBanner';
import { Flame, Coins, PlaySquare, Zap, Pickaxe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Cube = ({ className, delay = 0 }: { className?: string, delay?: number }) => (
  <div 
    className={`w-12 h-12 relative preserve-3d animate-spin-3d ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 backdrop-blur-md rounded-xl" style={{ transform: 'translateZ(24px)' }}></div>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 backdrop-blur-md rounded-xl" style={{ transform: 'translateZ(-24px)' }}></div>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 backdrop-blur-md rounded-xl" style={{ transform: 'rotateY(90deg) translateZ(24px)' }}></div>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 backdrop-blur-md rounded-xl" style={{ transform: 'rotateY(90deg) translateZ(-24px)' }}></div>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 backdrop-blur-md rounded-xl" style={{ transform: 'rotateX(90deg) translateZ(24px)' }}></div>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 backdrop-blur-md rounded-xl" style={{ transform: 'rotateX(90deg) translateZ(-24px)' }}></div>
  </div>
);

export const Home = () => {
  const { state, showAd, claimMine, watchAdForTaps, setSelectedMiningCoin } = useGame();
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number; reward: number; coin: string }[]>([]);
  const [isMining, setIsMining] = useState(false);

  const executeMine = (clientX: number, clientY: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const reward = claimMine();
    if (state.selectedMiningCoin === 'DRP') {
      sounds.playCoin();
    } else {
      sounds.playTap();
    }
    const id = Date.now();
    setClicks(prev => [...prev, { id, x, y, reward, coin: state.selectedMiningCoin }]);
    setIsMining(true);
    setTimeout(() => setIsMining(false), 600); // Extended slightly for the new DRP animation
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== id));
    }, 1000);
  };

  const handleMine = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (state.selectedMiningCoin === 'DRP') {
      sounds.playClick();
      // DRP mining requires watching an ad and doesn't consume taps
      showAd('int-27386', () => {
        executeMine(clientX, clientY, rect);
      });
    } else {
      // Crypto mining consumes taps
      if (state.availableTaps <= 0) return;
      executeMine(clientX, clientY, rect);
    }
  };

  const handleWatchAdForTaps = () => {
    sounds.playClick();
    showAd('int-27388', () => {
      sounds.playSuccess();
      watchAdForTaps();
    });
  };

  const coins = ['DRP', 'TON', 'SOL', 'USDT', 'BNB'] as const;
  const isDrp = state.selectedMiningCoin === 'DRP';

  return (
    <div className="flex flex-col h-full p-6 relative overflow-y-auto pb-32 perspective-1000">
      
      <div className="mt-4 mb-6 relative z-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Cla_faucet
        </h1>
        <p className="text-slate-500 text-sm">Select a coin, get taps, and start mining! 🐰✨</p>
      </div>

      {/* Coin Selector */}
      <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm mb-6 relative z-20">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {coins.map(coin => (
            <button
              key={coin}
              onClick={() => setSelectedMiningCoin(coin as any)}
              className={`flex-1 min-w-[60px] py-2.5 rounded-[16px] font-bold text-sm transition-all whitespace-nowrap ${
                state.selectedMiningCoin === coin 
                  ? (coin === 'DRP' ? 'bg-yellow-500 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md')
                  : 'bg-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              {coin}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative mb-8">
        
        {/* Floating 3D Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-4 left-4 animate-float" style={{ animationDelay: '0s' }}>
            <Cube className="scale-75 opacity-80" delay={0} />
          </div>
          <div className="absolute bottom-20 right-4 animate-float" style={{ animationDelay: '-2s' }}>
            <Cube className="scale-100 opacity-90" delay={-4} />
          </div>
          <div className="absolute top-32 right-10 animate-float" style={{ animationDelay: '-4s' }}>
            <div className={`w-10 h-10 rounded-full blur-[2px] animate-spin-3d ${isDrp ? 'bg-gradient-to-tr from-yellow-400 to-orange-400' : 'bg-gradient-to-tr from-indigo-400 to-purple-400'}`} style={{ animationDelay: '-2s' }}></div>
          </div>
        </div>

        {/* Taps Indicator (Hide for DRP since it uses ads directly) */}
        {!isDrp && (
          <div className="bg-white/90 backdrop-blur-md border border-indigo-100 px-6 py-2 rounded-full shadow-sm mb-4 relative z-20 flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" />
            <span className="font-bold text-slate-700">Available Taps:</span>
            <span className="font-black text-indigo-600 text-lg">{state.availableTaps}</span>
          </div>
        )}
        {isDrp && (
          <div className="bg-white/90 backdrop-blur-md border border-yellow-200 px-6 py-2 rounded-full shadow-sm mb-4 relative z-20 flex items-center gap-2">
            <PlaySquare size={18} className="text-yellow-500" />
            <span className="font-bold text-slate-700">Watch Ad to Mine</span>
          </div>
        )}

        {/* Mining Area */}
        <motion.div
          onClick={handleMine}
          whileHover={(isDrp || state.availableTaps > 0) ? { scale: 1.05 } : {}}
          whileTap={(isDrp || state.availableTaps > 0) ? { scale: 0.9 } : {}}
          animate={
            isDrp 
            ? {
                // Distinct DRP Animation: Super Jump + Backflip
                y: isMining ? [0, -120, 0] : [0, -20, 0],
                rotateX: isMining ? [0, -360] : [0, 15, 0],
                rotateY: isMining ? [0, 360] : [0, 20, -20, 0],
                scale: isMining ? [1, 1.4, 1] : 1
              }
            : { 
                // Standard Crypto Animation: Small hop + Spin
                y: isMining ? -40 : [0, -15, 0],
                rotateY: isMining ? [0, 360] : [0, 10, -10, 0],
                rotateX: isMining ? [0, 20, 0] : 0,
                scale: isMining ? [1, 1.2, 1] : 1
              }
          }
          transition={
            isDrp
            ? {
                y: isMining ? { duration: 0.6, ease: "easeInOut" } : { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotateX: isMining ? { duration: 0.6, ease: "easeInOut" } : { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotateY: isMining ? { duration: 0.6, ease: "easeInOut" } : { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scale: isMining ? { duration: 0.6, ease: "easeInOut" } : { duration: 0 }
              }
            : { 
                y: isMining ? { duration: 0.4, ease: "easeOut" } : { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotateY: isMining ? { duration: 0.4, ease: "easeInOut" } : { duration: 6, repeat: Infinity, ease: "easeInOut" },
                rotateX: isMining ? { duration: 0.4 } : { duration: 0 },
                scale: isMining ? { duration: 0.4 } : { duration: 0 }
              }
          }
          className={`relative w-64 h-64 flex items-center justify-center preserve-3d z-10 ${(isDrp || state.availableTaps > 0) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50 grayscale'}`}
        >
          {/* 3D Glowing Aura */}
          <div className={`absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse ${isDrp ? 'bg-gradient-to-tr from-yellow-400 to-orange-500' : 'bg-gradient-to-tr from-indigo-400 to-purple-400'}`}></div>
          
          {/* 3D Character Representation */}
          <div className="relative z-10 preserve-3d flex items-center justify-center">
            <div className={`text-[140px] select-none preserve-3d relative z-20 ${isDrp ? 'drop-shadow-[0_20px_40px_rgba(234,179,8,0.6)]' : 'drop-shadow-[0_20px_30px_rgba(79,70,229,0.4)]'}`}>
              🐰
            </div>
            {/* 3D Base/Shadow under rabbit */}
            <div className="absolute -bottom-4 w-32 h-8 bg-black/10 rounded-[100%] blur-md" style={{ transform: 'rotateX(70deg) translateZ(-50px)' }}></div>
          </div>
          
          {/* Orbiting rings */}
          <div className={`absolute inset-0 rounded-full border-2 animate-spin-3d preserve-3d ${isDrp ? 'border-yellow-500/40' : 'border-indigo-500/20'}`} style={{ animationDuration: isDrp ? '6s' : '10s' }}></div>
          <div className={`absolute inset-4 rounded-full border animate-spin-3d preserve-3d ${isDrp ? 'border-orange-500/50' : 'border-purple-500/30'}`} style={{ animationDuration: isDrp ? '4s' : '7s', animationDirection: 'reverse' }}></div>
        </motion.div>

        {/* Tap Instruction */}
        <div className="mt-4 text-slate-400 font-medium text-sm flex items-center gap-1 relative z-20">
          <Pickaxe size={16} /> Tap the rabbit to mine {state.selectedMiningCoin}
        </div>

        <AnimatePresence>
          {clicks.map(click => (
            <motion.div
              key={click.id}
              initial={{ opacity: 1, y: click.y - 20, x: click.x - 20, scale: 0.5, rotateZ: Math.random() * 40 - 20 }}
              animate={{ opacity: 0, y: click.y - 150, scale: 1.5, rotateZ: Math.random() * 40 - 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`absolute text-xl font-black pointer-events-none drop-shadow-[0_5px_10px_rgba(0,0,0,0.1)] flex items-center gap-1 z-50 whitespace-nowrap ${click.coin === 'DRP' ? 'text-yellow-500' : 'text-indigo-600'}`}
            >
              +{click.coin === 'DRP' ? click.reward : click.reward.toFixed(8)} {click.coin}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Get Taps Button (Only show if not DRP) */}
      {!isDrp && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleWatchAdForTaps}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-[24px] font-bold text-lg shadow-[0_10px_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 mb-8 relative z-20"
        >
          <PlaySquare size={24} /> Watch Ad for +100 Taps
        </motion.button>
      )}

      <AdBanner />

      <div className="grid grid-cols-2 gap-4 w-full relative z-20 mt-4">
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-[24px] border border-slate-200 flex flex-col shadow-lg">
          <div className="text-slate-500 text-sm mb-2">Mine Clicks Today</div>
          <div className="text-3xl font-bold text-slate-900">{state.mineClicksToday}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-[24px] border border-slate-200 flex flex-col shadow-lg">
          <div className="text-slate-500 text-sm mb-2 flex items-center gap-1">
            <Flame size={14} className="text-orange-500" /> Streak
          </div>
          <div className="text-3xl font-bold text-slate-900">{state.faucetStreak} <span className="text-lg text-slate-400">Days</span></div>
        </div>
      </div>
    </div>
  );
};


