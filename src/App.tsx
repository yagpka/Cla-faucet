import React, { useState } from 'react';
import { GameProvider, useGame } from './lib/store';
import { sounds } from './lib/sounds';
import { Home } from './screens/Home';
import { Faucet } from './screens/Faucet';
import { WatchAds } from './screens/WatchAds';
import { Tasks } from './screens/Tasks';
import { Leaderboard } from './screens/Leaderboard';
import { Wallet } from './screens/Wallet';
import { Home as HomeIcon, Droplets, PlaySquare, CheckSquare, Trophy, Wallet as WalletIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TABS = [
  { id: 'home', label: 'Mine', icon: HomeIcon },
  { id: 'faucet', label: 'Faucet', icon: Droplets },
  { id: 'ads', label: 'Ads', icon: PlaySquare },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'leaderboard', label: 'Top', icon: Trophy },
  { id: 'wallet', label: 'Wallet', icon: WalletIcon },
];

const cubeVariants = {
  initial: (direction: number) => ({
    rotateY: direction > 0 ? 90 : -90,
    opacity: 0,
    z: -300,
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
    z: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -90 : 90,
    opacity: 0,
    z: -300,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  })
};

function AppContent() {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState('home');
  const [direction, setDirection] = useState(0);
  const [showPopup, setShowPopup] = useState(true);

  const handleTabChange = (newTabId: string) => {
    sounds.playClick();
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    const newIndex = TABS.findIndex(t => t.id === newTabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTabId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans overflow-hidden max-w-md mx-auto relative shadow-2xl perspective-1000">
      {/* Announcement Strip */}
      <div className="bg-indigo-600 text-white text-xs font-bold py-1.5 overflow-hidden whitespace-nowrap relative z-50 shadow-md">
        <div className="animate-marquee inline-block">
          🚀 SOL withdrawals are now open! 🚀 Keep mining and complete tasks to withdraw! 🚀 SOL withdrawals are now open! 🚀 Keep mining and complete tasks to withdraw! 🚀
        </div>
      </div>

      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
      
      <main className="flex-1 overflow-hidden relative z-10 preserve-3d">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={cubeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 w-full h-full origin-center preserve-3d bg-slate-50"
          >
            {activeTab === 'home' && <Home />}
            {activeTab === 'faucet' && <Faucet />}
            {activeTab === 'ads' && <WatchAds />}
            {activeTab === 'tasks' && <Tasks />}
            {activeTab === 'leaderboard' && <Leaderboard />}
            {activeTab === 'wallet' && <Wallet />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full px-4 py-3 z-40 shadow-xl">
        <div className="flex justify-between items-center">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={isActive ? 20 : 24} className={isActive ? 'fill-white/20' : ''} />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Jackpot Event Popup */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none"></div>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="text-4xl">🎰</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Jackpot Event Upcoming!</h2>
              <p className="text-slate-500 mb-6">
                A massive Jackpot event will be opened after our user base touches <strong className="text-amber-500">100 users</strong>. Invite your friends to reach the goal faster!
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8">
                <div className="text-sm text-slate-500 mb-1 font-bold">Current User Base</div>
                <div className="text-3xl font-black text-slate-900">{state.totalUsers} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (state.totalUsers / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <button 
                onClick={() => {
                  sounds.playClick();
                  setShowPopup(false);
                }}
                className="w-full bg-amber-500 text-white font-bold py-4 rounded-full shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:bg-amber-600 transition-colors"
              >
                Let's Go!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
