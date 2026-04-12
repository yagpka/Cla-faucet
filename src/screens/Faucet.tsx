import React, { useState, useEffect } from 'react';
import { useGame } from '../lib/store';
import { sounds } from '../lib/sounds';
import { AdBanner } from '../components/AdBanner';
import { Droplets, Flame, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export const Faucet = () => {
  const { state, showAd, claimFaucet } = useGame();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((state.faucetNextClaimTime - now) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [state.faucetNextClaimTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClaim = () => {
    if (timeLeft > 0 || state.faucetClaimsToday >= 96) return;
    sounds.playClick();
    showAd('int-27387', () => {
      sounds.playSuccess();
      claimFaucet();
    });
  };

  const isStreakActive = state.faucetStreak >= 7;
  const currentReward = isStreakActive ? 30 : 15;

  return (
    <div className="flex flex-col items-center p-6 h-full overflow-y-auto pb-32 perspective-1000">
      <div className="w-full mt-4 mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-1">Faucet</h2>
        <p className="text-slate-500 text-sm">Claim free DRP every 15 minutes</p>
      </div>

      <div className="w-full bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col items-center text-center relative overflow-hidden mb-6 shadow-xl preserve-3d">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
        
        {/* 3D Animated Droplet with Orbiting Rings and Particles */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-6 preserve-3d">
          {/* Ambient Glow */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-indigo-400/20 rounded-full blur-xl"
          />

          {/* Orbiting Rings */}
          <motion.div 
            animate={{ rotateX: 360, rotateY: 180, rotateZ: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-indigo-500/30 border-t-indigo-400 preserve-3d" 
          />
          <motion.div 
            animate={{ rotateX: -360, rotateY: 360, rotateZ: -180 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-b-purple-400 preserve-3d" 
          />
          <motion.div 
            animate={{ rotateX: 180, rotateY: -360, rotateZ: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border border-blue-400/20 border-l-blue-400 preserve-3d" 
          />
          
          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -50], 
                x: [0, (i % 2 === 0 ? 1 : -1) * (Math.random() * 25)],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                repeat: Infinity, 
                delay: i * 0.4,
                ease: "easeOut" 
              }}
              className="absolute w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"
              style={{ 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)' 
              }}
            />
          ))}

          {/* Core Droplet */}
          <motion.div 
            animate={{ y: [-8, 8, -8], rotateY: [0, 360], scale: [1, 1.05, 1] }} 
            transition={{ 
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 bg-gradient-to-br from-white to-slate-100 rounded-full flex items-center justify-center border border-white shadow-[0_10px_25px_rgba(99,102,241,0.4)] relative z-10 preserve-3d"
          >
            <Droplets size={32} className="text-indigo-600 drop-shadow-md" style={{ transform: 'translateZ(25px)' }} />
          </motion.div>
        </div>

        <div className="text-5xl font-bold text-slate-900 mb-6 tracking-tight relative z-10">
          {formatTime(timeLeft)}
        </div>

        <motion.button
          whileHover={timeLeft === 0 ? { scale: 1.05, rotateX: 10 } : {}}
          whileTap={timeLeft === 0 ? { scale: 0.95, rotateX: -10 } : {}}
          onClick={handleClaim}
          disabled={timeLeft > 0 || state.faucetClaimsToday >= 96}
          className={`w-full py-3.5 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 relative z-10 preserve-3d ${
            timeLeft === 0 && state.faucetClaimsToday < 96
              ? 'bg-indigo-600 text-white shadow-[0_10px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_25px_rgba(79,70,229,0.5)]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <span style={{ transform: 'translateZ(10px)' }}>
            {state.faucetClaimsToday >= 96 ? 'Daily Limit Reached' : 'Claim Now'}
          </span>
          {timeLeft === 0 && state.faucetClaimsToday < 96 && <ChevronRight size={20} style={{ transform: 'translateZ(10px)' }} />}
        </motion.button>

        <div className="mt-4 text-sm font-medium text-indigo-600 flex items-center gap-1 bg-indigo-50 px-4 py-2 rounded-full relative z-10">
          Reward: {currentReward} DRP
          {isStreakActive && <Flame size={14} className="text-orange-500 ml-1" />}
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-4 mt-4">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="text-slate-500 text-sm mb-1">Claims Today</div>
          <div className="text-2xl font-bold text-slate-900">{state.faucetClaimsToday} <span className="text-sm text-slate-400">/ 96</span></div>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="text-slate-500 text-sm mb-1">Current Streak</div>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {state.faucetStreak}
            {isStreakActive && <Flame size={20} className="text-orange-500" />}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

